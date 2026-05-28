const mongoose = require('mongoose');

const connectDb = async () => {
    try {
        const conn = await mongoose.connect(process.env.DATABASE);
        console.log(`Database has been connected successfully: ${conn.connection.host}`);
    } catch (error) {
        console.error(`Connection error: ${error.message}`);
        process.exit(1);
    }
};

module.exports = connectDb;