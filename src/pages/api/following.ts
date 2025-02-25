import type { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/lib/prisma";
import { validateUser } from "@/pages/api/auth";
import { Following } from "@/api/follow";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET" || !prisma) {
    return res.status(404);
  }

  const result = validateUser(req, res);
  if (!result?.user) {
    return res.status(400).json({ error: "User not found" });
  }
  const data = await prisma.follower.findMany({
    where: {
      followerId: result.user.id,
    },
  })

  const following: Following = {}
  data.forEach((item) => {
    following[item.followingId.toString()] = true;
  });
  return res.status(200).json(following);
}
