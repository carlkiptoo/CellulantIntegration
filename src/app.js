import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import config  from '../config/index.js';
import logger from './utils/logger.js';
// import routerV1 from './routes/v1/index.js';
import errorMiddleware from './middleware/error.middleware.js';

const app = express();

app.use(cors());
app.use(bodyParser.json({
    limit: '10kb'
}));
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
    logger.log(`Incoming request: ${req.method} ${req.path}`);
    next();
})

// app.use('/api/v1', routerV1);

// app.use('/debug', testRouter);

app.get('/health', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'Server is running',
    });
});

app.use(errorMiddleware);

export default app;