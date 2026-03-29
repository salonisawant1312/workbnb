const express = require('express');
const { createReview, getListingReviews, getUserReviews, updateReview, deleteReview } = require('../controllers/reviewController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.get('/listing/:id', getListingReviews);
router.get('/user/:id', getUserReviews);
router.post('/', protect, createReview);
router.patch('/:id', protect, updateReview);
router.delete('/:id', protect, deleteReview);

module.exports = router;
