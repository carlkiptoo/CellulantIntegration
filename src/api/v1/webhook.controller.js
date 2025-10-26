import {client as redisClient} from '../../../config/redis.js';
import logger from '../../utils/logger.js';

const WEBHOOK_QUEUE_KEY = 'payment-notification';

export const handlePaymentNotification = async (req, res, next) => {
    const paymentData = req.body;

    if (!paymentData.transactionId || !paymentData.studentId || !paymentData.status) {
        logger.error('Missing critical fields in payload.', 'WEBHOOK_VALIDATION');
        return res.status(400).json({
            success: false,
            message: 'Missing critical fields in payload',
        });
    }

    try {
        const payloadString = JSON.stringify(paymentData);
        await redisClient.lPush(WEBHOOK_QUEUE_KEY, payloadString);

        logger.log(`Webhook notification received for transaction ID ${paymentData.transactionId}`, 'WEBHOOK_VALIDATION');
        return res.status(200).json({
            success: true,
            message: 'Payment notification received and queued for processing'
        });
    } catch (error) {
        logger.error(`Error processing webhook notification: ${error.message}`, 'WEBHOOK_VALIDATION');
        next(new Error('Queueing service unavailable'));
    }
}