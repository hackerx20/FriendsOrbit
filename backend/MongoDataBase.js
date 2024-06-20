import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

const uri = process.env.MONGO_URI;

if (!uri) {
    console.error("MONGO_URI environment variable is not set");
    process.exit(1); 
}
const connectMongoDB = async () => {
    try{
        const tie = await mongoose.connect(uri);
        console.log(`MongoDB connected:${tie.connection.host}`);

    }
    catch(error){
        console.error(` Error connection to mongoDB: ${error.message}`);
        process.exit(1);
    }
};
export default connectMongoDB;
