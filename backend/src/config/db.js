import mongoose from "mongoose";
import { MONGODB_URI } from "./env.js";

async function connectDB() {
  await mongoose.connect(MONGODB_URI);
  console.log("MongoDB connected");
}

export default connectDB;
