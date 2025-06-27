import mongoose from "mongoose";

const connectDB = async (URI) => {
    try {
        await mongoose.connect(URI);
        console.log(`Database connecction successful: ${mongoose.connection.host}`);
    } catch (error) {
        console.log("Database connection failed: ", error);
        throw error;
    }
}

export default connectDB;