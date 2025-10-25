import express from "express";
import { simulateValidation, simulateWebhook } from "./simulator.controller.js";

const router = express.Router();

router.post('/simulate/validation/:studentId', simulateValidation);
router.get('/simulate/webhook/:studentId/:status', simulateWebhook);

export default router;
