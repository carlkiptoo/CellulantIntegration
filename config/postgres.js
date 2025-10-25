import pkg from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const {Pool} = pkg;

const pool = new Pool({
    user: process.env.PG_USER || process.env.USER,
    host: process.env.PG_HOST || 'localhost',
    database: process.env.PG_DATABASE || 'makini_cellulant',
    password: process.env.PG_PASSWORD || '',
    port: process.env.PG_PORT || 5432,
});

const connectDB = async (createTables = true) => {
    try {
        await pool.connect();
        console.log('Connected to PostgreSQL database');
        if (createTables) {
            const client = await pool.connect();

            try {
                const createStudentsTable = (await import('../src/db/student.model.js')).default;
                const createPaymentsTable = (await import('../src/db/payment.model.js')).default;

                await client.query(createStudentsTable);
                console.log('Students table ensured');
                
                await client.query(createPaymentsTable);
                console.log('Payments table ensured');
            } catch (error) {
                console.error('Error creating tables:', error);
                process.exit(1);
            }
        }
    } catch (error) {
        console.error('Error connecting to PostgreSQL database:', error);
        process.exit(1);
    }
};
export {pool, connectDB};