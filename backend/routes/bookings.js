// routes/bookings.js

const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking');
const { verifyToken, requireRole } = require('../middleware/auth');

// Create booking (Customer)
router.post('/', verifyToken, requireRole(['customer']), async (req, res) => {
  try {
    const { from, to, date, time, goodsType, truckType } = req.body;

    if (!from || !to || !date || !time || !goodsType || !truckType) {
      return res.status(400).json({ error: 'All fields required' });
    }

    const booking = new Booking({
      bookingId: `BK-${Date.now()}`,
      customerId: req.user._id,
      from,
      to,
      date,
      time,
      goodsType,
      truckType,
      estimatedCost: calculateCost(truckType),
      status: 'pending',
    });

    await booking.save();

    res.status(201).json({
      success: true,
      message: 'Booking created',
      booking,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get bookings
router.get('/', verifyToken, async (req, res) => {
  try {
    let query = {};
    
    if (req.user.role === 'customer') {
      query.customerId = req.user._id;
    }

    const bookings = await Booking.find(query).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      bookings,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get single booking
router.get('/:id', verifyToken, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    res.status(200).json({
      success: true,
      booking,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update booking status (Staff)
router.patch('/:id/status', verifyToken, requireRole(['staff']), async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['pending', 'accepted', 'in-transit', 'delivered', 'cancelled'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      { status, updatedAt: new Date() },
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: 'Booking status updated',
      booking,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Set final cost (Staff)
router.patch('/:id/cost', verifyToken, requireRole(['staff']), async (req, res) => {
  try {
    const { finalCost } = req.body;

    if (!finalCost) {
      return res.status(400).json({ error: 'Final cost required' });
    }

    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      { finalCost, status: 'accepted' },
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: 'Cost updated',
      booking,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

function calculateCost(truckType) {
  const baseCosts = {
    '2-axle': 5000,
    '3-axle': 7500,
    '6-axle': 10000,
  };
  return baseCosts[truckType] || 5000;
}

module.exports = router;
