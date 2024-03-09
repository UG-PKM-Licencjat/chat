import fastify from "fastify";
import dotenv from "dotenv";
import mongoose from "mongoose";
import routes from "./routes.js";

dotenv.config();

const server = fastify();

await mongoose.connect(process.env.CONNECTION_STRING!);

server.register(routes);

server.listen({ port: 8080 }, (err, address) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }
  console.log(`Server listening at ${address}`);
});
