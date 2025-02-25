import type { NextApiRequest, NextApiResponse } from "next";

import prisma from "@/lib/prisma";
import { validateUser } from "@/pages/api/auth";
import { AccessToken } from "@dtelecom/server-sdk-js";

import requestIp from "request-ip";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (!prisma) {
    return res.status(404).send("Not found");
  }

  const response = validateUser(req, res);
  if (!response) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const streamName = req.body.title;
  if (!streamName) {
    return res.status(400).json({ error: "Title is required" });
  }

  const token = new AccessToken(process.env.API_KEY, process.env.API_SECRET, {
    identity: String(response.user.id),
    name: streamName
  });

  token.addGrant({
    room: String(response.user.id),
    roomJoin: true,
    canPublish: true,
    canPublishData: true,
    roomAdmin: true
  });

  const clientIp = requestIp.getClientIp(req) || undefined;
  const url = await token.getWsUrl(clientIp);

  await prisma.room.upsert({
    where: {
      id:   BigInt(response.user.id)
    },
    update: {
      title: streamName,
      img: response.user.photo_url,
      withHost: true,
    },
    create: {
      id:  BigInt(response.user.id),
      title: streamName,
      img: response.user.photo_url,
      withHost: true,
    }
  });

  return res.status(200).json({
    token: token.toJwt(),
    url
  });
}
