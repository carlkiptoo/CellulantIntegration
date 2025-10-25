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

const connectDB = async () => {
    try {
        await pool.connect();
        console.log('Connected to PostgreSQL database');
    } catch (error) {
        console.error('Error connecting to PostgreSQL database:', error);
        process.exit(1);
    }
};
export {pool, connectDB};