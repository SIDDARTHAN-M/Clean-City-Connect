const express = require('express');
const { authenticate, authorize } = require('../middleware/auth');
const { getWorkers, getAllComplaints, adminLogin, adminRegister, approveComplaint, rejectComplaint } = require('../controllers/adminController');

const router = express.Router();

// ─── Public Admin Routes (no JWT needed) ────────────────────────────────────
router.post('/login', adminLogin);
router.post('/register', adminRegister); // Gated by admin access code

// ─── All routes below require JWT + admin role ──────────────────────────────
router.use(authenticate);
router.use(authorize(['admin']));

router.get('/workers', getWorkers);
router.get('/complaints', getAllComplaints);

// Separate approve & reject routes per spec
router.patch('/complaints/:id/approve', approveComplaint);
router.patch('/complaints/:id/reject', rejectComplaint);

module.exports = router;
