import {pool, connectDB} from '../../config/postgres.js';
import createPaymentsTable from './payment.model.js';
import createStudentsTable from './student.model.js';

const studentData = [
    {student_id: 'S001', first_name: 'Zawadi', last_name: 'Imani', enrollment_status: 'ACTIVE', current_balance: 150000.00, email: 'zawadi@gmail.com'},
    {student_id: 'S002', first_name: 'Mohammed', last_name: 'Ali', enrollment_status: 'INACTIVE', current_balance: 100000.00, email: 'mohammed@gmail.com'},
    {student_id: 'S003', first_name: 'Yusuf', last_name: 'Ali', enrollment_status: 'ACTIVE', current_balance: 100000.00, email: 'aliyusuf@gmail.com'},
    {student_id: 'S004', first_name: 'Joan', last_name: 'Zuria', enrollment_status: 'ACTIVE', current_balance: 100000.00, email: 'joanzuria@gmail.com'},
    {student_id: 'S005', first_name: 'John', last_name: 'Doe', enrollment_status: 'ACTIVE', current_balance: 100000.00, email: 'john@gmail.com'},
];

const seedDatabase = async () => {
    await connectDB(false);

    let client;

    try {
        
        client = await pool.connect();
        console.log('Seeding database with initial student data...');

        await client.query(createStudentsTable);
        await client.query(createPaymentsTable);

        console.log('Starting data insertion...');

        await client.query('DELETE FROM students;');

        const insertQuery = `
            INSERT INTO students (student_id, first_name, last_name, enrollment_status, current_balance, email)
            VALUES ($1, $2, $3, $4, $5, $6)
            ON CONFLICT (student_id) DO NOTHING;
        `;

        for (const student of studentData) {
            const values = [
                student.student_id,
                student.first_name,
                student.last_name,
                student.enrollment_status,
                student.current_balance,
                student.email

            ];
            await client.query(insertQuery, values);
        }
        console.log(`Seeding successful: Inserted ${studentData.length} students.`);
        client.release();
    } catch (error) {
        console.error('Error seeding database:', error);
    } finally {
     process.exit(0);
    }
};
seedDatabase();