import {client as redisClient} from '../../config/redis.js';
import { processNewPayment } from '../services/payment.service.js';
import logger from '../utils/logger.js';

const WEBHOOK_QUEUE_KEY = 'payment-notification';

export const startWebhookConsumer = () => {
    logger.log('Starting webhook consumer...', 'WORKER');

    const pollQueue = async () => {
        try {
            const result = await redisClient.blPop(WEBHOOK_QUEUE_KEY, 0);
            if (result && result.element) {
                const rawPayload = result.element;
                const paymentData = JSON.parse(rawPayload);
                const {transactionId} = paymentData;

                logger.log(`Processing webhook notification for transaction ${transactionId}`, 'CONSUMER_TASK');

                await processNewPayment(paymentData);
                logger.log(`Webhook notification for transaction ${transactionId} processed`, 'CONSUMER_TASK');
            }
        } catch (error) {
            logger.error(`Error processing webhook notification: ${error.message}`, 'CONSUMER_ERROR');
        }
        setTimeout(pollQueue, 10);
    };
    pollQueue();
}