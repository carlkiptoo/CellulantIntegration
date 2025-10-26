import {connectDB} from '../../config/postgres.js';
import {connectRedis} from '../../config/redis.js';
import {startWebhookConsumer} from './webhook.consumer.js';
import logger from '../utils/logger.js';

const startWorker = async () => {
    try {
        logger.log('Starting worker processes...', 'WORKER');

        await connectDB(false);
        await connectRedis();

        startWebhookConsumer();
    } catch (error) {
        logger.error(`Failed to start worker processes: ${error.message}`, 'WORKER');
        process.exit(1);
    }
    
}

startWorker();