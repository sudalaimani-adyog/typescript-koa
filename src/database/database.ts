import mongoose from "mongoose";

export const asyncConnect = async () => {
    try {
        await mongoose.connect("mongodb://localhost:27017/students");
    } catch (error) {
        console.error("❌ MongoDB connection failed:", error);
        process.exit(1);
    }
}