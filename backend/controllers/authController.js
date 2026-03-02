const supabase = require('../config/supabase');

const register = async (req, res) => {
    try {
        const { email, password, fullName, role, phone, area, workerId } = req.body;

        // 1. Create User in Supabase Auth
        const { data: authData, error: authError } = await supabase.auth.signUp({
            email,
            password,
        });

        if (authError) return res.status(400).json({ message: authError.message });

        // 2. Create User Profile in Supabase Database
        const { error: profileError } = await supabase
            .from('users')
            .insert({
                id: authData.user.id,
                email,
                full_name: fullName,
                phone,
                role,
                area,
                worker_id: workerId
            });

        if (profileError) {
            console.error('Profile insertion error:', profileError);
            return res.status(500).json({ message: 'Error creating user profile' });
        }

        res.status(201).json({
            token: authData.session?.access_token || 'Verification email sent',
            user: { id: authData.user.id, fullName: fullName, role: role, area: area }
        });
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

        // 2. Fetch User Profile from Supabase Database
        const { data: user, error: userError } = await supabase
            .from('users')
            .select('*')
            .eq('email', email)
            .single();

        if (userError || !user) {
            return res.status(404).json({ message: 'User profile not found. Please re-register.' });
        }

        res.json({
            token: authData.session.access_token,
            user: { id: user.id, fullName: user.full_name, role: user.role, area: user.area }
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

module.exports = { register, login };

