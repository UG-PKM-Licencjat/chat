export interface IMessage {
  from: string;
  to: string;
  fromSub: string;
  toSub: string;
  timestamp: string;
  message: string;
  read?: boolean;
}
