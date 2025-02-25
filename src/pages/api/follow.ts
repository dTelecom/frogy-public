import type { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/lib/prisma";
import { validateUser } from "@/pages/api/auth";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (!prisma) {
    return res.status(404).send("Not found");
  }

  const result = validateUser(req, res);

  if (!result?.user) {
    return res.status(400).json({ error: "User not found" });
  }

  if (!req.body.target) {
    return res.status(400).json({ error: "Target not found" });
  }

  if (req.body.follow) {
    await prisma.follower.create({
      data: {
        followerId: (result.user.id),
        followingId: (req.body.target),
      }
    });
  } else {
    await prisma.follower.delete({
      where: {
        followerId_followingId: {
          followerId: (result.user.id),
          followingId: (req.body.target),
        }
      }
    });
  }


  res.status(200).json("ok");
}
