import axios from "axios";
import { commonHeaders } from "./util";

type CreateStreamResponse = {
  url: string;
  token: string;
};

const createStream = async (title: string) => {
  const response = await axios<CreateStreamResponse>({
    method: "post",
    url: `/api/room/host`,
    data: { title },
    headers: { ...commonHeaders() },
  });

  return response.data;
};

type JoinStreamResponse = {
  token: string;
  url: string;
};

const joinStream = async (id: number) => {
  const response = await axios<JoinStreamResponse>({
    method: "post",
    url: `/api/room/viewer`,
    data: { id },
    headers: { ...commonHeaders() },
  });

  return response.data;
};

export type StreamListItem = {
  title: string;
  withHost: boolean;
  online: number;
  id: number;
  coverUpdatedAt: number;
  url?: string;
  img?: string;
};

const getStreamsList = async (): Promise<StreamListItem[]> => {
  const response = await axios<StreamListItem[]>({
    method: "get",
    url: `/api/rooms?_${new Date().getTime()}`,
    headers: { ...commonHeaders() },
  });

  return response.data || [];
};

const getMyRoom = async () => {
  const response = await axios<StreamListItem>({
    method: "get",
    url: `/api/room?_${new Date().getTime()}`,
    headers: { ...commonHeaders() },
  });

  return response.data;
};

export const roomDelete = async () => {
  const response = await axios({
    method: "delete",
    url: `/api/room`,
    headers: { ...commonHeaders() },
  });

  return response.data;
};

export {
  createStream,
  joinStream,
  getStreamsList,
  getMyRoom,
};
