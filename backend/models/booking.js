// models/Booking.js

const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  bookingId: { type: String, unique: true, required: true },
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'in-transit', 'delivered', 'cancelled'],
    default: 'pending',
  },
  from: String,
  to: String,
  date: Date,
  time: String,
  goodsType: String,
  truckType: {
    type: String,
    enum: ['2-axle', '3-axle', '6-axle'],
  },
  estimatedCost: Number,
  finalCost: Number,
  driver: {
    driverId: String,
    name: String,
    phone: String,
  },
  notes: String,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
}, { timestamps: true });

module.exports = mongoose.model('Booking', bookingSchema);
