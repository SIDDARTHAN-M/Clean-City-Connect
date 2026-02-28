import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    LayoutDashboard, Users, ClipboardList, CheckCircle, XCircle,
    Eye, MapPin, Clock, MessageSquare, AlertCircle, ChevronDown, ChevronUp
} from 'lucide-react';
import axios from 'axios';

const AdminDashboard = () => {
    const [workers, setWorkers] = useState([]);
    const [complaints, setComplaints] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeFilter, setActiveFilter] = useState('All');
    const [selectedComplaint, setSelectedComplaint] = useState(null);
    const [expandedComplaint, setExpandedComplaint] = useState(null);
    const [adminRemarks, setAdminRemarks] = useState('');

    const filters = ['All', 'Awaiting Admin Review', 'Completed', 'Rework Required', 'Pending', 'In Progress'];

    useEffect(() => {
        fetchData();
    }, [activeFilter]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [workersRes, complaintsRes] = await Promise.all([
                axios.get('http://localhost:5000/api/admin/workers'),
                axios.get(`http://localhost:5000/api/admin/complaints${activeFilter !== 'All' ? `?status=${activeFilter}` : ''}`)
            ]);
            setWorkers(workersRes.data);
            setComplaints(complaintsRes.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (id) => {
        try {
            await axios.patch(`http://localhost:5000/api/admin/complaints/${id}/approve`);
            setSelectedComplaint(null);
            fetchData();
            alert('Complaint approved and released to civilian.');
        } catch (err) {
            alert('Approval failed.');
        }
    };

    const handleReject = async (id) => {
        if (!adminRemarks.trim()) return alert('Please provide remarks for rejection.');
        try {
            await axios.patch(`http://localhost:5000/api/admin/complaints/${id}/reject`, { adminRemarks });
            setSelectedComplaint(null);
            setAdminRemarks('');
            fetchData();
            alert('Rejection sent back to worker.');
        } catch (err) {
            alert('Rejection failed.');
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'Completed': return '#10b981';
            case 'Awaiting Admin Review': return '#A78BFA';
            case 'Rework Required': return '#EF4444';
            case 'In Progress': return '#3b82f6';
            default: return 'var(--text-muted)';
        }
    };

    return (
        <div style={{ padding: '2rem', maxWidth: '1400px', margin: '0 auto' }}>
            {/* Header */}
            <div style={{ marginBottom: '2.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                <div>
                    <h1 style={{ fontSize: '2.5rem', fontWeight: '800', marginBottom: '0.5rem' }}>Admin Control Panel</h1>
                    <p style={{ color: 'var(--text-muted)' }}>System Oversight & Quality Assurance</p>
                </div>
                <div style={{ display: 'flex', gap: '2rem' }}>
                    <div className="glass-card" style={{ padding: '1rem 2rem', textAlign: 'center' }}>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Total Workers</div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{workers.length}</div>
                    </div>
                    <div className="glass-card" style={{ padding: '1rem 2rem', textAlign: 'center' }}>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Pending Reviews</div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#A78BFA' }}>
                            {complaints.filter(c => c.status === 'Awaiting Admin Review').length}
                        </div>
                    </div>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '2rem' }}>
                {/* Sidebar: Workers */}
                <aside>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem', color: 'var(--primary)' }}>
                        <Users size={20} />
                        <h3 style={{ fontSize: '1.25rem' }}>Active Workers</h3>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {workers.map(worker => (
                            <div key={worker._id} className="glass-card" style={{ padding: '1rem', position: 'relative' }}>
                                <div style={{ fontWeight: '600', marginBottom: '0.25rem' }}>{worker.fullName}</div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>ID: {worker.workerId}</div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Area: {worker.area}</div>
                                <div style={{ marginTop: '0.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span style={{ fontSize: '0.7rem' }}>Jobs: {worker.assignedCount || 0}</span>
                                    <span style={{
                                        fontSize: '0.65rem',
                                        padding: '0.2rem 0.5rem',
                                        borderRadius: '1rem',
                                        background: worker.activityStatus === 'Working' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(255,255,255,0.05)',
                                        color: worker.activityStatus === 'Working' ? '#10b981' : 'var(--text-muted)'
                                    }}>
                                        {worker.activityStatus}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </aside>

                {/* Main: Complaint Monitoring */}
                <main>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary)' }}>
                            <ClipboardList size={20} />
                            <h3 style={{ fontSize: '1.25rem' }}>Complaint Monitoring</h3>
                        </div>
                        {/* Status Filters */}
                        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                            {filters.map(filter => (
                                <button
                                    key={filter}
                                    onClick={() => setActiveFilter(filter)}
                                    style={{
                                        padding: '0.4rem 0.8rem',
                                        fontSize: '0.75rem',
                                        borderRadius: '0.5rem',
                                        background: activeFilter === filter ? 'var(--primary)' : 'var(--bg-card)',
                                        border: '1px solid var(--glass-border)',
                                        color: activeFilter === filter ? 'white' : 'var(--text-muted)',
                                        cursor: 'pointer'
                                    }}
                                >
                                    {filter}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {loading ? (
                            <p>Loading complaints...</p>
                        ) : complaints.length === 0 ? (
                            <p style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)', background: 'var(--bg-card)', borderRadius: '1rem' }}>
                                No complaints found for this category.
                            </p>
                        ) : (
                            complaints.map(complaint => (
                                <div key={complaint._id} className="glass-card" style={{ overflow: 'hidden' }}>
                                    <div
                                        onClick={() => setExpandedComplaint(expandedComplaint === complaint._id ? null : complaint._id)}
                                        style={{ padding: '1rem 1.5rem', display: 'flex', alignItems: 'center', cursor: 'pointer' }}
                                    >
                                        <div style={{ width: '50px', height: '50px', borderRadius: '0.5rem', overflow: 'hidden', marginRight: '1.5rem' }}>
                                            <img src={complaint.imageUrl} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ fontWeight: 'bold' }}>{complaint.description || 'Garbage Report'}</div>
                                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                                {complaint.area} • {new Date(complaint.createdAt).toLocaleDateString()}
                                            </div>
                                        </div>
                                        <div style={{ textAlign: 'right', marginRight: '2rem' }}>
                                            <div style={{ fontSize: '0.8rem', fontWeight: '600', color: getStatusColor(complaint.status) }}>
                                                {complaint.status}
                                            </div>
                                            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                                                Worker: {complaint.worker?.fullName || 'Unassigned'}
                                            </div>
                                        </div>
                                        {expandedComplaint === complaint._id ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                                    </div>

                                    <AnimatePresence>
                                        {expandedComplaint === complaint._id && (
                                            <motion.div
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: 'auto', opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                style={{ borderTop: '1px solid var(--glass-border)', background: 'rgba(255,255,255,0.01)' }}
                                            >
                                                <div style={{ padding: '1.5rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                                                    {/* Civilian Side */}
                                                    <div>
                                                        <h4 style={{ fontSize: '0.8rem', color: 'var(--primary)', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
                                                            Reporter Details
                                                        </h4>
                                                        <div style={{ fontSize: '0.9rem', marginBottom: '0.5rem' }}><strong>Name:</strong> {complaint.reporter?.fullName}</div>
                                                        <div style={{ fontSize: '0.9rem', marginBottom: '0.5rem' }}><strong>Phone:</strong> {complaint.reporter?.phone}</div>
                                                        <div style={{ fontSize: '0.9rem', marginBottom: '1.5rem' }}><strong>Email:</strong> {complaint.reporter?.email}</div>
                                                        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                                                            " {complaint.description} "
                                                        </p>
                                                    </div>

                                                    {/* Worker/Approval Side */}
                                                    <div style={{ borderLeft: '1px solid var(--glass-border)', paddingLeft: '2rem' }}>
                                                        <h4 style={{ fontSize: '0.8rem', color: 'var(--secondary)', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
                                                            Worker Submission
                                                        </h4>
                                                        {complaint.status === 'Pending' ? (
                                                            <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Wait for worker to accept...</div>
                                                        ) : (
                                                            <>
                                                                <div style={{ fontSize: '0.9rem', marginBottom: '0.5rem' }}><strong>Assigned:</strong> {complaint.worker?.fullName}</div>
                                                                <div style={{ fontSize: '0.9rem', marginBottom: '1rem' }}><strong>Worker ID:</strong> {complaint.worker?.workerId}</div>

                                                                {/* Image Audit Trigger */}
                                                                {(complaint.cleanedImageUrl || complaint.status === 'Awaiting Admin Review' || complaint.status === 'Completed') && (
                                                                    <button
                                                                        onClick={() => setSelectedComplaint(complaint)}
                                                                        className="btn-primary"
                                                                        style={{ fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                                                                    >
                                                                        <Eye size={16} /> Open Image Audit View
                                                                    </button>
                                                                )}
                                                            </>
                                                        )}
                                                    </div>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            ))
                        )}
                    </div>
                </main>
            </div>

            {/* Side-by-Side Audit Modal */}
            <AnimatePresence>
                {selectedComplaint && (
                    <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
                        <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            onClick={() => setSelectedComplaint(null)}
                            style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(10px)' }}
                        />
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
                            className="glass-card"
                            style={{ width: '100%', maxWidth: '1100px', maxHeight: '90vh', overflowY: 'auto', position: 'relative', padding: '2.5rem' }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
                                <div>
                                    <h2 style={{ fontSize: '1.75rem', marginBottom: '0.5rem' }}>Evidence Verification</h2>
                                    <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '1rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}><MapPin size={14} /> {selectedComplaint.area}</span>
                                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}><Clock size={14} /> Submitted: {new Date(selectedComplaint.updatedAt).toLocaleTimeString()}</span>
                                    </div>
                                </div>
                                <button onClick={() => setSelectedComplaint(null)} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}><XCircle size={32} /></button>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2.5rem' }}>
                                <div>
                                    <div style={{ position: 'relative', borderRadius: '1rem', overflow: 'hidden', height: '350px', border: '2px solid var(--glass-border)' }}>
                                        <img src={selectedComplaint.imageUrl} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        <div style={{ position: 'absolute', top: '1rem', left: '1rem', background: 'rgba(0,0,0,0.6)', padding: '0.4rem 1rem', borderRadius: '0.5rem', fontSize: '0.75rem', fontWeight: 'bold' }}>
                                            BEFORE CLEANING
                                        </div>
                                    </div>
                                    <div style={{ marginTop: '1rem', padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '0.75rem' }}>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--primary)', fontWeight: 'bold', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Civilian Complaint</div>
                                        <p style={{ fontSize: '0.9rem' }}>{selectedComplaint.description}</p>
                                    </div>
                                </div>

                                <div>
                                    <div style={{ position: 'relative', borderRadius: '1rem', overflow: 'hidden', height: '350px', border: '2px solid #A78BFA' }}>
                                        {selectedComplaint.cleanedImageUrl ? (
                                            <img src={selectedComplaint.cleanedImageUrl} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        ) : (
                                            <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-card)', color: 'var(--text-muted)' }}>
                                                No cleaned image uploaded yet.
                                            </div>
                                        )}
                                        <div style={{ position: 'absolute', top: '1rem', left: '1rem', background: 'rgba(124, 58, 237, 0.8)', padding: '0.4rem 1rem', borderRadius: '0.5rem', fontSize: '0.75rem', fontWeight: 'bold' }}>
                                            {selectedComplaint.status === 'Completed' ? 'AFTER CLEANING (VERIFIED)' : 'POST-CLEANING (PENDING REVIEW)'}
                                        </div>
                                    </div>
                                    <div style={{ marginTop: '1rem', padding: '1rem', background: 'rgba(124, 58, 237, 0.05)', borderRadius: '0.75rem', border: '1px solid rgba(167, 139, 250, 0.2)' }}>
                                        <div style={{ fontSize: '0.75rem', color: '#A78BFA', fontWeight: 'bold', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Worker Completion Comment</div>
                                        <p style={{ fontSize: '0.9rem', fontStyle: 'italic' }}>
                                            "{selectedComplaint.workerCompletionComment || 'No comment provided.'}"
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {selectedComplaint.status === 'Awaiting Admin Review' && (
                                <div style={{ borderTop: '1px solid var(--glass-border)', paddingTop: '2rem' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', color: '#A78BFA' }}>
                                        <MessageSquare size={20} />
                                        <h4 style={{ fontSize: '1.1rem' }}>Final Verdict</h4>
                                    </div>
                                    <textarea
                                        className="input-field"
                                        placeholder="Add mandatory remarks for rejection or internal notes for approval..."
                                        style={{ width: '100%', minHeight: '100px', marginBottom: '1.5rem', background: 'rgba(255,255,255,0.03)' }}
                                        value={adminRemarks}
                                        onChange={(e) => setAdminRemarks(e.target.value)}
                                    />
                                    <div style={{ display: 'flex', gap: '1rem' }}>
                                        <button
                                            onClick={() => handleApprove(selectedComplaint._id)}
                                            className="btn-primary"
                                            style={{ flex: 2, background: 'linear-gradient(135deg, #059669, #10b981)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', fontSize: '1.1rem' }}
                                        >
                                            <CheckCircle size={20} /> Approve & Release to Civilian
                                        </button>
                                        <button
                                            onClick={() => handleReject(selectedComplaint._id)}
                                            className="btn-primary"
                                            style={{ flex: 1, background: 'rgba(239, 68, 68, 0.1)', border: '1px solid #EF4444', color: '#EF4444', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', fontSize: '1.1rem' }}
                                        >
                                            <AlertCircle size={20} /> Reject (Send Back)
                                        </button>
                                    </div>
                                </div>
                            )}

                            {selectedComplaint.status === 'Completed' && (
                                <div style={{ padding: '1rem', background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', borderRadius: '0.75rem', textAlign: 'center', fontSize: '0.95rem', fontWeight: 'bold' }}>
                                    ✅ This cleanup has been verified and completed.
                                </div>
                            )}
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default AdminDashboard;
