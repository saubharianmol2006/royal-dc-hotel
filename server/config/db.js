const dns = require("dns");
const mongoose = require("mongoose");

// Use reliable DNS servers for MongoDB Atlas SRV connection
dns.setServers([
    "1.1.1.1",
    "8.8.8.8"
]);

const connectDB = async () => {
    try {
        if (!process.env.MONGO_URI) {
            throw new Error("MONGO_URI is missing in .env file");
        }

        const connection = await mongoose.connect(process.env.MONGO_URI);

        console.log(
            `MongoDB connected: ${connection.connection.host}`
        );
    } catch (error) {
        console.error("MongoDB connection failed:", error.message);
        process.exit(1);
    }
};

module.exports = connectDB;