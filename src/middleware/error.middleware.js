import logger from "../utils/logger.js";
import dotenv from 'dotenv';
dotenv.config();

const errorMiddleware = (err, req, res, next) => {
    logger.error(`Path: ${req.path}, Method: ${req.method}, Error: ${err.message}`);

    const statusCode = err.statusCode || 500;
    let message = err.message || 'Internal Server Error';
    
    if (statusCode === 500 && process.env.NODE_ENV === 'production') {
        message = 'An unexpected error occurred. Please try again later.';
    }
    res.status(statusCode).json({
        success: false,
        message,
    });
}

export default errorMiddleware;