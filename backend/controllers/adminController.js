const User = require('../models/User');
const Complaint = require('../models/Complaint');
const supabase = require('../config/supabase');
const jwt = require('jsonwebtoken');

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

        // 2. Fetch User from MongoDB and verify admin role
        const user = await User.findOne({ email, role: 'admin' });
        if (!user) return res.status(401).json({ message: 'Not authorized as admin' });

        const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1d' });
        res.json({ token, user: { id: user._id, fullName: user.fullName, role: user.role } });
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

        // 2. Create Admin in MongoDB
        const admin = new User({ fullName, email, phone, password, role: 'admin' });
        await admin.save();

        const token = jwt.sign({ id: admin._id, role: admin.role }, process.env.JWT_SECRET, { expiresIn: '1d' });
        res.status(201).json({ token, user: { id: admin._id, fullName: admin.fullName, role: admin.role } });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// ─── GET /api/admin/workers ──────────────────────────────────────────────────
const getWorkers = async (req, res) => {
    try {
        const workers = await User.find({ role: 'worker' }).select('-password');

        const enhancedWorkers = await Promise.all(workers.map(async (worker) => {
            const assignedCount = await Complaint.countDocuments({ worker: worker._id, status: { $ne: 'Completed' } });
            const inProgressCount = await Complaint.countDocuments({ worker: worker._id, status: 'In Progress' });
            return {
                ...worker.toObject(),
                assignedCount,
                activityStatus: inProgressCount > 0 ? 'Working' : 'Idle'
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
        const filter = status ? { status } : {};
        const complaints = await Complaint.find(filter)
            .populate('reporter', 'fullName phone email')
            .populate('worker', 'fullName workerId phone area')
            .sort({ createdAt: -1 });
        res.json(complaints);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const approveComplaint = async (req, res) => {
    try {
        const { id } = req.params;
        const complaint = await Complaint.findByIdAndUpdate(
            id,
            {
                status: 'Completed',
                adminApprovalStatus: 'Approved',
                adminReviewedAt: new Date()
            },
            { new: true }
        );
        if (!complaint) return res.status(404).json({ message: 'Complaint not found' });
        res.json(complaint);
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

        const complaint = await Complaint.findByIdAndUpdate(
            id,
            {
                status: 'Rework Required',
                adminApprovalStatus: 'Rejected',
                adminReviewedAt: new Date(),
                adminRemarks
            },
            { new: true }
        );
        if (!complaint) return res.status(404).json({ message: 'Complaint not found' });
        res.json(complaint);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

module.exports = { adminLogin, adminRegister, getWorkers, getAllComplaints, approveComplaint, rejectComplaint };


