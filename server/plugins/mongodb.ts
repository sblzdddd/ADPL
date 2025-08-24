// server/plugins/mongodb.ts
import mongoose from 'mongoose';
import type { Nitro } from 'nitropack';

const logger = BakaLogger.child({service: 'MongoDB'})

export default async (_nitroApp: Nitro) => {
  const mongodbUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/adpl';

  try {
    await mongoose.connect(mongodbUri);
    logger.log('success', 'Connected to MongoDB', {service: 'MongoDB'});
    
    // Wait for the connection to be ready
    await mongoose.connection.asPromise();
    logger.log('success', 'MongoDB connection is ready', {service: 'MongoDB'});
  } catch (e) {
    logger.error('Error connecting to MongoDB:', e, {service: 'MongoDB'});
  }
};