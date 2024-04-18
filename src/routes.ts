import { FastifyInstance } from "fastify";
import { handleWs } from "./ws-handler.js";
import { getMessage, postMessage, getMessages } from "./rest-handler.js";

async function routes(fastify: FastifyInstance) {
  fastify.get("/connect", { websocket: true }, handleWs);
  fastify.get("/message", getMessage);
  fastify.get("/messages", getMessages);
  fastify.post("/messages", postMessage);
}

export default routes;
