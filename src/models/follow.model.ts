import mongoose, { Schema } from "mongoose";

interface Follow {
  follower: Schema.Types.ObjectId;
  following: Schema.Types.ObjectId;
}

const followSchema = new Schema(
  {
    follower: { type: Schema.Types.ObjectId, ref: "User", required: true },
    following: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

export default mongoose.model<Follow>("Follow", followSchema);
