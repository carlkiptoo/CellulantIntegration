import {createClient} from 'redis';
import dotenv from 'dotenv';
dotenv.config();

const client = createClient({
    url: process.env.REDIS_URL || 'redis://localhost:6379'
});

const connectRedis = async () => {
    try {
        if (!client.isOpen) {
            await client.connect();
        }
        console.log('Redis client connected');
    } catch (error) {
        console.error('Error connecting to Redis:', error);
        process.exit(1);
    }
}

const disconnectRedis = async () => {
    if (client.isOpen) {
        await client.disconnect();
        console.log('Redis client disconnected');
    }
}

export {client, connectRedis, disconnectRedis};