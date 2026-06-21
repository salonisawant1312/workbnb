const Razorpay = require('razorpay');
const crypto = require('crypto');
const Booking = require('../models/Booking');
const Payment = require('../models/Payment');

const razorpay = process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET 
  ? new Razorpay({ 
      key_id: process.env.RAZORPAY_KEY_ID.trim(), 
      key_secret: process.env.RAZORPAY_KEY_SECRET.trim() 
    }) 
  : null;

const createOrder = async (req, res) => {
  try {
    const { bookingId } = req.body;
    const booking = await Booking.findById(bookingId).populate('hostId');
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });
    if (booking.guestId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not allowed' });
    }

    const commissionRate = parseFloat(process.env.COMMISSION_RATE || '0.10');
    const totalAmount = booking.totalAmount;
    const commissionAmount = Math.round(totalAmount * commissionRate * 100) / 100;
    const transferAmount = totalAmount - commissionAmount;

    if (!razorpay) {
      const payment = await Payment.create({
        bookingId,
        userId: req.user._id,
        amount: totalAmount,
        commissionAmount,
        transferAmount,
        currency: 'inr',
        status: 'created',
        paymentMethod: 'card'
      });
      return res.status(200).json({ success: true, mock: true, orderId: `mock_order_${payment._id}`, paymentId: payment._id, amount: totalAmount });
    }

    const options = {
      amount: Math.round(totalAmount * 100),
      currency: 'INR',
      receipt: `receipt_${booking._id}`,
    };

    if (booking.hostId.isRazorpayLinked && booking.hostId.razorpayAccountId) {
      if (!booking.hostId.razorpayAccountId.startsWith('acc_mock_')) {
        options.transfers = [
          {
            account: booking.hostId.razorpayAccountId,
            amount: Math.round(transferAmount * 100),
            currency: 'INR',
            on_hold: false
          }
        ];
      }
    }

    const order = await razorpay.orders.create(options);

    const payment = await Payment.create({
      bookingId,
      userId: req.user._id,
      amount: totalAmount,
      commissionAmount,
      transferAmount,
      currency: 'inr',
      status: 'created',
      razorpayOrderId: order.id,
      paymentMethod: 'card'
    });

    return res.status(200).json({ success: true, orderId: order.id, paymentId: payment._id, amount: totalAmount, currency: 'INR' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const verifyPayment = async (req, res) => {
  try {
    const { paymentId, razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    
    let payment;
    if (paymentId) {
      payment = await Payment.findById(paymentId);
    } else if (razorpay_order_id) {
      payment = await Payment.findOne({ razorpayOrderId: razorpay_order_id });
    }

    if (!payment) return res.status(404).json({ success: false, message: 'Payment not found' });

    if (!razorpay_signature) {
      payment.status = 'succeeded';
      await payment.save();
      await Booking.findByIdAndUpdate(payment.bookingId, {
        paymentStatus: 'paid',
        status: 'confirmed',
        paymentId: String(payment._id)
      });
      return res.status(200).json({ success: true, data: payment });
    }

    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest("hex");

    const isAuthentic = expectedSignature === razorpay_signature;

    if (!isAuthentic) {
      return res.status(400).json({ success: false, message: 'Invalid payment signature' });
    }

    payment.status = 'succeeded';
    payment.razorpayPaymentId = razorpay_payment_id;
    payment.razorpaySignature = razorpay_signature;
    await payment.save();

    await Booking.findByIdAndUpdate(payment.bookingId, {
      paymentStatus: 'paid',
      status: 'confirmed',
      paymentId: razorpay_payment_id
    });

    return res.status(200).json({ success: true, data: payment });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
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

const getHostPayments = async (req, res) => {
  try {
    const bookings = await Booking.find({ hostId: req.user._id }).select('_id');
    const bookingIds = bookings.map((b) => b._id);
    const payments = await Payment.find({ bookingId: { $in: bookingIds } })
      .populate({ path: 'bookingId', select: 'totalAmount checkInDate checkOutDate status', populate: { path: 'listingId', select: 'title' } })
      .populate('userId', 'name email')
      .sort({ createdAt: -1 });
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
    payment.payoutStatus = 'failed';
    await payment.save();
    await Booking.findByIdAndUpdate(payment.bookingId, { paymentStatus: 'refunded' });
    return res.status(200).json({ success: true, data: payment });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const webhook = async (req, res) => {
  try {
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
    const signature = req.headers['x-razorpay-signature'];
    
    if (secret && signature) {
      const expectedSignature = crypto.createHmac('sha256', secret).update(JSON.stringify(req.body)).digest('hex');
      if (expectedSignature !== signature) {
        return res.status(400).json({ success: false, message: 'Invalid signature' });
      }
    }

    const { event, payload } = req.body;
    
    if (event === 'transfer.processed') {
      const transfer = payload.transfer.entity;
      const payment = await Payment.findOne({ 'razorpayPaymentId': transfer.source });
      if (payment) {
        payment.payoutStatus = 'success';
        payment.transferId = transfer.id;
        await payment.save();
      }
    } else if (event === 'transfer.failed') {
      const transfer = payload.transfer.entity;
      const payment = await Payment.findOne({ 'razorpayPaymentId': transfer.source });
      if (payment) {
        payment.payoutStatus = 'failed';
        payment.transferId = transfer.id;
        await payment.save();
      }
    }

    return res.status(200).json({ success: true });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { createOrder, verifyPayment, getHistory, getHostPayments, refund, webhook };
