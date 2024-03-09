import fastify from "fastify";
import dotenv from "dotenv";

dotenv.config();

const server = fastify();

server.get("/ping", async (request, reply) => {
  return process.env.TEST;
});

server.listen({ port: 8080 }, (err, address) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }
  console.log(`Server listening at ${address}`);
});
