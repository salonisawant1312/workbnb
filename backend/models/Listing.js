const mongoose = require('mongoose');

const listingSchema = new mongoose.Schema(
  {
    hostId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    address: {
      street: String,
      city: { type: String, required: true },
      state: String,
      country: String,
      zipCode: String
    },
    workspaceType: {
      type: String,
      enum: ['desk', 'meeting-room', 'studio', 'co-working'],
      required: true
    },
    capacity: { type: Number, required: true, min: 1 },
    pricePerHour: { type: Number, default: 0 },
    pricePerDay: { type: Number, default: 0 },
    pricePerMonth: { type: Number, default: 0 },
    amenities: [{ type: String }],
    images: [{ type: String }],
    rating: { type: Number, default: 0 },
    totalReviews: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true }
  },
  { timestamps: true }
);

listingSchema.index({ 'address.city': 1, workspaceType: 1 });

module.exports = mongoose.model('Listing', listingSchema);
