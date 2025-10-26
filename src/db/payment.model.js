const createPaymentsTable = `
  CREATE TABLE IF NOT EXISTS payments (
      transaction_id VARCHAR(100) PRIMARY KEY,
      student_id VARCHAR(50) NOT NULL REFERENCES students(student_id) ON DELETE RESTRICT,
      cellulant_ref VARCHAR(100) UNIQUE,
      amount_paid DECIMAL(15, 2) NOT NULL CHECK (amount_paid >= 0),
      payment_method VARCHAR(50) NOT NULL
        CHECK (payment_method IN ('MPESA', 'CARD', 'BANK_TRANSFER')),
      status VARCHAR(20) NOT NULL
        CHECK (status IN ('SUCCESS', 'FAILURE', 'CANCELLED', 'PENDING')),
      payment_date TIMESTAMPTZ,
      description TEXT,
      metadata JSONB,
      created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
  );

  CREATE INDEX IF NOT EXISTS idx_payments_student_id ON payments (student_id);
  CREATE INDEX IF NOT EXISTS idx_payments_method ON payments (payment_method);
  CREATE INDEX IF NOT EXISTS idx_payments_cellulant_ref ON payments (cellulant_ref) WHERE cellulant_ref IS NOT NULL;
  CREATE INDEX IF NOT EXISTS idx_payments_metadata ON payments USING GIN (metadata) WHERE metadata IS NOT NULL;

  CREATE OR REPLACE FUNCTION update_payments_updated_at()
  RETURNS TRIGGER AS $$
  BEGIN
      NEW.updated_at = CURRENT_TIMESTAMP;
      RETURN NEW;
  END;
  $$ LANGUAGE plpgsql;

  DROP TRIGGER IF EXISTS trigger_payments_updated_at ON payments;
  CREATE TRIGGER trigger_payments_updated_at
      BEFORE UPDATE ON payments
      FOR EACH ROW
      EXECUTE FUNCTION update_payments_updated_at();
`;

export default createPaymentsTable;