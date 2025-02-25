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

  const room = await prisma.room.findFirst({
    where: {
      id: req.body.id
    }
  });

  if (!room) {
    return res.status(404).json({ error: "Room not found" });
  }

  const token = new AccessToken(process.env.API_KEY, process.env.API_SECRET, {
    identity: response.user.id.toString(),
    name: room.title
  });

  token.addGrant({
    room: room.id.toString(),
    roomJoin: true,
    canPublish: false,
    canPublishData: true,
    roomAdmin: false
  });

  const clientIp = requestIp.getClientIp(req) || undefined;
  const url = await token.getWsUrl(clientIp);

  return res.status(200).json({
    token: token.toJwt(),
    url
  });
}
