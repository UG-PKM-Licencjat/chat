import mongoose, { model } from "mongoose";
import { IMessage } from "./db.types.js";

const messageSchema = new mongoose.Schema<IMessage>({
  from: { type: String, required: true },
  to: { type: String, required: true },
  fromSub: { type: String, required: true },
  toSub: { type: String, required: true },
  timestamp: { type: String, required: true },
  message: { type: String, required: true },
  // always whether user getting message got it
  read: { type: Boolean, required: false, default: false },
});

messageSchema.index({ from: 1, to: 1 }, { unique: false });

export const Message = model<IMessage>("Messages", messageSchema);
