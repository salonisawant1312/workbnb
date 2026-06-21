const express = require('express');
const { createOrder, verifyPayment, getHistory, getHostPayments, refund, webhook } = require('../controllers/paymentController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.post('/create-order', protect, createOrder);
router.post('/verify', protect, verifyPayment);
router.get('/history', protect, getHistory);
router.post('/refund', protect, refund);
router.get('/host-payments', protect, getHostPayments);

// Webhook is public (Razorpay calls it)
router.post('/webhook', webhook);

module.exports = router;
