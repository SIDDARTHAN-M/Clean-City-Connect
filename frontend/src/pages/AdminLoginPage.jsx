import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, LogIn } from 'lucide-react';
import api from '../utils/api';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const AdminLoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const { setUserDirectly } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const res = await api.post('/admin/login', { email, password });
            const { token, user } = res.data;

            // Store credentials
            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(user));
            setUserDirectly(user);

            navigate('/admin/dashboard');
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed. Check credentials.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh', padding: '2rem' }}>
            <motion.div
                className="glass-card"
                style={{ width: '100%', maxWidth: '420px', padding: '2.5rem' }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                {/* Header */}
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 60, height: 60, borderRadius: '50%', background: 'rgba(167,139,250,0.15)', marginBottom: '1rem' }}>
                        <Shield size={28} color="#A78BFA" />
                    </div>
                    <h2 style={{ fontSize: '1.75rem', marginBottom: '0.25rem' }}>Admin Portal</h2>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Restricted access — authorized personnel only</p>
                </div>

                {error && (
                    <div style={{ background: 'rgba(239,68,68,0.1)', color: '#EF4444', padding: '0.75rem 1rem', borderRadius: '0.5rem', marginBottom: '1.25rem', fontSize: '0.85rem' }}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Admin Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="input-field"
                            required
                            placeholder="admin@cleancityconnect.com"
                        />
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="input-field"
                            required
                            placeholder="••••••••"
                        />
                    </div>
                    <button
                        type="submit"
                        className="btn-primary"
                        disabled={loading}
                        style={{ marginTop: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', background: 'linear-gradient(135deg, #7C3AED, #A78BFA)' }}
                    >
                        <LogIn size={18} />
                        {loading ? 'Authenticating...' : 'Login to Admin Panel'}
                    </button>
                </form>

                <p style={{ textAlign: 'center', fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '1.5rem' }}>
                    No registration available. Contact your system administrator for access.
                </p>
            </motion.div>
        </div>
    );
};

export default AdminLoginPage;
