const express = require('express');
const {
  getAllListings,
  getListing,
  createListing,
  addListingImages,
  updateListing,
  deleteListing
} = require('../controllers/listingController');
const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');

const router = express.Router();

router.get('/', getAllListings);
router.get('/:id', getListing);
router.post('/', protect, authorize('host', 'admin'), upload.array('images', 8), createListing);
router.post('/:id/images', protect, authorize('host', 'admin'), upload.array('images', 8), addListingImages);
router.patch('/:id', protect, updateListing);
router.delete('/:id', protect, deleteListing);

module.exports = router;
