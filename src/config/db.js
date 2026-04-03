const mongoose = require('mongoose');

const connectDB = async () => {
  // Accept either MONGO_URI or MONGODB_URI so seed.js and server use the same db
  const URI = process.env.MONGO_URI || process.env.MONGODB_URI;

  if (!URI) {
    console.error('❌ No MongoDB URI found. Set MONGO_URI or MONGODB_URI in your .env file');
    process.exit(1);
  }

  try {
    const conn = await mongoose.connect(URI);
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (err) {
    console.error(`❌ MongoDB Error: ${err.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
