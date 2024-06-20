import { FastifyReply, FastifyRequest } from "fastify";
import { Message } from "./db/message.js";
import { GlobalUserStateHandler } from "./user-state/user-state-handler.js";
import { IMessage } from "./db/db.types.js";

type MessagesGetRequest = FastifyRequest<{
  Querystring: { userA: string; userB: string };
}>;

type MessageGetRequest = FastifyRequest<{
  Querystring: { search: string; from: string; to: string };
}>;

// TODO: add pagination and auth
export async function getMessages(
  request: MessagesGetRequest,
  reply: FastifyReply
) {
  const { userA, userB } = request.query;
  if (!userA || !userB) {
    reply.code(400).send({ error: "Bad request" });
    return;
  }
  const messages = await Message.find({
    $or: [
      { from: userA, to: userB },
      { from: userB, to: userA },
    ],
  }).sort({ timestamp: 1 });
  reply.send({ messages });
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
  const messageBody: IMessage = { message, from, to, timestamp };
  const newMessage = new Message(messageBody);
  await newMessage.save();
  GlobalUserStateHandler.updateUserWithNewMessage(to, newMessage);
  reply.send({ message: newMessage });
}
