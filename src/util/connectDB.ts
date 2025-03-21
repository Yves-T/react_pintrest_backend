import mongoose from "mongoose";

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO!);
    console.log("mongo db is connected");
  } catch (error) {
    console.log("connection error", error);
  }
};

export default connectDB;
