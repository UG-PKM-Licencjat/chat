import mongoose, { model } from "mongoose";
import { IConversation } from "./db.types.js";

const conversationSchema = new mongoose.Schema<IConversation>({});

export const Conversation = model<IConversation>(
  "Conversation",
  conversationSchema
);
