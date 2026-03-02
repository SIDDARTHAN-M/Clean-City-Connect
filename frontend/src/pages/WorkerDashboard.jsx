import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Navigation, CheckCircle, Clock, ExternalLink, Image as ImageIcon, Send } from 'lucide-react';
import api from '../utils/api';

const WorkerDashboard = () => {
    const [location, setLocation] = useState(null);
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    // State to track inline form inputs per job
    const [completionInputs, setCompletionInputs] = useState({});

    useEffect(() => {
        detectLocation();
    }, []);

    useEffect(() => {
        if (location) {
            fetchNearbyJobs();
        }
    }, [location]);

    const detectLocation = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition((position) => {
                setLocation({
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                });
            });
        }
    };

    const fetchNearbyJobs = async () => {
        try {
            const res = await api.get(`/complaints/nearby?lat=${location.lat}&lng=${location.lng}`);
            setJobs(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleAccept = async (id) => {
        try {
            await api.patch(`/complaints/${id}/status`, { status: 'In Progress' });
            fetchNearbyJobs();
        } catch (err) {
            alert('Failed to accept job');
        }
    };

    const handleInputChange = (jobId, field, value) => {
        setCompletionInputs(prev => ({
            ...prev,
            [jobId]: {
                ...(prev[jobId] || { comment: '', file: null }),
                [field]: value
            }
        }));
    };

    const handleSubmitCompletion = async (jobId) => {
        const input = completionInputs[jobId];
        if (!input || !input.file) {
            alert('Please upload a cleaned image proof.');
            return;
        }

        setLoading(true);
        try {
            const formData = new FormData();
            formData.append('status', 'Awaiting Admin Review');
            formData.append('workerCompletionComment', input.comment);
            formData.append('completionImage', input.file);

            await api.patch(`/complaints/${jobId}/status`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            // Clear inputs for this job
            const newInputs = { ...completionInputs };
            delete newInputs[jobId];
            setCompletionInputs(newInputs);

            fetchNearbyJobs();
            alert('Job submitted for admin review!');
        } catch (err) {
            console.error(err);
            alert('Failed to submit job: ' + (err.response?.data?.message || err.message));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ padding: '2rem', maxWidth: '1000px', margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h2 style={{ fontSize: '2rem' }}>Worker Dashboard</h2>
                {location && (
                    <div className="glass-card" style={{ padding: '0.5rem 1rem', fontSize: '0.9rem', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <MapPin size={16} /> Live Location Active
                    </div>
                )}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '1.5rem' }}>
                {loading && jobs.length === 0 ? (
                    <p>Detecting location and fetching jobs...</p>
                ) : jobs.length === 0 ? (
                    <p style={{ color: 'var(--text-muted)' }}>No jobs found within 5km radius.</p>
                ) : (
                    jobs.map(job => (
                        <motion.div key={job._id} className="glass-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
                            <img src={job.imageUrl} alt="Garbage" style={{ width: '100%', height: '180px', borderRadius: '0.75rem', objectFit: 'cover' }} />

                            <div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                                    <h3 style={{ fontSize: '1.1rem' }}>{job.description || 'Garbage Report'}</h3>
                                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{new Date(job.createdAt).toLocaleTimeString()}</span>
                                </div>
                                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Area: {job.area}</p>
                                <a href={`https://www.google.com/maps?q=${job.location.lat},${job.location.lng}`} target="_blank" rel="noreferrer" style={{ fontSize: '0.85rem', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '0.3rem', textDecoration: 'none' }}>
                                    <Navigation size={14} /> View Navigation
                                </a>
                            </div>

                            {/* Status Section */}
                            <div style={{ borderTop: '1px solid var(--glass-border)', paddingTop: '1rem' }}>
                                {job.status === 'Pending' ? (
                                    <button onClick={() => handleAccept(job._id)} className="btn-primary" style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                                        <CheckCircle size={16} /> Accept Job
                                    </button>
                                ) : job.status === 'Awaiting Admin Review' ? (
                                    <div style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(124, 58, 237, 0.15)', color: '#A78BFA', padding: '0.75rem', borderRadius: '0.75rem', fontWeight: 'bold', border: '1px solid rgba(167, 139, 250, 0.3)' }}>
                                        <Clock size={16} style={{ marginRight: '0.5rem' }} /> Awaiting Admin Review
                                    </div>
                                ) : (
                                    /* Completion Flow (In Progress or Rework Required) */
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                        {job.status === 'Rework Required' && (
                                            <div style={{ fontSize: '0.85rem', color: '#EF4444', background: 'rgba(239, 68, 68, 0.1)', padding: '0.75rem', borderRadius: '0.75rem', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
                                                <strong>⚠️ Rework Required:</strong> {job.adminRemarks || 'Please re-clean and upload again.'}
                                            </div>
                                        )}

                                        {/* NEW Worker Completion Section */}
                                        <div className="glass-card" style={{ padding: '1rem', background: 'rgba(255,255,255,0.03)', border: '1px dashed var(--glass-border)' }}>
                                            <h4 style={{ fontSize: '0.9rem', marginBottom: '0.75rem', color: 'var(--primary)' }}>Worker Completion Section</h4>

                                            <textarea
                                                placeholder="Completion Comment (Describe the work done)..."
                                                className="input-field"
                                                style={{ minHeight: '80px', fontSize: '0.85rem', marginBottom: '0.75rem', background: 'var(--bg-card)' }}
                                                value={completionInputs[job._id]?.comment || ''}
                                                onChange={(e) => handleInputChange(job._id, 'comment', e.target.value)}
                                                required
                                            />

                                            <div style={{ position: 'relative', marginBottom: '1rem' }}>
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={(e) => handleInputChange(job._id, 'file', e.target.files[0])}
                                                    id={`file-${job._id}`}
                                                    style={{ display: 'none' }}
                                                />
                                                <label
                                                    htmlFor={`file-${job._id}`}
                                                    className="btn-primary"
                                                    style={{
                                                        background: 'var(--bg-card)',
                                                        border: '1px solid var(--glass-border)',
                                                        fontSize: '0.85rem',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        gap: '0.5rem',
                                                        cursor: 'pointer',
                                                        color: completionInputs[job._id]?.file ? 'var(--primary)' : 'var(--text-muted)'
                                                    }}
                                                >
                                                    <ImageIcon size={16} /> {completionInputs[job._id]?.file ? 'Image Selected ✅' : 'Upload Cleaned Image'}
                                                </label>
                                                {completionInputs[job._id]?.file && (
                                                    <p style={{ fontSize: '0.7rem', color: 'var(--primary)', marginTop: '0.3rem', textAlign: 'center' }}>
                                                        {completionInputs[job._id].file.name}
                                                    </p>
                                                )}
                                            </div>

                                            <button
                                                onClick={() => handleSubmitCompletion(job._id)}
                                                className="btn-primary"
                                                style={{
                                                    width: '100%',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    gap: '0.5rem',
                                                    background: 'linear-gradient(135deg, var(--secondary), #10b981)'
                                                }}
                                                disabled={loading}
                                            >
                                                <Send size={16} /> Submit for Admin Review
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    ))
                )}
            </div>
        </div>
    );
};

export default WorkerDashboard;
