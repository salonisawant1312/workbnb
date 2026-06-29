const express = require('express');
const {
  getAllListings,
  getHostListings,
  getListing,
  createListing,
  addListingImages,
  updateListing,
  updateListingStatus,
  deleteListing
} = require('../controllers/listingController');
const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');

const router = express.Router();

router.get('/', getAllListings);
router.get('/my-listings', protect, getHostListings);
router.get('/:id', getListing);
router.post('/', protect, authorize('guest', 'host', 'admin'), upload.array('images', 8), createListing);
router.post('/:id/images', protect, authorize('guest', 'host', 'admin'), upload.array('images', 8), addListingImages);
router.patch('/:id', protect, updateListing);
router.patch('/:id/status', protect, authorize('host', 'admin'), updateListingStatus);
router.delete('/:id', protect, deleteListing);

module.exports = router;
