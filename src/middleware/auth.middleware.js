import dotenv from 'dotenv';
dotenv.config();

export const verifyBearerToken = (req, res, next) => {
    const authHeader = req.get('Authorization');
   
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        console.warn(`Unauthorized attempt with invalid API key: ${authHeader}`);
        return res.status(401).json({
            success: false,
            message: 'Missing Authorization header',
        })
    }
    const token = authHeader.split(' ')[1];
    if (token !== process.env.CELLULANT_BEARER_TOKEN) {
        console.warn(`Unauthorized attempt with invalid token: ${token}`);
        return res.status(401).json({
            success: false,
            message: 'Unauthorized attempt with invalid token',
        });
    }
    next();
}