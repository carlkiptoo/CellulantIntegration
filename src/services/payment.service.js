import { pool } from "../../config/postgres.js";
import logger from "../utils/logger.js";

export const isTransactionProcessed = async (transactionId) => {
  const query = `SELECT status FROM payments WHERE transaction_id = $1 AND status = $2`;
  const result = await pool.query(query, [transactionId, "SUCCESS"]);
  return result.rows.length > 0;
};

export const processNewPayment = async (paymentData) => {
  const { transactionId, studentId, amountPaid, paymentMethod, status, timestamp } = paymentData;

  const normalizedStatus = status.toUpperCase();

  if (normalizedStatus !== "SUCCESS") {
    logger.log(`Skipping transaction ${transactionId} with status ${status}`, "Worker task");
    return false;
  }

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const studentRes = await client.query(
      `SELECT current_balance FROM students WHERE student_id = $1 FOR UPDATE`,
      [studentId]
    );

    if (studentRes.rows.length === 0) {
      throw new Error(`Student not found: ${studentId}`);
    }

    const currentBalance = parseFloat(studentRes.rows[0].current_balance);

    const paymentRes = await client.query(
      `SELECT 1 FROM payments WHERE transaction_id = $1`,
      [transactionId]
    );

    if (paymentRes.rows.length > 0) {
      logger.log(`[IDEMPOTENCY_BLOCK] Transaction ${transactionId} already processed.`, "Worker task");
      await client.query("ROLLBACK");
      return true;
    }

    const newBalance = currentBalance - amountPaid;
    if (newBalance < 0) {
      throw new Error(`Insufficient balance for student ${studentId}`);
    }

    await client.query(
      `INSERT INTO payments (transaction_id, student_id, amount_paid, payment_method, status, payment_date, cellulant_ref)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [transactionId, studentId, amountPaid, paymentMethod, normalizedStatus, timestamp, transactionId]
    );

    await client.query(
      `UPDATE students SET current_balance = $1, updated_at = NOW() WHERE student_id = $2`,
      [newBalance, studentId]
    );

    await client.query("COMMIT");

    logger.log(`Transaction ${transactionId} successfully recorded and balance updated`, "Worker task");
    return true;

  } catch (error) {
    await client.query("ROLLBACK");
    logger.error(`Error processing transaction ${transactionId}: ${error.message}`, "Worker task");
    throw new Error("Error processing transaction");
  } finally {
    client.release();
  }
};