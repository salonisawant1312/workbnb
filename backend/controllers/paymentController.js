const Stripe = require('stripe');
const Booking = require('../models/Booking');
const Payment = require('../models/Payment');

const stripe = process.env.STRIPE_SECRET_KEY ? new Stripe(process.env.STRIPE_SECRET_KEY) : null;

const createIntent = async (req, res) => {
  try {
    const { bookingId } = req.body;
    const booking = await Booking.findById(bookingId);
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });
    if (booking.guestId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not allowed' });
    }

    if (!stripe) {
      const payment = await Payment.create({
        bookingId,
        userId: req.user._id,
        amount: booking.totalAmount,
        currency: 'inr',
        status: 'created',
        paymentMethod: 'card'
      });
      return res.status(200).json({ success: true, mock: true, clientSecret: `mock_${payment._id}`, paymentId: payment._id });
    }

    const intent = await stripe.paymentIntents.create({
      amount: Math.round(booking.totalAmount * 100),
      currency: 'inr',
      metadata: { bookingId: booking._id.toString(), userId: req.user._id.toString() }
    });

    const payment = await Payment.create({
      bookingId,
      userId: req.user._id,
      amount: booking.totalAmount,
      currency: 'inr',
      status: 'created',
      stripePaymentId: intent.id,
      paymentMethod: 'card'
    });

    return res.status(200).json({ success: true, clientSecret: intent.client_secret, paymentId: payment._id });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const confirmPayment = async (req, res) => {
  try {
    const { paymentId } = req.body;
    const payment = await Payment.findById(paymentId);
    if (!payment) return res.status(404).json({ success: false, message: 'Payment not found' });
    if (payment.userId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not allowed' });
    }

    payment.status = 'succeeded';
    await payment.save();
    await Booking.findByIdAndUpdate(payment.bookingId, {
      paymentStatus: 'paid',
      status: 'confirmed',
      paymentId: payment.stripePaymentId || String(payment._id)
    });

    return res.status(200).json({ success: true, data: payment });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const webhook = async (req, res) => {
  try {
    if (!stripe || !process.env.STRIPE_WEBHOOK_SECRET) {
      return res.status(200).json({ success: true, message: 'Webhook skipped (Stripe not configured)' });
    }

    const signature = req.headers['stripe-signature'];
    const event = stripe.webhooks.constructEvent(req.body, signature, process.env.STRIPE_WEBHOOK_SECRET);

    if (event.type === 'payment_intent.succeeded') {
      const intent = event.data.object;
      const payment = await Payment.findOne({ stripePaymentId: intent.id });
      if (payment) {
        payment.status = 'succeeded';
        await payment.save();
        await Booking.findByIdAndUpdate(payment.bookingId, {
          paymentStatus: 'paid',
          status: 'confirmed',
          paymentId: intent.id
        });
      }
    }

    return res.status(200).json({ received: true });
  } catch (error) {
    return res.status(400).send(`Webhook Error: ${error.message}`);
  }
};

const getHistory = async (req, res) => {
  try {
    const payments = await Payment.find({ userId: req.user._id }).sort({ createdAt: -1 });
    return res.status(200).json({ success: true, count: payments.length, data: payments });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const refund = async (req, res) => {
  try {
    const { paymentId } = req.body;
    const payment = await Payment.findById(paymentId);
    if (!payment) return res.status(404).json({ success: false, message: 'Payment not found' });
    if (payment.userId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not allowed' });
    }
    payment.status = 'refunded';
    await payment.save();
    await Booking.findByIdAndUpdate(payment.bookingId, { paymentStatus: 'refunded' });
    return res.status(200).json({ success: true, data: payment });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { createIntent, confirmPayment, webhook, getHistory, refund };
