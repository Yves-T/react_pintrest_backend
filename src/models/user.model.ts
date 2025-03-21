import mongoose, { Schema } from "mongoose";

interface User {
  displayName: string;
  username: string;
  email: string;
  img?: string;
  hashedPassword: string;
}

const userSchema = new Schema(
  {
    displayName: { type: String, required: true },
    username: { type: String, required: true },
    email: { type: String, required: true },
    img: { type: String },
    hashedPassword: { type: String, required: true },
  },
  { timestamps: true }
);

export default mongoose.model<User>("User", userSchema);
