import mongoose from "mongoose"

const connectDb = async () => {
try {
    if(!process.env.MONGO_URI){
        throw new Error("MONGO_URI is not defined in environment variables");
    }
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Database connected successfully"); 
} catch (error) {
    console.error("Error connecting to the database:", error);
    throw error;
}
}


export {connectDb};