import { FastifyInstance } from "fastify";
import { handleWs } from "./ws-handler.js";
import { postMessage, getMessages, getSampleMessages } from "./rest-handler.js";

async function routes(fastify: FastifyInstance) {
  fastify.get("/connect", { websocket: true }, handleWs);
  fastify.get("/messages", getMessages);
  fastify.get("/messages/sample", getSampleMessages);
  fastify.post("/messages", postMessage);
}

export default routes;
