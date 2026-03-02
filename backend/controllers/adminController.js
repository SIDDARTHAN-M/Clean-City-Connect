const supabase = require('../config/supabase');

// ─── POST /api/admin/login ────────────────────────────────────────────────────
const adminLogin = async (req, res) => {
    try {
        const { email, password } = req.body;

        // 1. Authenticate with Supabase Auth
        const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (authError) return res.status(401).json({ message: 'Invalid admin credentials' });

        // 2. Fetch User from Supabase and verify admin role
        const { data: user, error: userError } = await supabase
            .from('users')
            .select('*')
            .eq('email', email)
            .eq('role', 'admin')
            .single();

        if (userError || !user) return res.status(401).json({ message: 'Not authorized as admin' });

        res.json({ token: authData.session.access_token, user: { id: user.id, fullName: user.full_name, role: user.role } });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// ─── POST /api/admin/register ─────────────────────────────────────────────────
const adminRegister = async (req, res) => {
    try {
        const { fullName, email, phone, password, adminCode } = req.body;

        const validCode = process.env.ADMIN_ACCESS_CODE || 'ADMIN2025';
        if (adminCode !== validCode) {
            return res.status(403).json({ message: 'Invalid admin access code.' });
        }

        // 1. Create User in Supabase Auth
        const { data: authData, error: authError } = await supabase.auth.signUp({
            email,
            password,
        });

        if (authError) return res.status(400).json({ message: authError.message });

        // 2. Create Admin Profile in Supabase
        const { error: profileError } = await supabase
            .from('users')
            .insert({
                id: authData.user.id,
                email,
                full_name: fullName,
                phone,
                role: 'admin'
            });

        if (profileError) throw profileError;

        res.status(201).json({
            token: authData.session?.access_token || 'Verification email sent',
            user: { id: authData.user.id, fullName: fullName, role: 'admin' }
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// ─── GET /api/admin/workers ──────────────────────────────────────────────────
const getWorkers = async (req, res) => {
    try {
        const { data: workers, error } = await supabase
            .from('users')
            .select('*')
            .eq('role', 'worker');

        if (error) throw error;

        const enhancedWorkers = await Promise.all(workers.map(async (worker) => {
            // Count complaints assigned to this worker that are not completed
            const { count: assignedCount } = await supabase
                .from('complaints')
                .select('*', { count: 'exact', head: true })
                .eq('worker_id', worker.id)
                .neq('status', 'Completed');

            // Check if they have any 'In Progress' tasks
            const { count: inProgressCount } = await supabase
                .from('complaints')
                .select('*', { count: 'exact', head: true })
                .eq('worker_id', worker.id)
                .eq('status', 'In Progress');

            return {
                ...worker,
                fullName: worker.full_name, // Map for frontend convenience
                assignedCount: assignedCount || 0,
                activityStatus: (inProgressCount || 0) > 0 ? 'Working' : 'Idle'
            };
        }));

        res.json(enhancedWorkers);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// ─── GET /api/admin/complaints ───────────────────────────────────────────────
const getAllComplaints = async (req, res) => {
    try {
        const { status } = req.query;
        let query = supabase
            .from('complaints')
            .select(`
                *,
                reporter:users!complaints_reporter_id_fkey(full_name, phone, email),
                worker:users!complaints_worker_id_fkey(full_name, worker_id, phone, area)
            `)
            .order('created_at', { ascending: false });

        if (status) {
            query = query.eq('status', status);
        }

        const { data: complaints, error } = await query;
        if (error) throw error;

        // Flatten the joined data for frontend compatibility if needed
        const flattened = complaints.map(c => ({
            ...c,
            reporter: c.reporter,
            worker: c.worker
        }));

        res.json(flattened);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const approveComplaint = async (req, res) => {
    try {
        const { id } = req.params;
        const { data, error } = await supabase
            .from('complaints')
            .update({
                status: 'Completed',
                admin_approval_status: 'Approved',
                updated_at: new Date()
            })
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        res.json(data);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const rejectComplaint = async (req, res) => {
    try {
        const { id } = req.params;
        const { adminRemarks } = req.body;

        if (!adminRemarks || adminRemarks.trim() === '') {
            return res.status(400).json({ message: 'Admin remarks are required when rejecting.' });
        }

        const { data, error } = await supabase
            .from('complaints')
            .update({
                status: 'Rework Required',
                admin_approval_status: 'Rejected',
                admin_remarks: adminRemarks,
                updated_at: new Date()
            })
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        res.json(data);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

module.exports = { adminLogin, adminRegister, getWorkers, getAllComplaints, approveComplaint, rejectComplaint };


