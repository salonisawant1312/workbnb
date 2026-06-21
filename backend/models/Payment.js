const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema(
  {
    bookingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking', required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    amount: { type: Number, required: true },
    currency: { type: String, default: 'inr' },
    status: { type: String, enum: ['created', 'succeeded', 'failed', 'refunded'], default: 'created' },
    stripePaymentId: String,
    razorpayOrderId: String,
    razorpayPaymentId: String,
    razorpaySignature: String,
    paymentMethod: String,
    commissionAmount: { type: Number, default: 0 },
    transferAmount: { type: Number, default: 0 },
    transferId: String,
    payoutStatus: { type: String, enum: ['pending', 'processing', 'success', 'failed'], default: 'pending' }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Payment', paymentSchema);
