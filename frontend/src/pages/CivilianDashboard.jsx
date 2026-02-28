import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, MapPin, Send, History, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import axios from 'axios';

const CivilianDashboard = () => {
    const [view, setView] = useState('report'); // 'report' or 'history'
    const [location, setLocation] = useState(null);
    const [description, setDescription] = useState('');
    const [area, setArea] = useState('');
    const [image, setImage] = useState(null);
    const [complaints, setComplaints] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (view === 'history') {
            fetchComplaints();
        }
    }, [view]);

    const fetchComplaints = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/complaints/my');
            setComplaints(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const detectLocation = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition((position) => {
                setLocation({
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                });
            }, () => {
                alert('Could not detect location. Please enable GPS.');
            });
        }
    };

    const handleReport = async (e) => {
        e.preventDefault();
        if (!location || !image || !area) return alert('Location, Area, and Image are required');

        setLoading(true);
        try {
            const formData = new FormData();
            formData.append('image', image);
            formData.append('location', JSON.stringify(location));
            formData.append('description', description);
            formData.append('area', area);

            await axios.post('http://localhost:5000/api/complaints', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            alert('Report submitted successfully!');
            setView('history');
            setImage(null);
            setDescription('');
            setArea('');
        } catch (err) {
            console.error(err);
            alert('Failed to submit report');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ padding: '2rem', maxWidth: '1000px', margin: '0 auto' }}>
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
                <button onClick={() => setView('report')} className={view === 'report' ? 'btn-primary' : 'btn-primary'} style={{ background: view === 'report' ? 'var(--primary)' : 'var(--bg-card)', border: view === 'report' ? 'none' : '1px solid var(--glass-border)' }}>
                    Report New
                </button>
                <button onClick={() => setView('history')} className={view === 'history' ? 'btn-primary' : 'btn-primary'} style={{ background: view === 'history' ? 'var(--primary)' : 'var(--bg-card)', border: view === 'history' ? 'none' : '1px solid var(--glass-border)' }}>
                    My Reports
                </button>
            </div>

            <AnimatePresence mode="wait">
                {view === 'report' ? (
                    <motion.div key="report" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="glass-card" style={{ padding: '2rem' }}>
                        <h2 style={{ marginBottom: '1.5rem' }}>Report Garbage</h2>
                        <form onSubmit={handleReport} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                            <div style={{ border: '2px dashed var(--glass-border)', borderRadius: '1rem', padding: '2rem', textAlign: 'center', cursor: 'pointer', position: 'relative' }}>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => setImage(e.target.files[0])}
                                    style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer' }}
                                />
                                {image ? (
                                    <div style={{ color: 'var(--primary)' }}>
                                        <CheckCircle size={40} style={{ margin: '0 auto 0.5rem auto' }} />
                                        <p>Image Selected: {image.name}</p>
                                    </div>
                                ) : (
                                    <div style={{ color: 'var(--text-muted)' }}>
                                        <Camera size={40} style={{ margin: '0 auto 0.5rem auto' }} />
                                        <p>Click to Upload Image</p>
                                    </div>
                                )}
                            </div>

                            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                <button type="button" onClick={detectLocation} className="btn-primary" style={{ background: 'var(--secondary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <MapPin size={18} /> Detect GPS
                                </button>
                                {location && <span style={{ color: 'var(--primary)', fontSize: '0.9rem' }}>Location Captured: {location.lat.toFixed(4)}, {location.lng.toFixed(4)}</span>}
                            </div>

                            <input
                                type="text"
                                placeholder="Locality / Area (e.g., Downtown)"
                                className="input-field"
                                value={area}
                                onChange={(e) => setArea(e.target.value)}
                                required
                            />

                            <textarea
                                placeholder="Describe the issue (e.g., Overfilled bin, illegal dumping...)"
                                className="input-field"
                                style={{ height: '120px' }}
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                            />

                            <button type="submit" className="btn-primary" disabled={loading} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem' }}>
                                <Send size={18} /> {loading ? 'Submitting...' : 'Submit Report'}
                            </button>
                        </form>
                    </motion.div>
                ) : (
                    <motion.div key="history" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                        <h2 style={{ marginBottom: '1.5rem' }}>Complaint History</h2>
                        <div style={{ display: 'grid', gap: '1rem' }}>
                            {complaints.length === 0 ? (
                                <p style={{ color: 'var(--text-muted)' }}>No reports found.</p>
                            ) : (
                                complaints.map(c => (
                                    <div key={c._id} className="glass-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                            <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
                                                <img src={c.imageUrl} alt="Garbage" style={{ width: '80px', height: '80px', borderRadius: '0.5rem', objectFit: 'cover' }} />
                                                <div>
                                                    <h4 style={{ marginBottom: '0.25rem' }}>{c.description || 'No description'}</h4>
                                                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{new Date(c.createdAt).toLocaleDateString()} • {c.area}</p>
                                                </div>
                                            </div>
                                            <div style={{ padding: '0.5rem 1rem', borderRadius: '2rem', fontSize: '0.8rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.5rem', background: c.status === 'Pending' ? 'rgba(245, 158, 11, 0.1)' : c.status === 'Completed' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(59, 130, 246, 0.1)', color: c.status === 'Pending' ? 'var(--accent)' : c.status === 'Completed' ? 'var(--primary)' : 'var(--secondary)' }}>
                                                {c.status === 'Pending' && <Clock size={14} />}
                                                {(c.status === 'In Progress' || c.status === 'Awaiting Admin Review' || c.status === 'Rework Required') && <AlertCircle size={14} />}
                                                {c.status === 'Completed' && <CheckCircle size={14} />}
                                                {c.status === 'Awaiting Admin Review' || c.status === 'Rework Required' ? 'Verifying Cleanup' : c.status}
                                            </div>
                                        </div>

                                        {c.status === 'Completed' && c.completionImage && (
                                            <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--glass-border)', display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                                                <img src={c.completionImage} alt="Completed by worker" style={{ width: '120px', height: '80px', borderRadius: '0.5rem', objectFit: 'cover' }} />
                                                <div>
                                                    <h5 style={{ color: 'var(--primary)', marginBottom: '0.25rem' }}>Worker's Response:</h5>
                                                    <p style={{ fontSize: '0.9rem', fontStyle: 'italic' }}>"{c.workerCompletionComment}"</p>
                                                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>Completed at: {new Date(c.updatedAt).toLocaleString()}</p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default CivilianDashboard;
