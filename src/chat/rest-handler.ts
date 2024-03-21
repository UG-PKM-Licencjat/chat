import { FastifyReply, FastifyRequest } from "fastify";

export function sendMessageHandler(
  request: FastifyRequest,
  reply: FastifyReply
) {
  reply.send({ hello: "world" });
}
