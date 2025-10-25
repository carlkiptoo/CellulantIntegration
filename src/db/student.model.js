const createStudentsTable = `
    CREATE TABLE IF NOT EXISTS students (
        student_id VARCHAR(50) PRIMARY KEY,
        first_name VARCHAR(100) NOT NULL,
        last_name VARCHAR(100) NOT NULL,
        enrollment_status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
        current_balance DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
        email VARCHAR(150),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

Index on enrollment_status for faster queries
CREATE INDEX IF NOT EXISTS idx_enrollment_status ON students (enrollment_status);

`;

export default createStudentsTable;