const User = require('../models/User');

const getAllUsers = async (req, res) => {
  try {
    let filter = {};
    if (['moderator', 'regulator'].includes(req.user.role)) {
      filter = { role: { $in: ['guest', 'host'] } };
    }
    const users = await User.find(filter).select('-password').sort({ createdAt: -1 });
    return res.status(200).json({ success: true, users });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const updateUserStatus = async (req, res) => {
  try {
    const { status } = req.body;
    
    if (!['active', 'suspended'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Prevent suspending another admin (optional safety measure)
    if (user.role === 'admin' && req.user._id.toString() !== user._id.toString()) {
        // allowing admin to suspend themselves is also weird, maybe prevent all admins?
        // Let's just prevent suspending any admin
        return res.status(403).json({ success: false, message: 'Cannot suspend an admin' });
    }

    // Prevent moderators/regulators from modifying non-hosts/non-guests
    if (['moderator', 'regulator'].includes(req.user.role) && !['guest', 'host'].includes(user.role)) {
      return res.status(403).json({ success: false, message: 'Not authorized to regulate this user' });
    }

    user.status = status;
    await user.save();

    return res.status(200).json({ success: true, message: 'User status updated', user: { id: user._id, status: user.status } });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getAllUsers, updateUserStatus };
