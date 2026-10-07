const mongoose = require('mongoose');

/**
 * Connect to MongoDB with Mongoose.
 * Prints a clear success message, or a clear error and exits if unavailable.
 */
const connectDB = async () => {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    console.error(
      '[MongoDB] Missing MONGODB_URI. Please copy .env.example to .env and configure it.'
    );
    process.exit(1);
  }

  try {
    mongoose.set('strictQuery', true);

    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 10000,
    });

    console.log('MongoDB connected successfully');
    console.log(`[MongoDB] Database: ${mongoose.connection.name}`);
    console.log(`[MongoDB] Host: ${mongoose.connection.host}:${mongoose.connection.port}`);
  } catch (error) {
    console.error('MongoDB connection failed:');
    console.error(`  ${error.message}`);
    console.error(
      '[MongoDB] Make sure MongoDB is running (mongod) and MONGODB_URI in server/.env is correct.'
    );
    process.exit(1);
  }

  mongoose.connection.on('error', (err) => {
    console.error(`[MongoDB] Connection error: ${err.message}`);
  });

  mongoose.connection.on('disconnected', () => {
    console.warn('[MongoDB] Disconnected from MongoDB');
  });
};

module.exports = connectDB;
