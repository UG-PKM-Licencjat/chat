import { FastifyReply, FastifyRequest } from "fastify";
import { Message } from "./db/message.js";
import { GlobalUserStateHandler } from "./user-state/user-state-handler.js";
import { IMessage } from "./db/db.types.js";
import { authenticate } from "./auth.js";

type MessagesGetRequest = FastifyRequest<{
  Querystring: { userA: string; userB: string };
}>;

type SampleMessagesRequest = FastifyRequest<{
  // Querystring: { user: string };
}>;

//TODO cut the subs from the final result
// TODO: add pagination
export async function getMessages(
  request: MessagesGetRequest,
  reply: FastifyReply
) {
  const { userA, userB } = request.query;
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

  const messages = await Message.find({
    $or: [
      { from: userA, to: userB },
      { from: userB, to: userA },
    ],
  }).sort({ timestamp: 1 });

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
  reply.send({ message, from, to, timestamp });
}
