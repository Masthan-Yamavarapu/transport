// routes/finance.js

const express = require('express');
const router = express.Router();
const FinanceEnquiry = require('../models/FinanceEnquiry');
const { verifyToken, requireRole } = require('../middleware/auth');

// Create finance/insurance enquiry
router.post('/', verifyToken, requireRole(['customer']), async (req, res) => {
  try {
    const { type, vehicleType, businessDetails, loanAmount, tenure } = req.body;

    if (!type || !vehicleType || !businessDetails || !loanAmount) {
      return res.status(400).json({ error: 'All fields required' });
    }

    const enquiry = new FinanceEnquiry({
      enquiryId: `FIN-${Date.now()}`,
      userId: req.user._id,
      type,
      vehicleType,
      businessDetails,
      loanAmount,
      tenure,
      status: 'pending',
    });

    await enquiry.save();

    res.status(201).json({
      success: true,
      message: 'Enquiry submitted',
      enquiry,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get user enquiries
router.get('/', verifyToken, async (req, res) => {
  try {
    let query = {};

    if (req.user.role === 'customer') {
      query.userId = req.user._id;
    }

    const enquiries = await FinanceEnquiry.find(query)
      .populate('userId', 'phone name email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      enquiries,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get single enquiry
router.get('/:id', verifyToken, async (req, res) => {
  try {
    const enquiry = await FinanceEnquiry.findById(req.params.id);

    if (!enquiry) {
      return res.status(404).json({ error: 'Enquiry not found' });
    }

    res.status(200).json({
      success: true,
      enquiry,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update enquiry status (Staff)
router.patch('/:id', verifyToken, requireRole(['staff']), async (req, res) => {
  try {
    const { status, notes } = req.body;
    const validStatuses = ['pending', 'approved', 'rejected'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const enquiry = await FinanceEnquiry.findByIdAndUpdate(
      req.params.id,
      { status, notes },
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: 'Enquiry updated',
      enquiry,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
