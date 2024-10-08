import { FastifyReply, FastifyRequest } from "fastify";
import { Message } from "./db/message.js";
import { GlobalUserStateHandler } from "./user-state/user-state-handler.js";
import { IMessage } from "./db/db.types.js";
import { authenticate } from "./auth.js";

type MessagesGetRequest = FastifyRequest<{
  Querystring: { userA: string; userB: string; skip: number; limit: number };
}>;

type SampleMessagesRequest = FastifyRequest<{
  // Querystring: { user: string };
}>;

export async function getMessages(
  request: MessagesGetRequest,
  reply: FastifyReply
) {
  const { userA, userB, skip, limit } = request.query;
  const authorization = request.headers["authorization"];

  const userSub = await authenticate(authorization);

  if (!userSub) {
    reply.code(401).send({ error: "Unauthorized" });
    return;
  }

  if (!userA || !userB) {
    reply.code(400).send({ error: "Bad request" });
    return;
  }

  // Sprawdzenie limitu (opcjonalne: maksymalny limit)
  const MAX_LIMIT = 30;
  if (limit <= 0 || limit > MAX_LIMIT) {
    return reply.code(400).send({ error: "Invalid limit value" });
  }

  const messages = await Message.find({
    $or: [
      { from: userA, to: userB },
      { from: userB, to: userA },
    ],
  })
    .sort({ timestamp: -1 })
    .skip(skip)
    .limit(limit);

  if (
    messages.length > 0 &&
    messages[0].toSub != userSub &&
    messages[0].fromSub != userSub
  ) {
    reply.code(401).send({ error: "Unauthorized" });
    return;
  }

  reply.send(messages);
}

export async function getSampleMessages(
  request: SampleMessagesRequest,
  reply: FastifyReply
) {
  const authorization = request.headers["authorization"];

  const userSub = await authenticate(authorization);

  if (!userSub) {
    reply.code(401).send({ error: "Unauthorized" });
    return;
  }

  const messages = await Message.aggregate([
    {
      $match: {
        $or: [{ fromSub: userSub }, { toSub: userSub }],
      },
    },
    {
      $sort: { timestamp: -1 },
    },
    {
      $group: {
        _id: {
          $cond: {
            if: { $eq: ["$fromSub", userSub] },
            then: "$toSub",
            else: "$fromSub",
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
        read: "$newestMessage.read",
      },
    },
  ]);

  reply.send(messages);
}

export async function postMessage(
  request: FastifyRequest<{
    Body: {
      message: string;
      from: string;
      to: string;
      fromSub: string;
      toSub: string;
    };
  }>,
  reply: FastifyReply
) {
  const authorization = request.headers["authorization"];

  const userSub = await authenticate(authorization);

  if (!userSub) {
    reply.code(401).send({ error: "Unauthorized" });
    return;
  }

  const { message, from, to, fromSub, toSub } = request.body;

  if (userSub !== fromSub && userSub !== toSub) {
    reply.code(401).send({ error: "Unauthorized" });
    return;
  }

  const timestamp = new Date().toISOString();
  const messageBody: IMessage = {
    message,
    from,
    to,
    timestamp,
    fromSub,
    toSub,
    read: false,
  };
  const newMessage = new Message(messageBody);
  await newMessage.save();
  GlobalUserStateHandler.updateUserWithNewMessage(to, newMessage);
  reply.send(newMessage);
}

export async function readConversation(
  request: FastifyRequest<{
    Body: { userFrom: string; userTo: string };
  }>,
  reply: FastifyReply
) {
  const authorization = request.headers["authorization"];

  const userSub = await authenticate(authorization);

  if (!userSub) {
    reply.code(401).send({ error: "Unauthorized" });
    return;
  }

  const { userFrom, userTo } = request.body;

  const message = await Message.findOne({ to: userTo });

  if (message && message.toSub !== userSub) {
    reply.code(401).send({ error: "Unauthorized" });
    return;
  }

  // not checking if happend to speed up the process -- debug check -- it was needed
  await Message.updateMany(
    { from: userFrom, to: userTo, read: false },
    { $set: { read: true } }
  );

  reply.send("Messages read");
}
