import { parse, validate } from "@telegram-apps/init-data-node";
import { NextApiRequest, NextApiResponse } from "next";

export const validateUser = (req: NextApiRequest, res: NextApiResponse): { user: any } | void => {
  const initData = req.headers.authorization?.split("Bearer ")[1];
  if (!initData) {
    res.status(401);
    return;
  }
  try {
    validate(initData, process.env.TELEGRAM_BOT_TOKEN!);
  } catch (error) {
    res.status(400).json({ error: "Fail" });
    return;
  }

  const result = parse(initData);

  return { user: result.user };
};
