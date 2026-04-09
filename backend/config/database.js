// config/database.js

const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.DATABASE_URL || 'mongodb://localhost:27017/transmaa', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log(`✓ MongoDB connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error('✗ MongoDB connection error:', error.message);
    process.exit(1);
  }
};

module.exports = connectDB;
