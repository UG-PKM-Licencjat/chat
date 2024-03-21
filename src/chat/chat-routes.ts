import { FastifyInstance, RawServerBase, RouteOptions } from "fastify";
import { sendMessageHandler } from "./rest-handler.js";

export default function chatRoutes(
  fastify: FastifyInstance,
  opts: RouteOptions<RawServerBase>,
  done: (err?: Error) => void
) {
  fastify.get("/", sendMessageHandler);
  done();
}
