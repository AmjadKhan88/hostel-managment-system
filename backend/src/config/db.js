import mongoose from 'mongoose';
import { env } from './env.js';
import { logger } from './logger.js';

mongoose.set('strictQuery', true);

export async function connectDB() {
  try {
    mongoose.connection.on('connected', () => {
      logger.info('MongoDB connected');
    });

    mongoose.connection.on('error', (err) => {
      logger.error({ err }, 'MongoDB connection error');
    });

    mongoose.connection.on('disconnected', () => {
      logger.warn('MongoDB disconnected');
    });

    await mongoose.connect(env.MONGO_URI);
  } catch (err) {
    logger.fatal({ err }, 'Failed to connect to MongoDB — exiting');
    process.exit(1);
  }
}

export async function disconnectDB() {
  await mongoose.connection.close();
}
