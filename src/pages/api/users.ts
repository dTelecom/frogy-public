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

  validateUser(req, res);

  const data = await prisma.user.findMany({
    where: {
      id: {
        in: req.body
      }
    },
    include: {
      followers: true,
      following: true,
    }
  });

  const users = data.reduce((acc: Record<string, any>, u) => {
    const { followers, following ,...user } = u;
    acc[user.id.toString()] = {
      ...user,
      id: Number(user.id.toString()),
      fans: followers.length,
      following: following.length,
    };
    return acc;
  }, {});

  return res.status(200).json(users);
}
