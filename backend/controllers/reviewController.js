const Review = require('../models/Review');
const Booking = require('../models/Booking');
const Listing = require('../models/Listing');

const recomputeListingRating = async (listingId) => {
  const reviews = await Review.find({ listingId });
  const totalReviews = reviews.length;
  const rating = totalReviews ? reviews.reduce((s, r) => s + r.rating, 0) / totalReviews : 0;
  await Listing.findByIdAndUpdate(listingId, { rating: Number(rating.toFixed(1)), totalReviews });
};

const createReview = async (req, res) => {
  try {
    const { bookingId, rating, comment, photos } = req.body;
    const booking = await Booking.findById(bookingId);
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });
    if (booking.guestId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not allowed' });
    }

    const review = await Review.create({
      bookingId,
      listingId: booking.listingId,
      reviewerId: req.user._id,
      hostId: booking.hostId,
      rating,
      comment,
      photos: photos || []
    });

    await recomputeListingRating(booking.listingId);
    res.status(201).json({ success: true, data: review });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getListingReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ listingId: req.params.id }).populate('reviewerId', 'name avatarUrl');
    res.status(200).json({ success: true, count: reviews.length, data: reviews });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getUserReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ hostId: req.params.id }).populate('reviewerId', 'name');
    res.status(200).json({ success: true, count: reviews.length, data: reviews });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const updateReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ success: false, message: 'Review not found' });
    if (review.reviewerId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not allowed' });
    }
    Object.assign(review, req.body);
    await review.save();
    await recomputeListingRating(review.listingId);
    res.status(200).json({ success: true, data: review });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const deleteReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ success: false, message: 'Review not found' });
    if (review.reviewerId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not allowed' });
    }
    const listingId = review.listingId;
    await review.deleteOne();
    await recomputeListingRating(listingId);
    res.status(200).json({ success: true, message: 'Review deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { createReview, getListingReviews, getUserReviews, updateReview, deleteReview };
