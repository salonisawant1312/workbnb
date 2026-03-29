const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema(
  {
    bookingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking', required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    amount: { type: Number, required: true },
    currency: { type: String, default: 'inr' },
    status: { type: String, enum: ['created', 'succeeded', 'failed', 'refunded'], default: 'created' },
    stripePaymentId: String,
    paymentMethod: String
  },
  { timestamps: true }
);

module.exports = mongoose.model('Payment', paymentSchema);
