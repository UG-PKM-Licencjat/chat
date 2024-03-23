import { SocketStream } from "@fastify/websocket";
import { FastifyRequest } from "fastify";

export function handleWs(connection: SocketStream, request: FastifyRequest) {
  const socket = connection.socket;
  // handling different things below

  socket.on("connect", (message) => {
    socket.send("hi from server");
  });
}
