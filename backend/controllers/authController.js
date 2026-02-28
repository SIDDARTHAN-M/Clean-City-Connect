const User = require('../models/User');
const supabase = require('../config/supabase');
const jwt = require('jsonwebtoken');

const register = async (req, res) => {
    try {
        const { email, password, fullName, role, phone, area, workerId } = req.body;

        // 1. Create User in Supabase Auth
        const { data: authData, error: authError } = await supabase.auth.signUp({
            email,
            password,
        });

        if (authError) return res.status(400).json({ message: authError.message });

        // 2. Create User in MongoDB
        const user = new User({
            fullName,
            email,
            phone,
            password, // still saving hashed in Mongo for flexibility/legacy
            role,
            area,
            workerId
        });
        await user.save();

        const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1d' });
        res.status(201).json({ token, user: { id: user._id, fullName: user.fullName, role: user.role, area: user.area } });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // 1. Authenticate with Supabase Auth
        const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (authError) return res.status(401).json({ message: 'Invalid credentials' });

        // 2. Fetch User from MongoDB
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'User profile not found. Please re-register.' });
        }

        const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1d' });
        res.json({ token, user: { id: user._id, fullName: user.fullName, role: user.role, area: user.area } });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

module.exports = { register, login };

