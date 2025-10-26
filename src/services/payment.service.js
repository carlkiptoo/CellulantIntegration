import { pool } from "../../config/postgres.js";
import logger from "../utils/logger.js";

export const isTransactionProcessed = async (transactionId) => {
  const query = `SELECT status FROM payments WHERE transaction_id = $1 AND status = 'SUCCESS'`;
  const result = await pool.query(query, [transactionId]);
  return result.rows.length > 0;
};

export const processNewPayment = async (paymentData) => {
  const { transactionId, studentId, amountPaid, paymentMethod, status, timestamp } = paymentData;
  const normalizedStatus = status.toUpperCase();
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

    if (normalizedStatus === "SUCCESS") {
      const processed = await isTransactionProcessed(transactionId);
      if (processed) {
        logger.log(`[IDEMPOTENCY_BLOCK] Transaction ${transactionId} already processed.`, "Worker task");
        await client.query("ROLLBACK");
        return true;
      }
    }

    await client.query(
      `INSERT INTO payments (transaction_id, student_id, amount_paid, payment_method, status, payment_date, cellulant_ref)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [transactionId, studentId, amountPaid, paymentMethod, normalizedStatus, timestamp, transactionId]
    );
    
    if (normalizedStatus === "SUCCESS") {
      const newBalance = currentBalance - amountPaid;
      if (newBalance < 0) {
        throw new Error(`Insufficient balance for student ${studentId}`);
      }

      await client.query(
        `UPDATE students SET current_balance = $1, updated_at = NOW() WHERE student_id = $2`,
        [newBalance, studentId]
      );

      logger.log(`[TXN_COMPLETE] Transaction ${transactionId} successfully recorded and balance updated`, "Worker task");
    } else {
      logger.log(`[TXN_LOGGED] Transaction ${transactionId} logged with status ${normalizedStatus} (balance unchanged)`, "Worker task");
    }

    await client.query("COMMIT");
    return true;

  } catch (error) {
    await client.query("ROLLBACK");
    logger.error(`Error processing transaction ${transactionId}: ${error.message}`, "Worker task");
    throw new Error("Error processing transaction");
  } finally {
    client.release();
  }
};
