import mongoose from "mongoose";

export const connectDB = async () => {
  try {
    const connectionInstance = await mongoose.connect(
      `${process.env.MONGODB_URI}}`
    );
    console.log(
      `Connected to database: ${connectionInstance.connection.host} `
    );
  } catch (error) {
    console.log("MONGODB connection error: " + error);
    process.exit(1);
  }
};

export default connectDB;
