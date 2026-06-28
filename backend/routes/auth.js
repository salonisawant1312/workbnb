const express = require('express');
const { register, login, getCurrentUser, otpLogin } = require('../controllers/authController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/otp-login', otpLogin);
router.get('/me', protect, getCurrentUser);

module.exports = router;
