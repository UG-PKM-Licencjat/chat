import { FastifyInstance } from "fastify";
import { handleWs } from "./ws-handler.js";

async function routes(fastify: FastifyInstance) {
  fastify.get("/connect", { websocket: true }, handleWs);
}

export default routes;
