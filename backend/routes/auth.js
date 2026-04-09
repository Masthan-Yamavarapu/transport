// routes/auth.js

const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const otpService = require('../services/otp');
const { verifyToken } = require('../middleware/auth');

// Send OTP
router.post('/send-otp', async (req, res) => {
  try {
    const { phone, role } = req.body;

    if (!phone || !role) {
      return res.status(400).json({ error: 'Phone and role required' });
    }

    if (!/^\d{10}$/.test(phone)) {
      return res.status(400).json({ error: 'Invalid phone number format' });
    }

    let user = await User.findOne({ phone });
    if (!user) {
      user = new User({ phone, role });
      await user.save();
    }

    const result = await otpService.sendOTP(phone);
    res.status(200).json({ 
      success: true, 
      message: result.message,
      phone 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Verify OTP and Login
router.post('/verify-otp', async (req, res) => {
  try {
    const { phone, otp } = req.body;

    if (!phone || !otp) {
      return res.status(400).json({ error: 'Phone and OTP required' });
    }

    const verification = otpService.verifyOTP(phone, otp);
    if (!verification.valid) {
      return res.status(400).json({ error: verification.message });
    }

    const user = await User.findOne({ phone });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const token = jwt.sign(
      { userId: user._id, phone: user.phone, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '30d' }
    );

    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        phone: user.phone,
        role: user.role,
        name: user.name,
        email: user.email,
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get current user profile
router.get('/me', verifyToken, async (req, res) => {
  try {
    res.status(200).json({
      success: true,
      user: {
        id: req.user._id,
        phone: req.user.phone,
        role: req.user.role,
        name: req.user.name,
        email: req.user.email,
        isVerified: req.user.isVerified,
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update profile
router.patch('/profile', verifyToken, async (req, res) => {
  try {
    const { name, email } = req.body;
    
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { name, email },
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: 'Profile updated',
      user: {
        id: user._id,
        phone: user.phone,
        role: user.role,
        name: user.name,
        email: user.email,
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
