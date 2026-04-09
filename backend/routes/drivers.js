// routes/drivers.js

const express = require('express');
const router = express.Router();
const Driver = require('../models/Driver');
const User = require('../models/User');
const { verifyToken, requireRole } = require('../middleware/auth');

// Register driver
router.post('/register', verifyToken, async (req, res) => {
  try {
    const { personalInfo, vehicleInfo } = req.body;

    if (!personalInfo || !vehicleInfo) {
      return res.status(400).json({ error: 'Personal and vehicle info required' });
    }

    let driver = await Driver.findOne({ userId: req.user._id });

    if (driver) {
      driver.personalInfo = personalInfo;
      driver.vehicleInfo = vehicleInfo;
      driver.updatedAt = new Date();
    } else {
      driver = new Driver({
        userId: req.user._id,
        personalInfo,
        vehicleInfo,
        status: 'pending',
      });
    }

    await driver.save();

    res.status(201).json({
      success: true,
      message: 'Driver registration submitted',
      driver,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get driver profile
router.get('/profile', verifyToken, async (req, res) => {
  try {
    const driver = await Driver.findOne({ userId: req.user._id });

    if (!driver) {
      return res.status(404).json({ error: 'Driver profile not found' });
    }

    res.status(200).json({
      success: true,
      driver,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all driver registrations (Staff)
router.get('/', verifyToken, requireRole(['staff']), async (req, res) => {
  try {
    const { status } = req.query;
    let query = {};

    if (status) {
      query.status = status;
    }

    const drivers = await Driver.find(query)
      .populate('userId', 'phone name email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      drivers,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Approve driver (Staff)
router.patch('/:driverId/approve', verifyToken, requireRole(['staff']), async (req, res) => {
  try {
    const { verificationNotes } = req.body;

    const driver = await Driver.findByIdAndUpdate(
      req.params.driverId,
      {
        status: 'approved',
        verificationNotes,
        updatedAt: new Date(),
      },
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: 'Driver approved',
      driver,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Reject driver (Staff)
router.patch('/:driverId/reject', verifyToken, requireRole(['staff']), async (req, res) => {
  try {
    const { verificationNotes } = req.body;

    const driver = await Driver.findByIdAndUpdate(
      req.params.driverId,
      {
        status: 'rejected',
        verificationNotes,
        updatedAt: new Date(),
      },
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: 'Driver rejected',
      driver,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
