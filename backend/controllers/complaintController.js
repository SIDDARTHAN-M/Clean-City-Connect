const Complaint = require('../models/Complaint');
const User = require('../models/User');
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

        const complaint = new Complaint({
            ...req.body,
            location,
            imageUrl,
            reporter: req.user.id,
            status: 'Pending'
        });
        await complaint.save();
        res.status(201).json(complaint);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const getMyComplaints = async (req, res) => {
    try {
        const complaints = await Complaint.find({ reporter: req.user.id }).sort({ createdAt: -1 });

        const sanitized = complaints.map(c => {
            const obj = c.toObject();
            if (obj.adminApprovalStatus !== 'Approved') {
                obj.cleanedImageUrl = null;
                obj.workerCompletionComment = null;
            }
            return obj;
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

        const worker = await User.findById(req.user.id);
        if (!worker || !worker.area) {
            return res.status(400).json({ message: 'Worker area not defined' });
        }

        const visibleComplaints = await Complaint.find({
            $or: [
                { area: worker.area, status: 'Pending' },
                { status: { $in: ['In Progress', 'Awaiting Admin Review', 'Rework Required'] }, worker: worker._id }
            ]
        }).populate('reporter', 'fullName phone');

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
        if (status === 'In Progress') update.worker = req.user.id;

        if (status === 'Awaiting Admin Review') {
            if (!req.files || !req.files.completionImage) {
                return res.status(400).json({ message: 'Completion image is mandatory to close a job.' });
            }
            update.workerCompletionComment = workerCompletionComment || 'Completed';

            try {
                const result = await cloudinary.uploader.upload(req.files.completionImage.tempFilePath, {
                    folder: 'wastewatch_completed'
                });
                update.cleanedImageUrl = result.secure_url;
            } catch (uploadErr) {
                console.log("Cloudinary completion upload failed, using fallback.");
                update.cleanedImageUrl = "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=800";
            }
        }

        const complaint = await Complaint.findByIdAndUpdate(id, update, { new: true });
        res.json(complaint);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

module.exports = { createComplaint, getMyComplaints, getNearbyComplaints, updateStatus };

