const log = (message, context = 'APP') => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] [${context}] ${message}`);
};

const error = (message, context = 'ERROR') => {
    const timestamp = new Date().toISOString();
    console.error(`[${timestamp}] [${context}] ${message}`);
}

export default {log, error};