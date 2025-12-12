import config from "@/config";
import mongoose from "mongoose";
import type { ConnectOptions } from "mongoose";
import { logger } from "./winston";



const clientOptions: ConnectOptions = {
  dbName: 'blog-db',
  appName: 'Blog API',
  serverApi: {
    version: '1',
    strict: true,
    deprecationErrors: true
  }
}


export const connectToDatabase = async (): Promise<void> => {


  if (!config.MONGO_URI) {
    throw new Error('MongoDB URI is not defined in the configuration.');
  }

  try {
    await mongoose.connect(config.MONGO_URI, clientOptions);
    logger.info('Connected to the database succesfuly.', {
      uri: config.MONGO_URI,
      options: clientOptions,
    });
  } catch (error) {

    if (error instanceof Error) {
      throw error;
    }

    logger.error('Failed to connect to MongoDB', error);
  }
}

export const disconnectFromDatabase = async (): Promise<void> => {
  try {
    await mongoose.disconnect();
    logger.info('Disconnected from the database.', {
      uri: config.MONGO_URI,
      options: clientOptions,
    });
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(error.message);
    }
    logger.error('Failed to disconnect from the database', error);
  }
}