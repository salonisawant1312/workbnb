const express = require('express');
const { createBooking, getUserBookings, getHostBookings, getBooking, updateBooking, cancelBooking, confirmBooking } = require('../controllers/bookingController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect);
router.post('/', createBooking);
router.get('/', getUserBookings);
router.get('/host-orders', getHostBookings);
router.get('/:id', getBooking);
router.patch('/:id', updateBooking);
router.delete('/:id', cancelBooking);
router.post('/:id/confirm', confirmBooking);

module.exports = router;
