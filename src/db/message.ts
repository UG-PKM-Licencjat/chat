import mongoose, { model } from "mongoose";
import { IMessage } from "./db.types.js";

const messageSchema = new mongoose.Schema<IMessage>({
  // _id: { type: "ObjectID", required: true },
  from: { type: String, required: true },
  to: { type: String, required: true },
  timestamp: { type: Date, required: true },
  message: { type: String, required: true },
});

messageSchema.index({ from: 1, to: 1 }, { unique: false });

export const Message = model<IMessage>("Messages", messageSchema);
