const createStudentsTable = `
    CREATE TABLE IF NOT EXISTS students (
        student_id VARCHAR(50) PRIMARY KEY,
        first_name VARCHAR(100) NOT NULL,
        last_name VARCHAR(100) NOT NULL,
        enrollment_status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE'
            CHECK (enrollment_status IN ('ACTIVE', 'INACTIVE')),
        current_balance DECIMAL(15, 2) NOT NULL DEFAULT 0.00
            CHECK (current_balance >= 0),
        email VARCHAR(150) UNIQUE NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Index on enrollment_status for faster queries
CREATE INDEX IF NOT EXISTS idx_enrollment_status ON students (enrollment_status);
CREATE INDEX IF NOT EXISTS idx_students_status_balance 
        ON students (enrollment_status, current_balance);

         -- Function to auto-update the updated_at timestamp
    CREATE OR REPLACE FUNCTION update_students_updated_at()
    RETURNS TRIGGER AS $$
    BEGIN
        NEW.updated_at = CURRENT_TIMESTAMP;
        RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;

    -- Trigger to call the function before any UPDATE
    DROP TRIGGER IF EXISTS trigger_students_updated_at ON students;
    CREATE TRIGGER trigger_students_updated_at
        BEFORE UPDATE ON students
        FOR EACH ROW
        EXECUTE FUNCTION update_students_updated_at();

`;

export default createStudentsTable;
