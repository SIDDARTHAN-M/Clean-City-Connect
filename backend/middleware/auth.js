const supabase = require('../config/supabase');

const authenticate = async (req, res, next) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) return res.status(401).json({ message: 'No token, authorization denied' });

    try {
        const { data: { user }, error } = await supabase.auth.getUser(token);

        if (error || !user) {
            return res.status(401).json({ message: 'Token is not valid' });
        }

        // Fetch user profile from public.users to get the role
        const { data: profile, error: profileError } = await supabase
            .from('users')
            .select('role')
            .eq('id', user.id)
            .single();

        if (profileError || !profile) {
            return res.status(404).json({ message: 'User profile not found' });
        }

        req.user = { id: user.id, email: user.email, role: profile.role };
        next();
    } catch (err) {
        res.status(401).json({ message: 'Authentication error' });
    }
};

const authorize = (roles) => (req, res, next) => {
    if (!roles.includes(req.user.role)) {
        return res.status(403).json({ message: 'Access denied' });
    }
    next();
};

module.exports = { authenticate, authorize };
