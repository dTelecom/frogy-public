import type { NextApiRequest, NextApiResponse } from "next";

import prisma from "@/lib/prisma";
import { validateUser } from "@/pages/api/auth";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET" || !prisma) {
    return res.status(404).send("Not found");
  }

  const result = validateUser(req, res);

  if (!result?.user?.id) {
    return res.status(400).json({ error: "User not found" });
  }
  const data = {
    photo_url: result.user.photo_url,
  };

  const currentUser = await prisma.user.upsert({
    where: { id: result.user.id },
    update: data,
    create: {
      id: result.user.id,
      name: (result.user.first_name + " " + result.user.last_name).trim(),
      ...data
    }
  }).catch((e) => {
    console.error(e.stack);
    return res.status(500).json({ error: "Internal server error" });
  });

  return res.status(200).json({
    ...currentUser,
    id: Number(currentUser?.id.toString())
  });
}
