import { SocketStream } from "@fastify/websocket";
import { FastifyRequest } from "fastify";
import { GlobalUserStateHandler } from "./user-state/user-state-handler.js";

export function handleWs(connection: SocketStream, request: FastifyRequest) {
  const socket = connection.socket;
  const { id, token } = request.query as Record<string, string>; // TODO: Name of variable after adding auth

  if (!id) {
    console.log("Missing id, closing connection");
    socket.close(4001, "Bad request");
    return;
  }
  if (!token) {
    console.log("Missing token, closing connection");
    socket.close(4001, "Unauthorized");
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
