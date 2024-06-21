import { SocketStream } from "@fastify/websocket";
import { FastifyRequest } from "fastify";
import { GlobalUserStateHandler } from "./user-state/user-state-handler.js";

export function handleWs(connection: SocketStream, request: FastifyRequest) {
  const socket = connection.socket;
  const { id } = request.query as Record<string, string>; // TODO: Name of variable after adding auth

  if (!id) {
    console.log("Missing id, closing connection");
    socket.close(4001, "Missing id");
    return;
  }

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
