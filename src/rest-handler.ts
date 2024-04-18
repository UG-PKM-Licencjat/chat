import { FastifyReply, FastifyRequest } from "fastify";
import { Message } from "./db/message.js";

type MessagesGetRequest = FastifyRequest<{
  Querystring: { from: string; to: string };
}>;

type MessageGetRequest = FastifyRequest<{
  Querystring: { search: string; from: string; to: string };
}>;

// TODO: add pagination and auth
export async function getMessages(
  request: MessagesGetRequest,
  reply: FastifyReply
) {
  const { from, to } = request.query;
  if (!from || !to) {
    reply.code(400).send({ error: "Bad request" });
    return;
  }
  const messages = await Message.find({
    $or: [
      { from, to },
      { from: to, to: from },
    ],
  }).sort({ timestamp: 1 });
  reply.send({ messages });
}

// This is probably wrong
// Also is this needed?

export async function getMessage(
  request: MessageGetRequest,
  reply: FastifyReply
) {
  const { search, from, to } = request.query;
  if (!search || !from || !to) {
    reply.code(400).send({ error: "Bad request" });
    return;
  }
  const messages = await Message.find({
    message: { $regex: search, $options: "i" },
    from,
    to,
  });
  console.log(messages);
  const stripped = messages.map((message) => ({
    message: message.message,
    from: message.from,
    to: message.to,
    timestamp: message.timestamp,
    id: message._id,
  }));

  reply.send({ messages: stripped });
}

// TODO: add auth
export async function postMessage(
  request: FastifyRequest<{
    Body: { message: string; from: string; to: string };
  }>,
  reply: FastifyReply
) {
  const message = request.body.message;
  const from = request.body.from;
  const to = request.body.to;
  const timestamp = new Date().toISOString();
  const newMessage = new Message({ message, from, to, timestamp });
  await newMessage.save();
  reply.send({ message: newMessage });
}
