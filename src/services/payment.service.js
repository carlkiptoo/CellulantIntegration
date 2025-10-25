import { pool } from "../../config/postgres.js";
import logger from "../utils/logger.js";

export const isTransactionProcessed = async (transactionId) => {
    const query = `SELECT status FROM payments WHERE transaction_id = $1 AND status = $2`;
    const result = await pool.query(query, [transactionId, 'SUCCESS']);
    return result.rows.length > 0;
};
/**
 * Handles the full payment transaction (Idempotency check, record, update balance).
 * NOTE: This will be implemented fully later using a PostgreSQL transaction.
 */

export const processNewPayment = async (paymentData) => {
    logger.log(`Processing new payment: ${JSON.stringify(paymentData.transactionId)}`, 'Worker task');

    // Placeholder logic for now:
    // 1. START Transaction
    // 2. Insert into Payments table
    // 3. Update Students balance
    // 4. COMMIT Transaction
    
    // In the final implementation, this should return a status after the transaction.
    return true;
}
