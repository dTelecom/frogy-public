import prisma from "@/lib/prisma";
import { validateUser } from "@/pages/api/auth";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST" || !prisma) {
    return res.status(404).send("Not found");
  }

  const result = validateUser(req, res);

  if (!result?.user) {
    return res.status(400).json({ error: "User not found" });
  }

  await prisma.user.update({
    where: {
      id: result.user.id,
    },
    data: {
      photo_url: result.user.photo_url,
      name: req.body.name,
    },
  }).catch((e) => {
    console.error(e.stack);
    return res.status(500).json({ error: "Internal server error" });
  })

  return res.status(200).json({
    ...result.user,
    id: Number(result.user.id.toString()),
  });
}
