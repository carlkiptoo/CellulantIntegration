import { pool } from "../../config/postgres.js";
import logger from "../utils/logger.js";

export const validateStudent = async (studentId) => {
    const query = 'SELECT first_name, last_name, enrollment_status, current_balance FROM students WHERE student_id = $1';

    try {
        const result = await pool.query(query, [studentId]);
        const student = result.rows[0];

        if (!student) {
            logger.log(`Student ID ${studentId} not found`, 'Validation');
            return {exists: false, status: 'INVALID', message: 'Student not found'};
        }

        const name = `${student.first_name} ${student.last_name}`;

        if (student.enrollment_status !== 'ACTIVE') {
            logger.log(`Student ID ${studentId} is not active. Status: ${student.enrollment_status}`, 'Validation');
            return {
                exists: true,
                status: 'INVALID',
                message: `Student enrollment is ${student.enrollment_status.toLowerCase()}`,
            };
        }

        return {
            exists: true,
            status: 'VALID',
            name,
            message: 'Student is active and valid',
        }
    } catch (error) {
        logger.error(`Error validating student ID ${studentId}: ${error.message}`, 'Validation');
        throw new Error('Database error during validation');
    }
}