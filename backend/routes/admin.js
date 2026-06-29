const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const { getAllUsers, updateUserStatus, getAllListings, getAllPayments, getAllReviews, getAllBookings } = require('../controllers/adminController');

router.get('/users', protect, authorize('admin', 'moderator', 'regulator'), getAllUsers);
router.put('/users/:id/status', protect, authorize('admin', 'moderator', 'regulator'), updateUserStatus);
router.get('/listings', protect, authorize('admin', 'moderator', 'regulator'), getAllListings);
router.get('/payments', protect, authorize('admin', 'moderator', 'regulator'), getAllPayments);
router.get('/reviews', protect, authorize('admin', 'moderator', 'regulator'), getAllReviews);
router.get('/bookings', protect, authorize('admin', 'moderator', 'regulator'), getAllBookings);

module.exports = router;


