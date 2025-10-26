import express from "express";
import { simulateValidation, simulateWebhook } from "./simulator.controller.js";
import {verifyBearerToken} from '../src/middleware/auth.middleware.js';

const router = express.Router();
router.use(verifyBearerToken);
router.post('/simulate/validation/:studentId', simulateValidation);
router.post('/simulate/webhook/:studentId/:status', simulateWebhook);

export default router;
