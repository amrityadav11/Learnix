const mongoose = require('mongoose');

let retryCount = 0;
const maxRetries = 5;

const connectDB = async () => {
    return new Promise((resolve, reject) => {
        const attemptConnection = async () => {
            try {
                const conn = await mongoose.connect(process.env.MONGO_URI, {
                    serverSelectionTimeoutMS: 10000,
                    socketTimeoutMS: 45000,
                    retryWrites: true,
                    w: 'majority',
                });
                console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
                retryCount = 0;
                resolve(conn);
            } catch (error) {
                console.error(`❌ MongoDB Connection Error: ${error.message}`);

                if (retryCount < maxRetries) {
                    retryCount++;
                    console.log(`⚠️  Retrying connection (${retryCount}/${maxRetries}) in 5 seconds...`);
                    setTimeout(attemptConnection, 5000);
                } else {
                    console.log('⚠️  Max retries reached. Check your MONGO_URI, network, and MongoDB Atlas IP whitelist.');
                    reject(error);
                }
            }
        };

        attemptConnection();
    });
};

module.exports = connectDB;
