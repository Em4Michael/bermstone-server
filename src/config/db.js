const mongoose = require('mongoose');

const connectDB = async () => {
  const uri = process.env.MONGO_URI || process.env.MONGODB_URI; // accept both spellings

  if (!uri) {
    console.error('❌ MONGO_URI is not defined in environment variables');
    process.exit(1);
  }

  const options = {
    serverSelectionTimeoutMS: 10000, 
    socketTimeoutMS: 45000,
    maxPoolSize: 10,
    retryWrites: true,
  };

  let retries = 5;

  while (retries > 0) {
    try {
      const conn = await mongoose.connect(uri, options);
      console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
      return; // success — exit the loop
    } catch (error) {
      retries -= 1;
      console.error(`❌ MongoDB connection failed: ${error.message}`);
      if (retries === 0) {
        console.error('❌ All retries exhausted. Exiting.');
        process.exit(1);
      }
      console.log(`🔄 Retrying in 5s... (${retries} attempts left)`);
      await new Promise(res => setTimeout(res, 5000));
    }
  }
};

mongoose.connection.on('disconnected', () => {
  console.log('⚠️  MongoDB disconnected — attempting auto-reconnect...');
});

mongoose.connection.on('reconnected', () => {
  console.log('✅ MongoDB reconnected');
});

mongoose.connection.on('error', (err) => {
  console.error(`❌ MongoDB runtime error: ${err.message}`);
});

module.exports = connectDB;