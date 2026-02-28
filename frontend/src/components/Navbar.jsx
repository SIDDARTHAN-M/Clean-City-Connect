import React from 'react';
import { useAuth } from '../context/AuthContext';
import { LogOut, Trash2, User as UserIcon, Map as MapIcon } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const Navbar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <nav className="glass-card" style={{ margin: '1rem', padding: '1rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none', color: 'var(--primary)', fontWeight: 'bold', fontSize: '1.25rem' }}>
                <Trash2 size={24} />
                Clean City Connect
            </Link>

            <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
                {user ? (
                    <>
                        <Link to={user.role === 'admin' ? '/admin/dashboard' : user.role === 'civilian' ? '/civilian' : '/worker'} style={{ textDecoration: 'none', color: 'var(--text-main)', fontSize: '0.9rem' }}>
                            {user.role === 'admin' ? '🛡️ Admin Panel' : 'Dashboard'}
                        </Link>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--bg-card)', padding: '0.4rem 0.8rem', borderRadius: '2rem' }}>
                            <UserIcon size={16} />
                            <span style={{ fontSize: '0.85rem' }}>{user.fullName}</span>
                        </div>
                        <button onClick={handleLogout} className="btn-primary" style={{ padding: '0.4rem 1rem', background: 'var(--danger)' }}>
                            <LogOut size={16} />
                        </button>
                    </>
                ) : (
                    <>
                        <Link to="/login" style={{ textDecoration: 'none', color: 'var(--text-main)' }}>Login</Link>
                        <Link to="/register" className="btn-primary" style={{ textDecoration: 'none' }}>Get Started</Link>
                    </>
                )}
            </div>
        </nav>
    );
};

export default Navbar;
