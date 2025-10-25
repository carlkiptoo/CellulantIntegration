import dotenv from 'dotenv';
dotenv.config();

export const verifyApiKey = (req, res, next) => {
    const apiKey = req.headers['x-api-key'] || req.query.api_key;

    if (!apiKey || apiKey !== process.env.CELLULANT_API_KEY) {
        console.warn(`Unauthorized attempt with invalid API key: ${apiKey}`);
        return res.status(401).json({
            success: false,
            message: 'Unauthorized attempt with invalid API key',
        })
    }
    next();
}