// import { Types } from "mongoose";

export interface IMessage {
  // _id: Types.ObjectId;
  from: string;
  to: string;
  timestamp: Date;
  message: string;
}
