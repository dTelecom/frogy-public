import axios from "axios";
import { commonHeaders } from "./util";

const setFollowing = async (target: number, follow: boolean): Promise<void> => {
  await axios({
    method: "post",
    url: `/api/follow`,
    headers: { ...commonHeaders() },
    data: { target, follow },
  });
};

export type Following = {
  [key: number | string]: boolean;
};

const getFollowers = async (): Promise<Following> => {
  const response = await axios({
    method: "get",
    url: `/api/following?_${new Date().getTime()}`,
    headers: { ...commonHeaders() },
  });

  return response.data;
};
export { setFollowing, getFollowers };
