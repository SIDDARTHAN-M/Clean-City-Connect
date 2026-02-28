import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';

const RegisterPage = () => {
    const query = new URLSearchParams(useLocation().search);
    const role = query.get('role') || 'civilian';

    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        phone: '',
        password: '',
        address: '',
        workerId: '',
        assignedZone: '',
        role: role
    });

    const { register } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await register(formData);
            navigate(role === 'civilian' ? '/civilian' : '/worker');
        } catch (err) {
            alert('Registration failed: ' + (err.response?.data?.message || err.message));
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    return (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem 2rem' }}>
            <motion.div
                className="glass-card"
                style={{ width: '100%', maxWidth: '500px', padding: '2.5rem' }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <h2 style={{ marginBottom: '0.5rem', fontSize: '1.75rem' }}>{role.charAt(0).toUpperCase() + role.slice(1)} Registration</h2>
                <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>Join our community for a cleaner environment</p>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <input type="text" name="fullName" placeholder="Full Name" onChange={handleChange} className="input-field" required />
                    <input type="email" name="email" placeholder="Email Address" onChange={handleChange} className="input-field" required />
                    <input type="text" name="phone" placeholder="Phone Number" onChange={handleChange} className="input-field" required />
                    <input type="password" name="password" placeholder="Password" onChange={handleChange} className="input-field" required />

                    {role === 'civilian' ? (
                        <textarea name="address" placeholder="Home Address" onChange={handleChange} className="input-field" style={{ height: '80px' }} />
                    ) : (
                        <>
                            <input type="text" name="workerId" placeholder="Worker ID" onChange={handleChange} className="input-field" required />
                            <input type="text" name="assignedZone" placeholder="Assigned Zone" onChange={handleChange} className="input-field" required />
                            <input type="text" name="area" placeholder="Operating Area (e.g., Downtown)" onChange={handleChange} className="input-field" required />
                        </>
                    )}

                    <button type="submit" className="btn-primary" style={{ marginTop: '1rem' }}>Create Account</button>
                    <p style={{ textAlign: 'center', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                        Already have an account? <span onClick={() => navigate(`/login?role=${role}`)} style={{ color: 'var(--primary)', cursor: 'pointer' }}>Login</span>
                    </p>
                </form>
            </motion.div>
        </div>
    );
};

export default RegisterPage;
