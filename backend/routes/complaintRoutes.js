const express = require('express');
const router = express.Router();
const { createComplaint, getMyComplaints, getNearbyComplaints, updateStatus } = require('../controllers/complaintController');
const { authenticate, authorize } = require('../middleware/auth');

router.post('/', authenticate, authorize(['civilian']), createComplaint);
router.get('/my', authenticate, authorize(['civilian']), getMyComplaints);
router.get('/nearby', authenticate, authorize(['worker']), getNearbyComplaints);
router.patch('/:id/status', authenticate, authorize(['worker', 'admin']), updateStatus);

module.exports = router;
