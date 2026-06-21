const Razorpay = require('razorpay');

const razorpay = process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET 
  ? new Razorpay({ 
      key_id: process.env.RAZORPAY_KEY_ID.trim(), 
      key_secret: process.env.RAZORPAY_KEY_SECRET.trim() 
    }) 
  : null;

module.exports = razorpay;
