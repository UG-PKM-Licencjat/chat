import { SocketStream } from "@fastify/websocket";
import { FastifyRequest } from "fastify";
import { GlobalUserStateHandler } from "./user-state/user-state-handler.js";

export function handleWs(connection: SocketStream, request: FastifyRequest) {
  const socket = connection.socket;

  socket.on("connect", (message) => {
    socket.send("User connected");
    GlobalUserStateHandler.addUser({ id: "placeholder_id", socket: socket });
  });

  socket.on("close", () => {
    GlobalUserStateHandler.removeUser("placeholder_id");
  });
}
