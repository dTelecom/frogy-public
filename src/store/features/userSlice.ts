import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { userApi } from "../../api";
import { UserResponse } from "@/api/user";

const initialState: UserResponse = {
  id: 0,
  name: "",
  fans: 0,
  following: 0,
  language: "en",
  starsBalance: 0,
  photo_url: "",
  avatarUpdatedAt: 0,
  starsTotal: 0,
  gleamsTotal: 0,
  gleamsBalance: 0,
  wallet: ""
};

export const getUser = createAsyncThunk("user/get", async () => {
  return await userApi.getCurrentUser();
});

export const onCheckDailyReward = createAsyncThunk(
  "user/checkDailyReward",
  async () => {
    return await userApi.checkDailyReward();
  }
);

export const onClaimDailyReward = createAsyncThunk(
  "user/claimDailyReward",
  async () => {
    return await userApi.claimDailyReward();
  }
);

export const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    update: (state, action) => {
      return { ...state, ...action.payload };
    }
  },
  extraReducers(builder) {
    builder
      .addCase(getUser.pending, () => {

      })
      .addCase(getUser.fulfilled, (state, action) => {
        return { ...state, ...action.payload };
      })
      .addCase(getUser.rejected, (state, action) => {
        console.error("rejected", action.error.message);
      });
    builder.addCase(onCheckDailyReward.fulfilled, (state, action) => {
      return { ...state, ...action.payload };
    });
    builder.addCase(onClaimDailyReward.fulfilled, (state, action) => {
      return { ...state, ...action.payload };
    });
  }
});

export const { update } = userSlice.actions;

export default userSlice.reducer;
