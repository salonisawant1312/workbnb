const User = require('../models/User');
const signToken = require('../utils/signToken');

const register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ success: false, message: 'Email already in use' });

    const user = await User.create({ name, email, password, role: role || 'guest' });
    const token = signToken(user._id);

    return res.status(201).json({
      success: true,
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Look up by email OR name (case-insensitive)
    const user = await User.findOne({
      $or: [
        { email: email.toLowerCase().trim() },
        { name: new RegExp('^' + email.trim().replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&') + '$', 'i') }
      ]
    }).select('+password');

    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    if (user.status === 'suspended') {
      return res.status(403).json({ success: false, message: 'Your account has been suspended' });
    }

    const token = signToken(user._id);
    return res.status(200).json({
      success: true,
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const otpLogin = async (req, res) => {
  try {
    const { phoneNumber, name } = req.body;
    if (!phoneNumber) {
      return res.status(400).json({ success: false, message: 'Phone number is required' });
    }

    let user = await User.findOne({ phone: phoneNumber });
    if (!user) {
      const cleanPhone = phoneNumber.replace(/[^0-9]/g, '');
      const email = `${cleanPhone}@workbnb.com`;
      const password = Math.random().toString(36).slice(-10) + 'A1!';

      user = await User.create({
        name: name || `User ${phoneNumber}`,
        email,
        password,
        phone: phoneNumber,
        role: 'guest'
      });
    }

    if (user.status === 'suspended') {
      return res.status(403).json({ success: false, message: 'Your account has been suspended' });
    }

    const token = signToken(user._id);
    return res.status(200).json({
      success: true,
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const getCurrentUser = async (req, res) => {
  return res.status(200).json({ success: true, user: req.user });
};

module.exports = { register, login, getCurrentUser, otpLogin };
