import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, UserPlus } from 'lucide-react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const AdminRegisterPage = () => {
    const [formData, setFormData] = useState({ fullName: '', email: '', phone: '', password: '', confirmPassword: '', adminCode: '' });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const { setUserDirectly } = useAuth();

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (formData.password !== formData.confirmPassword) {
            return setError('Passwords do not match.');
        }

        setLoading(true);
        try {
            const res = await axios.post('http://localhost:5000/api/admin/register', {
                fullName: formData.fullName,
                email: formData.email,
                phone: formData.phone,
                password: formData.password,
                adminCode: formData.adminCode
            });

            const { token, user } = res.data;
            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(user));
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            setUserDirectly(user);
            navigate('/admin/dashboard');
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh', padding: '2rem' }}>
            <motion.div className="glass-card" style={{ width: '100%', maxWidth: '460px', padding: '2.5rem' }} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                {/* Header */}
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 60, height: 60, borderRadius: '50%', background: 'rgba(167,139,250,0.15)', marginBottom: '1rem' }}>
                        <Shield size={28} color="#A78BFA" />
                    </div>
                    <h2 style={{ fontSize: '1.75rem', marginBottom: '0.25rem' }}>Admin Registration</h2>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Create an admin account for Clean City Connect</p>
                </div>

                {error && (
                    <div style={{ background: 'rgba(239,68,68,0.1)', color: '#EF4444', padding: '0.75rem 1rem', borderRadius: '0.5rem', marginBottom: '1.25rem', fontSize: '0.85rem' }}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <input type="text" name="fullName" placeholder="Full Name" onChange={handleChange} className="input-field" required />
                    <input type="email" name="email" placeholder="Email Address" onChange={handleChange} className="input-field" required />
                    <input type="text" name="phone" placeholder="Phone Number" onChange={handleChange} className="input-field" required />
                    <input type="password" name="password" placeholder="Password" onChange={handleChange} className="input-field" required />
                    <input type="password" name="confirmPassword" placeholder="Confirm Password" onChange={handleChange} className="input-field" required />

                    {/* Admin secret code for verification */}
                    <div>
                        <input
                            type="password"
                            name="adminCode"
                            placeholder="Admin Access Code (required)"
                            onChange={handleChange}
                            className="input-field"
                            required
                            style={{ borderColor: 'rgba(167,139,250,0.4)' }}
                        />
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem', paddingLeft: '0.25rem' }}>
                            Contact your system administrator for the access code.
                        </p>
                    </div>

                    <button type="submit" className="btn-primary" disabled={loading} style={{ marginTop: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', background: 'linear-gradient(135deg, #7C3AED, #A78BFA)' }}>
                        <UserPlus size={18} />
                        {loading ? 'Creating Account...' : 'Create Admin Account'}
                    </button>

                    <p style={{ textAlign: 'center', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                        Already have an account? <span onClick={() => navigate('/admin/login')} style={{ color: '#A78BFA', cursor: 'pointer' }}>Login</span>
                    </p>
                </form>
            </motion.div>
        </div>
    );
};

export default AdminRegisterPage;
