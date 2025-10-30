import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";


export const connectDB = async () => {
    try {
        const mongoConnection = await mongoose.connect(`${process.env.MONGODB_URL}/${DB_NAME}`);
        console.log(`MongoDB Connected: ${mongoConnection.connection.host}`);
    } catch (error) {
        console.log(error);
        process.exit(1);
    }
}