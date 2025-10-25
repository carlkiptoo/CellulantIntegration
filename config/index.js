import dotenv from 'dotenv';
import {connectDB} from './postgres.js';
import {connectRedis} from './redis.js';

dotenv.config();

const config = {
    port: process.env.PORT || 3000,
    env: process.env.NODE_ENV || 'development',
};

export const initializeInfra = async () => {
    await connectDB();
    await connectRedis();
}

export default config;