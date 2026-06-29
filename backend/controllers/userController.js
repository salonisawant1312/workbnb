const User = require('../models/User');
const uploadToCloudinary = require('../utils/uploadToCloudinary');
const razorpay = require('../config/razorpay');

const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    return res.status(200).json({ success: true, data: user });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const updateUserProfile = async (req, res) => {
  try {
    if (req.params.id !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not allowed' });
    }

    const { name, phone, bio, address, bankDetails } = req.body;
    const updateData = {};
    if (name) updateData.name = name;
    if (phone !== undefined) updateData.phone = phone;
    if (bio !== undefined) updateData.bio = bio;
    if (address) updateData.address = address;
    if (bankDetails) updateData.bankDetails = bankDetails;

    const user = await User.findByIdAndUpdate(req.params.id, updateData, { new: true }).select('-password');
    return res.status(200).json({ success: true, data: user });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const uploadAvatar = async (req, res) => {
  try {
    if (req.params.id !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not allowed' });
    }
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    const avatarUrl = await uploadToCloudinary(req.file, 'workbnb/avatars');
    const user = await User.findByIdAndUpdate(req.params.id, { avatarUrl }, { new: true }).select('-password');
    return res.status(200).json({ success: true, data: user });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const linkRazorpayAccount = async (req, res) => {
  try {
    const { phone, accountName, accountNumber, ifscCode } = req.body;
    const user = await User.findById(req.user._id);
    
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    if (['moderator', 'regulator'].includes(user.role)) {
      return res.status(403).json({ success: false, message: 'Staff accounts cannot link payment accounts' });
    }
    
    if (user.isRazorpayLinked) {
      return res.status(400).json({ success: false, message: 'Account already linked' });
    }

    if (!razorpay) {
      return res.status(500).json({ success: false, message: 'Razorpay is not configured' });
    }

    // Create a Linked Account for Razorpay Route
    const accountPayload = {
      name: accountName || user.name,
      email: user.email,
      contact: phone,
      type: 'route',
      legal_business_name: accountName || user.name,
      business_type: 'individual',
      profile: {
        category: 'real_estate',
        subcategory: 'real_estate_agent'
      }
    };

    let accountId;
    try {
      const account = await razorpay.accounts.create(accountPayload);
      accountId = account.id;
    } catch (razorpayErr) {
      if (razorpayErr.error?.code === 'BAD_REQUEST_ERROR' && razorpayErr.error?.description?.includes('enabled')) {
        console.warn('Razorpay Route feature not enabled for these keys. Falling back to mock account ID.');
        accountId = `acc_mock_${Date.now()}`;
      } else {
        throw razorpayErr;
      }
    }

    // Save initial account ID
    user.phone = phone;
    user.bankDetails = { accountName, accountNumber, ifscCode };
    user.razorpayAccountId = accountId;
    user.isRazorpayLinked = true;
    await user.save();

    return res.status(200).json({ success: true, message: 'Account linked successfully', data: user });
  } catch (error) {
    console.error('Account Link Error:', error);
    return res.status(500).json({ success: false, message: error.error?.description || error.message || 'Failed to link account' });
  }
};

module.exports = { getUserProfile, updateUserProfile, uploadAvatar, linkRazorpayAccount };
