import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';

const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();
    const query = new URLSearchParams(useLocation().search);
    const role = query.get('role') || 'civilian';

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const user = await login(email, password);
            if (user.role === 'admin') navigate('/admin/dashboard');
            else if (user.role === 'worker') navigate('/worker');
            else navigate('/civilian');
        } catch (err) {
            alert('Login failed: ' + (err.response?.data?.message || err.message));
        }
    };

    return (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem 2rem' }}>
            <motion.div
                className="glass-card"
                style={{ width: '100%', maxWidth: '400px', padding: '2.5rem' }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <h2 style={{ marginBottom: '0.5rem', fontSize: '1.75rem' }}>{role.charAt(0).toUpperCase() + role.slice(1)} Login</h2>
                <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>Welcome back to Clean City Connect</p>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Email Address</label>
                        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="input-field" required placeholder="name@example.com" />
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Password</label>
                        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="input-field" required placeholder="••••••••" />
                    </div>
                    <button type="submit" className="btn-primary" style={{ marginTop: '0.5rem' }}>Sign In</button>
                    <p style={{ textAlign: 'center', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                        Don't have an account? <span onClick={() => navigate(`/register?role=${role}`)} style={{ color: 'var(--primary)', cursor: 'pointer' }}>Register</span>
                    </p>
                </form>
            </motion.div>
        </div>
    );
};

export default LoginPage;
