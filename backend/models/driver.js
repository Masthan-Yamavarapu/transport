// models/Driver.js

const mongoose = require('mongoose');

const driverSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  personalInfo: {
    fullName: String,
    dateOfBirth: Date,
    address: String,
    licenseNumber: String,
    licenseExpiry: Date,
  },
  vehicleInfo: {
    registrationNumber: String,
    vehicleType: String,
    capacity: String,
    documentUrl: String,
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending',
  },
  verificationNotes: String,
  activeLoads: [
    {
      loadId: String,
      route: String,
      status: String,
    }
  ],
  completedDeliveries: { type: Number, default: 0 },
  rating: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
}, { timestamps: true });

module.exports = mongoose.model('Driver', driverSchema);
