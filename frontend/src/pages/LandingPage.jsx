import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Trash2, Shield, Users, MapPin, UserCheck } from 'lucide-react';

const LandingPage = () => {
    const navigate = useNavigate();

    return (
        <div style={{ padding: '4rem 2rem', maxWidth: '1200px', margin: '0 auto' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4rem', alignItems: 'center' }}>
                <motion.div initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8 }}>
                    <h1 style={{ fontSize: '3.5rem', fontWeight: '800', lineHeight: '1.1', marginBottom: '1.5rem', background: 'linear-gradient(to right, #10b981, #3b82f6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                        Clean City Connect — Smart Waste Management for a Better Tomorrow.
                    </h1>
                    <p style={{ fontSize: '1.2rem', color: 'var(--text-muted)', marginBottom: '2.5rem' }}>
                        Clean City Connect bridges citizens and waste management workers in real-time. Report issues, track progress, and help build a cleaner city.
                    </p>

                    {/* 3-option role selection */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>

                        {/* Civilian */}
                        <div style={{ display: 'flex', gap: '0.75rem' }}>
                            <button
                                onClick={() => navigate('/register?role=civilian')}
                                className="btn-primary"
                                style={{ flex: 1, fontSize: '1rem', padding: '0.85rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                            >
                                <Users size={18} /> Register as Civilian
                            </button>
                            <button
                                onClick={() => navigate('/login?role=civilian')}
                                className="btn-primary"
                                style={{ flex: 1, fontSize: '1rem', padding: '0.85rem', background: 'var(--bg-card)', border: '1px solid var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                            >
                                Login as Civilian
                            </button>
                        </div>

                        {/* Worker */}
                        <div style={{ display: 'flex', gap: '0.75rem' }}>
                            <button
                                onClick={() => navigate('/register?role=worker')}
                                className="btn-primary"
                                style={{ flex: 1, fontSize: '1rem', padding: '0.85rem', background: 'var(--secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                            >
                                <UserCheck size={18} /> Register as Worker
                            </button>
                            <button
                                onClick={() => navigate('/login?role=worker')}
                                className="btn-primary"
                                style={{ flex: 1, fontSize: '1rem', padding: '0.85rem', background: 'var(--bg-card)', border: '1px solid var(--secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                            >
                                Login as Worker
                            </button>
                        </div>

                        {/* Admin */}
                        <div style={{ display: 'flex', gap: '0.75rem', borderTop: '1px solid var(--glass-border)', paddingTop: '0.85rem' }}>
                            <button
                                onClick={() => navigate('/admin/register')}
                                className="btn-primary"
                                style={{ flex: 1, fontSize: '1rem', padding: '0.85rem', background: 'linear-gradient(135deg,#7C3AED,#A78BFA)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                            >
                                <Shield size={18} /> Register as Admin
                            </button>
                            <button
                                onClick={() => navigate('/admin/login')}
                                className="btn-primary"
                                style={{ flex: 1, fontSize: '1rem', padding: '0.85rem', background: 'var(--bg-card)', border: '1px solid #A78BFA', color: '#A78BFA', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                            >
                                Login as Admin
                            </button>
                        </div>
                    </div>
                </motion.div>

                {/* Right card */}
                <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8 }} className="glass-card" style={{ padding: '2rem', minHeight: '420px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center', gap: '1.5rem' }}>
                    <Trash2 size={70} color="var(--primary)" />
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', width: '100%' }}>
                        <div className="glass-card" style={{ padding: '1rem' }}>
                            <MapPin size={24} color="var(--primary)" />
                            <h3 style={{ marginTop: '0.5rem', fontSize: '0.95rem' }}>GPS Tracking</h3>
                        </div>
                        <div className="glass-card" style={{ padding: '1rem' }}>
                            <Shield size={24} color="var(--secondary)" />
                            <h3 style={{ marginTop: '0.5rem', fontSize: '0.95rem' }}>AI Verified</h3>
                        </div>
                        <div className="glass-card" style={{ padding: '1rem' }}>
                            <Users size={24} color="#A78BFA" />
                            <h3 style={{ marginTop: '0.5rem', fontSize: '0.95rem' }}>3 Roles</h3>
                        </div>
                        <div className="glass-card" style={{ padding: '1rem' }}>
                            <UserCheck size={24} color="var(--accent)" />
                            <h3 style={{ marginTop: '0.5rem', fontSize: '0.95rem' }}>Admin Review</h3>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default LandingPage;
