import { SocketStream } from "@fastify/websocket";
import { WebSocket } from "ws";

export type Id = string;

export interface UserState {
  id: string;
  socket: WebSocket;
}
