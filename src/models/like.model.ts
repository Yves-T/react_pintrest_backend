import mongoose, { Schema } from "mongoose";

interface Like {
  pin: Schema.Types.ObjectId;
  user: Schema.Types.ObjectId;
}

const likeSchema = new Schema(
  {
    pin: { type: Schema.Types.ObjectId, ref: "Pin", required: true },
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

export default mongoose.model<Like>("Like", likeSchema);
