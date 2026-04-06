const mongoose = require('mongoose');

const connectDB = async () => {
  console.log('Connecting to MongoDB:', process.env.MONGO_URI || process.env.MONGO_URL || 'NOT SET');
  const conn = await mongoose.connect(process.env.MONGO_URI || process.env.MONGO_URL);
  console.log(`MongoDB Connected: ${conn.connection.host}`);
};

module.exports = connectDB;
