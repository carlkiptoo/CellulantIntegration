import app from "./app.js";
import config, {initializeInfra} from '../config/index.js';
import logger from "./utils/logger.js";

const startServer = async () => {
    try {
        await initializeInfra();

        const server = app.listen(config.port, () => {
            logger.log(`Server started on port ${config.port}`, 'SERVER');
            logger.log(`Environment: ${config.env}`, 'SERVER');
            logger.log(`Validation API: /api/v1/validation`, 'ROUTES');
            logger.log(`Webhook API: /api/v1/payment/notification`, 'ROUTES');
        });

        process.on('SIGINT', () => {
            logger.log('SIGINT received, shutting down...', 'SERVER');
            server.close(() => {
                logger.log('HTTP server closed.', 'SERVER');
                process.exit(0);
            })
        })
    } catch (error) {
        logger.error(`Failed to start server: ${error.message}`, 'SERVER');
        process.exit(1);
    }
}

startServer();