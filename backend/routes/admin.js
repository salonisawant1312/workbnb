const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const { getAllUsers, updateUserStatus } = require('../controllers/adminController');

router.get('/users', protect, authorize('admin', 'moderator', 'regulator'), getAllUsers);
router.put('/users/:id/status', protect, authorize('admin', 'moderator', 'regulator'), updateUserStatus);

module.exports = router;
