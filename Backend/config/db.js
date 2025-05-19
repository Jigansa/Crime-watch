// backend/config/db.js
import mongoose from 'mongoose';
import 'dotenv/config';

const connectDB = async () => {
    try {
        // Log the connection URI (without password for security)
        const uri = process.env.MONGODB_URI;
        console.log('Attempting to connect to MongoDB...');
        console.log('Connection URI:', uri ? uri.replace(/:[^:@]+@/, ':****@') : 'Not found in environment variables');

        if (!uri) {
            throw new Error('MONGODB_URI is not defined in environment variables');
        }

        const conn = await mongoose.connect(uri);
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error('MongoDB connection error:', error);
        process.exit(1);
    }
};

export default connectDB;