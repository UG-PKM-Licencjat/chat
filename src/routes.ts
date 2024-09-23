import { FastifyInstance } from "fastify";
import { handleWs } from "./ws-handler.js";
import {
  postMessage,
  getMessages,
  getSampleMessages,
  readConversation,
} from "./rest-handler.js";

async function routes(fastify: FastifyInstance) {
  fastify.get("/connect", { websocket: true }, handleWs);
  fastify.get("/messages", getMessages); //
  fastify.get("/messages/sample", getSampleMessages); // if last message is not read then all messages are not read
  fastify.post("/messages", postMessage);
  fastify.post("/message/readConversation", readConversation);
}

export default routes;
