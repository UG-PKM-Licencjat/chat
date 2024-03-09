import { FastifyInstance } from "fastify";

// routes from all submodules should be registered here (fastify.register, not via .get like here)
async function routes(fastify: FastifyInstance) {
  fastify.get("/", async (request, reply) => {
    return { hello: "world" };
  });
}

export default routes;
