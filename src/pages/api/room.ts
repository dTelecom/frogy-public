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

  const response = validateUser(req, res);

  if (!response) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  if (req.method === "DELETE") {
    await prisma.room.update({
      where: {
        id: response.user.id
      },
      data: {
        img: response.user.photo_url,
        withHost: false
      },
    });

    return res.status(200).send("OK");
  }

  if (req.method === "POST") {
    const data = await prisma.room.findUnique({
      where: {
        id: req.body.id
      }
    });

    return res.status(200).json(data);
  }

  return res.status(404);
}
