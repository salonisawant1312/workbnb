const express = require('express');
const { getUserProfile, updateUserProfile, uploadAvatar } = require('../controllers/userController');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');

const router = express.Router();

router.get('/:id', getUserProfile);
router.patch('/:id', protect, updateUserProfile);
router.post('/:id/avatar', protect, upload.single('avatar'), uploadAvatar);

module.exports = router;
