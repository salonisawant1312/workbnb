const express = require('express');
const { createIntent, confirmPayment, getHistory, refund } = require('../controllers/paymentController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.post('/create-intent', protect, createIntent);
router.post('/confirm', protect, confirmPayment);
router.get('/history', protect, getHistory);
router.post('/refund', protect, refund);

module.exports = router;
