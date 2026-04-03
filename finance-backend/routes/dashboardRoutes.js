const express = require('express');
const { getSummary } = require('../controllers/dashboardController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Analyst and Admin can access dashboard
router.get('/summary', protect, authorize('analyst', 'admin'), getSummary);

module.exports = router;
