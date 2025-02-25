import prisma from "@/lib/prisma";
import { validateUser } from "@/pages/api/auth";
import { NextApiRequest, NextApiResponse } from "next";
import { giftsItems } from "@/components/pages/StreamPage/components/GiftsButton/GiftsButton";

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

  const user = await prisma.user.findFirst({
    where: {
      id: result.user.id
    }
  });

  if (!user) {
    return res.status(400).json({ error: "User not found" });
  }

  const { to, type, count } = req.body;
  const gift = giftsItems[type];
  if (!gift) {
    return res.status(400).json({ error: "Gift not found" });
  }
  if (user.starsBalance < gift.price * count) {
    return res.status(500).json({ error: "Not enough stars" });
  }

  await prisma.user.update({
    where: {
      id: to
    },
    data: {
      gleamsBalance: {
        increment: gift.price * count
      }
    }
  }).catch((e) => {
    console.error(e.stack);
    return res.status(500).json({ error: "Internal server error" });
  });

  await prisma.user.update({
    where: {
      id: result.user.id
    },
    data: {
      photo_url: result.user.photo_url,
      starsBalance: user.starsBalance - gift.price * count
    }
  }).catch((e) => {
    console.error(e.stack);
    return res.status(500).json({ error: "Internal server error" });
  });

  return res.status(200).json({
    ...user,
    id: Number(user.id.toString()),
    starsBalance: user.starsBalance - gift.price * count
  });
}
