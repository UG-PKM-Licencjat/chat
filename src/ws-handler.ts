import { SocketStream } from "@fastify/websocket";
import { FastifyRequest } from "fastify";
import { GlobalUserStateHandler } from "./user-state/user-state-handler.js";

export function handleWs(
  connection: SocketStream,
  request: FastifyRequest<{ Headers: Record<string, string> }>
) {
  const socket = connection.socket;
  const { id } = request.headers; // TODO: Name of variable after adding auth

  console.log("User connected");

  GlobalUserStateHandler.addUser({
    id: id,
    socket: socket,
  });

  socket.on("close", () => {
    GlobalUserStateHandler.removeUser(id);
    console.log("User disconnected");
  });
}
