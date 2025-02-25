import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import {  followApi } from "@/api";
import { Following } from "@/api/follow";

const initialState = {
  clan: {} as Following,
  followers: {} as Following,
};

export const getFollowersForCurrentUser = createAsyncThunk(
  "followers/get",
  async () => {
    return await followApi.getFollowers();
  }
);

export const followingSlice = createSlice({
  name: "following",
  initialState,
  reducers: {},
  extraReducers(builder) {
    builder.addCase(getFollowersForCurrentUser.fulfilled, (state, action) => {
      return { ...state, followers: { ...action.payload } };
    });
  },
});

export default followingSlice.reducer;
