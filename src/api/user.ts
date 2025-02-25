import axios from "axios";
import { commonHeaders } from "./util";

export type UserResponse = {
  id: number;
  name: string;
  language: "en";
  fans: 0;
  following: 0;
  starsTotal: number;
  starsBalance: number;
  gleamsTotal: number;
  gleamsBalance: number;
  avatarUpdatedAt: number;
  photo_url: string;
  wallet: string;
};

export const getCurrentUser = async (): Promise<UserResponse> => {
  const response = await axios<UserResponse>({
    method: "get",
    url: `/api/user/current?_${new Date().getTime()}`,
    headers: { ...commonHeaders() },
  });

  return response.data;
};

export const getUserById = async (userId: number) => {
  const response = await axios<UserResponse[]>({
    method: "post",
    url: `/api/users`,
    headers: { ...commonHeaders() },
    data: [userId],
  });

  return response.data[userId];
};

export const saveUserLanguage = async (language: string): Promise<void> => {
  await axios({
    method: "post",
    url: `/api/user`,
    headers: { ...commonHeaders() },
    data: { language },
  });
};

export const checkDailyReward = async () => {
  const { data } = await axios<UserResponse>({
    method: "get",
    url: `/api/day?_${new Date().getTime()}`,
    headers: { ...commonHeaders() },
  });
  return data;
};

export const claimDailyReward = async () => {
  const { data } = await axios<UserResponse>({
    method: "post",
    url: `/api/day`,
    headers: { ...commonHeaders() },
  });
  return data;
};

export const sendGift = async (userId: number, type: string, count: number) => {
  return axios<UserResponse>({
    method: "post",
    url: `/api/gift`,
    headers: { ...commonHeaders() },
    data: { to: userId, type, count },
  });
};

export const purchase = async (amount: number) => {
  return axios<{ url: string }>({
    method: "post",
    url: `/api/purchase`,
    headers: { ...commonHeaders() },
    data: { amount },
  });
};

export const setWallet = async (wallet: string) => {
  return axios({
    method: "post",
    url: `/api/user/wallet`,
    headers: { ...commonHeaders() },
    data: { wallet },
  });
};

export const changeUserName = async (name: string) => {
  const { data } = await axios<UserResponse>({
    method: "post",
    url: `/api/user/name`,
    headers: { ...commonHeaders() },
    data: {
      name,
    },
  });
  return data;
};
