const createPaymentsTable = `
CREATE TABLE IF NOT EXISTS payments (
    transaction_id VARCHAR(100) PRIMARY KEY,
    student_id VARCHAR(50) REFERENCES students(student_id),
    cellulant_ref VARCHAR(100) UNIQUE,
    amount_paid DECIMAL(10, 2) NOT NULL,
    payment_method VARCHAR(50) NOT NULL,
    status VARCHAR(20) NOT NULL,
    payment_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
Index on transaction_id for faster queries
CREATE INDEX IF NOT EXISTS idx_payment_method ON payments (payment_method);
CREATE INDEX IF NOT EXISTS idx_payment_status ON payments (status);
    `;

export default createPaymentsTable;