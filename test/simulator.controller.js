import fetch from "node-fetch";
import config from "../config/index.js";

const API_URL = `http://localhost:${config.port}/api/v1`;
const BEARER_TOKEN = process.env.CELLULANT_BEARER_TOKEN;

const getMockValidationPayload = (studentId, amount) => ({
  studentId,
  amount,
  transactionRef: `MockRef_${Date.now()}`,
});

const getMockWebhookPayload = (studentId, status, method = "MPESA") => ({
  transactionId: `TXN_${Date.now()}_${Math.random()
    .toString(36)
    .substring(2, 9)}`,
  studentId: studentId,
  amountPaid: 50000.0,
  paymentMethod: method,
  status: status,
  timestamp: new Date().toISOString(),
});

const sendMockRequest = async (path, body) => {
  const url = `${API_URL}${path}`;
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${BEARER_TOKEN}`,
    },
    body: JSON.stringify(body),
  });

  const responseBody = await response.json().catch(() => ({}));
  return {
    status: response.status,
    body: responseBody,
  };
};

export const simulateValidation = async (req, res, next) => {
  const { studentId } = req.params;
  const amount = req.body.amount || 50000.0;

  const payload = getMockValidationPayload(studentId, amount);

  try {
    const result = await sendMockRequest("/validation", payload);

    res.status(200).json({
      simulationStatus: "SENT_TO_VALIDATION_API",
      requestPayload: payload,
      apiResponse: result.body,
      apiStatus: result.status,
    });
  } catch (error) {
    next(error);
  }
};
export const simulateWebhook = async (req, res, next) => {
    const {studentId, status} = req.params;

    const customTxnId = req.query.transactionId;
    const payload = getMockWebhookPayload(
        studentId,
        status,
        'MPESA'
    );

    if (customTxnId) {
        payload.transactionId = customTxnId;
    }

    try {
        const result = await sendMockRequest('/payment/notification', payload);

        res.status(200).json({
            simulationStatuus: result.status === 200 ? 'SUUCCESSFULLY QUEUED' : 'FAILED TO QUEUE',
            requestPayload: payload,
            apiResponse: result.body,
            apiStatus: result.status,
            note: 'Check Redis and Postgres for results'
        })
    } catch (error) {
        next(error);
    }

}