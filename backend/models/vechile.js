// models/Vehicle.js

const mongoose = require('mongoose');

const vehicleSchema = new mongoose.Schema({
  listingId: { type: String, unique: true, required: true },
  sellerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  vehicleType: String,
  brand: String,
  model: String,
  yearOfManufacture: Number,
  registrationNumber: String,
  capacity: String,
  price: Number,
  condition: {
    type: String,
    enum: ['new', 'used', 'refurbished'],
  },
  description: String,
  imageUrl: String,
  status: {
    type: String,
    enum: ['available', 'sold', 'pending'],
    default: 'available',
  },
  buyerInterest: [
    {
      buyerId: String,
      buyerName: String,
      buyerPhone: String,
      message: String,
      timestamp: Date,
    }
  ],
  approvedByStaff: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
}, { timestamps: true });

module.exports = mongoose.model('Vehicle', vehicleSchema);
