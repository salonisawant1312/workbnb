const Listing = require('../models/Listing');
const uploadToCloudinary = require('../utils/uploadToCloudinary');

const normalizeListingPayload = (body) => {
  const payload = { ...body };

  if (typeof payload.address === 'string') {
    try {
      payload.address = JSON.parse(payload.address);
    } catch (_e) {
      payload.address = { city: payload.address };
    }
  }

  if (typeof payload.amenities === 'string') {
    payload.amenities = payload.amenities
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);
  }

  ['capacity', 'pricePerHour', 'pricePerDay', 'pricePerMonth'].forEach((key) => {
    if (payload[key] !== undefined) payload[key] = Number(payload[key]);
  });

  return payload;
};

const getAllListings = async (req, res) => {
  try {
    const { city, workspaceType, minPrice, maxPrice } = req.query;
    const filter = { isActive: true };
    if (city) filter['address.city'] = new RegExp(city, 'i');
    if (workspaceType) filter.workspaceType = workspaceType;
    if (minPrice || maxPrice) {
      filter.pricePerDay = {};
      if (minPrice) filter.pricePerDay.$gte = Number(minPrice);
      if (maxPrice) filter.pricePerDay.$lte = Number(maxPrice);
    }

    const listings = await Listing.find(filter).populate('hostId', 'name email');
    res.status(200).json({ success: true, count: listings.length, data: listings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getListing = async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id).populate('hostId', 'name email');
    if (!listing) return res.status(404).json({ success: false, message: 'Listing not found' });
    res.status(200).json({ success: true, data: listing });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const createListing = async (req, res) => {
  try {
    const payload = normalizeListingPayload(req.body);
    const images = [];
    if (Array.isArray(req.files) && req.files.length) {
      for (const file of req.files) {
        const imageUrl = await uploadToCloudinary(file, 'workbnb/listings');
        if (imageUrl) images.push(imageUrl);
      }
    }

    const listing = await Listing.create({ ...payload, images, hostId: req.user._id });
    res.status(201).json({ success: true, data: listing });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const addListingImages = async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);
    if (!listing) return res.status(404).json({ success: false, message: 'Listing not found' });
    if (listing.hostId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not allowed' });
    }

    if (!Array.isArray(req.files) || !req.files.length) {
      return res.status(400).json({ success: false, message: 'No files uploaded' });
    }

    const newUrls = [];
    for (const file of req.files) {
      const imageUrl = await uploadToCloudinary(file, 'workbnb/listings');
      if (imageUrl) newUrls.push(imageUrl);
    }

    listing.images = [...(listing.images || []), ...newUrls];
    await listing.save();

    res.status(200).json({ success: true, data: listing });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const updateListing = async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);
    if (!listing) return res.status(404).json({ success: false, message: 'Listing not found' });
    if (listing.hostId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not allowed' });
    }
    Object.assign(listing, normalizeListingPayload(req.body));
    await listing.save();
    res.status(200).json({ success: true, data: listing });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const deleteListing = async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);
    if (!listing) return res.status(404).json({ success: false, message: 'Listing not found' });
    if (listing.hostId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not allowed' });
    }
    await listing.deleteOne();
    res.status(200).json({ success: true, message: 'Listing deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getAllListings, getListing, createListing, addListingImages, updateListing, deleteListing };
