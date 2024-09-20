import { FastifyReply, FastifyRequest } from "fastify";
import { Message } from "./db/message.js";
import { GlobalUserStateHandler } from "./user-state/user-state-handler.js";
import { IMessage } from "./db/db.types.js";
import { verifyGoogleToken } from "./auth.js";

type MessagesGetRequest = FastifyRequest<{
  Querystring: { userA: string; userB: string };
}>;

type SampleMessagesRequest = FastifyRequest<{
  Querystring: { user: string };
}>;

// TODO: add pagination and auth
export async function getMessages(
  request: MessagesGetRequest,
  reply: FastifyReply
) {
  const { userA, userB } = request.query;
  const { Authorization } = request.headers;

  if (!Authorization || Array.isArray(Authorization)) {
    reply.code(401).send({ error: "Unauthorized" });
    return;
  }

  const userId = await verifyGoogleToken(Authorization);
  if (!userId) {
    reply.code(401).send({ error: "Invalid or expired token" });
    return;
  }

  if (!userA || !userB) {
    reply.code(400).send({ error: "Bad request" });
    return;
  }

  if (userId !== userA || userId !== userB) {
    reply.code(401).send({ error: "Unauthorized" });
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
export async function getSampleMessages(
  request: SampleMessagesRequest,
  reply: FastifyReply
) {
  const { user } = request.query;

  const messages = await Message.aggregate([
    {
      $match: {
        $or: [{ from: user }, { to: user }],
      },
    },
    {
      $sort: { timestamp: -1 },
    },
    {
      $group: {
        _id: {
          $cond: {
            if: { $eq: ["$from", user] },
            then: "$to",
            else: "$from",
          },
        },
        newestMessage: { $first: "$$ROOT" },
      },
    },
    {
      $project: {
        _id: 0,
        message: "$newestMessage.message",
        timestamp: "$newestMessage.timestamp",
        from: "$newestMessage.from",
        to: "$newestMessage.to",
      },
    },
  ]);

  reply.send(messages);
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
