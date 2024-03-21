import { FastifyInstance } from "fastify";
import chatRoutes from "./chat/chat-routes.js";

async function routes(fastify: FastifyInstance) {
  fastify.register(chatRoutes);
}

export default routes;
