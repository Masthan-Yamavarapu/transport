// models/FinanceEnquiry.js

const mongoose = require('mongoose');

const financeEnquirySchema = new mongoose.Schema({
  enquiryId: { type: String, unique: true, required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: {
    type: String,
    enum: ['finance', 'insurance'],
  },
  vehicleType: String,
  businessDetails: {
    businessName: String,
    yearEstablished: String,
    annualTurnover: String,
  },
  loanAmount: Number,
  tenure: String,
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending',
  },
  notes: String,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
}, { timestamps: true });

module.exports = mongoose.model('FinanceEnquiry', financeEnquirySchema);
