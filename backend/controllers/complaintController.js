const supabase = require('../config/supabase');
const cloudinary = require('cloudinary').v2;

// Haversine formula to calculate distance between two lat/lng points in km
const getDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Radius of the earth in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
};

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

const createComplaint = async (req, res) => {
    try {
        if (!req.files || !req.files.image) {
            return res.status(400).json({ message: 'Image is required' });
        }

        const imageFile = req.files.image;
        let imageUrl = "https://images.unsplash.com/photo-1530587191325-3db32d826c18?auto=format&fit=crop&q=80&w=800";

        try {
            const result = await cloudinary.uploader.upload(imageFile.tempFilePath, {
                folder: 'wastewatch_reports'
            });
            imageUrl = result.secure_url;
        } catch (uploadErr) {
            console.log("Cloudinary upload failed, using fallback.");
        }

        let location = req.body.location;
        if (typeof location === 'string') {
            location = JSON.parse(location);
        }

        const { data, error } = await supabase
            .from('complaints')
            .insert({
                reporter_id: req.user.id,
                description: req.body.description,
                location: location,
                area: req.body.area,
                image_url: imageUrl,
                status: 'Pending'
            })
            .select()
            .single();

        if (error) throw error;
        res.status(201).json(data);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const getMyComplaints = async (req, res) => {
    try {
        const { data: complaints, error } = await supabase
            .from('complaints')
            .select('*')
            .eq('reporter_id', req.user.id)
            .order('created_at', { ascending: false });

        if (error) throw error;

        const sanitized = complaints.map(c => {
            if (c.admin_approval_status !== 'Approved') {
                return { ...c, cleaned_image_url: null, worker_completion_comment: null };
            }
            return c;
        });

        res.json(sanitized);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const getNearbyComplaints = async (req, res) => {
    try {
        const { lat, lng } = req.query;
        if (!lat || !lng) return res.status(400).json({ message: 'Location required' });

        // Fetch worker profile to get area
        const { data: worker, error: workerError } = await supabase
            .from('users')
            .select('area')
            .eq('id', req.user.id)
            .single();

        if (workerError || !worker || !worker.area) {
            return res.status(400).json({ message: 'Worker area not defined' });
        }

        // Fetch complaints that are either Pending in worker's area OR already assigned to this worker
        const { data: visibleComplaints, error: complaintsError } = await supabase
            .from('complaints')
            .select('*, users!complaints_reporter_id_fkey(full_name, phone)')
            .or(`and(area.eq.${worker.area},status.eq.Pending),worker_id.eq.${req.user.id}`);

        if (complaintsError) throw complaintsError;

        const nearby = visibleComplaints.filter(c => {
            const distance = getDistance(parseFloat(lat), parseFloat(lng), c.location.lat, c.location.lng);
            return distance <= 5;
        });

        res.json(nearby);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const updateStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, workerCompletionComment } = req.body;

        const update = { status };
        if (status === 'In Progress') update.worker_id = req.user.id;

        if (status === 'Awaiting Admin Review') {
            if (!req.files || !req.files.completionImage) {
                return res.status(400).json({ message: 'Completion image is mandatory to close a job.' });
            }
            update.worker_completion_comment = workerCompletionComment || 'Completed';

            try {
                const result = await cloudinary.uploader.upload(req.files.completionImage.tempFilePath, {
                    folder: 'wastewatch_completed'
                });
                update.cleaned_image_url = result.secure_url;
            } catch (uploadErr) {
                console.log("Cloudinary completion upload failed, using fallback.");
                update.cleaned_image_url = "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=800";
            }
        }

        const { data, error } = await supabase
            .from('complaints')
            .update(update)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        res.json(data);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

module.exports = { createComplaint, getMyComplaints, getNearbyComplaints, updateStatus };

