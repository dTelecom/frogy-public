import type { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/lib/prisma";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (!prisma) {
    return res.status(404).send("Not found");
  }
  const rooms = await prisma.room.findMany();
  return res.status(200).json(rooms.map(room => ({
    ...room,
    id: Number(room.id.toString())
  })));
}
