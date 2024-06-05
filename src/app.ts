import fastify from "fastify";
import dotenv from "dotenv";
import mongoose from "mongoose";
import routes from "./routes.js";
import "@fastify/websocket";
import fastifyWebsocket from "@fastify/websocket";

dotenv.config();

const server = fastify();

await mongoose.connect(process.env.CONNECTION_STRING!);

server.register(fastifyWebsocket, {
  errorHandler: function (error, socket, req, reply) {
    socket.socket.terminate();
  },
  options: {
    maxPayload: 1048576,
    verifyClient: function (info, next) {
      /*if (info.req.headers["x-fastify-header"] !== "test") {
        // auth
        return next(false);
      }*/
      next(true);
    },
  },
});

server.register(routes);

server.listen({ port: 8080 }, (err, address) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }
  console.log(`Server listening at ${address}`);
});
