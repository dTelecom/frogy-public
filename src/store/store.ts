import { configureStore } from "@reduxjs/toolkit";
import userReducer from "./features/userSlice";
import streamReducer from "./features/streamSlice";
import followingReducer from "./features/followingSlice";

export const makeStore = () => {
  return configureStore({
    reducer: {
      user: userReducer,
      streams: streamReducer,
      followers: followingReducer,
    },
  });
}

export const store = makeStore();

// Get the type of our store variable
export type AppStore = typeof store;
// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<AppStore["getState"]>;
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = AppStore["dispatch"];
