const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, minlength: 6, select: false },
    role: { type: String, enum: ['guest', 'host', 'admin', 'moderator', 'regulator'], default: 'guest' },
    avatarUrl: String,
    bio: String,
    phone: String,
    address: {
      street: String,
      city: String,
      state: String,
      zip: String,
      country: String
    },
    bankDetails: {
      accountName: String,
      accountNumber: String,
      ifscCode: String
    },
    razorpayAccountId: String,
    isRazorpayLinked: { type: Boolean, default: false },
    status: { type: String, enum: ['active', 'suspended'], default: 'active' }
  },
  { timestamps: true }
);

userSchema.pre('save', async function hashPassword(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.matchPassword = function matchPassword(entered) {
  return bcrypt.compare(entered, this.password);
};

module.exports = mongoose.model('User', userSchema);
