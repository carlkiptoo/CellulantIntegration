import express from 'express';
import {verifyApiKey} from '../../middleware/auth.middleware.js';
import {handleValidationRequest} from './validation.controller.js';
import {handlePaymentNotification} from './webhook.controller.js';

const router = express.Router();

router.use(verifyApiKey);

router.post('/validation', handleValidationRequest);
router.post('/payment/notification', handlePaymentNotification);

export default router;