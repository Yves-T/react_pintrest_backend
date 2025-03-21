import mongoose, { Schema } from "mongoose";

interface Save {
  pin: Schema.Types.ObjectId;
  user: Schema.Types.ObjectId;
}

const saveSchema = new Schema(
  {
    pin: { type: Schema.Types.ObjectId, ref: "Pin", required: true },
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

export default mongoose.model<Save>("Save", saveSchema);
