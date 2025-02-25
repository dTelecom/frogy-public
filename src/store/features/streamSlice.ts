import { createSlice } from "@reduxjs/toolkit";
import { StreamListItem } from "@/api/stream";

export type StreamStore = {
  items: StreamListItem[];
};

const initialState: StreamStore = {
  items: [],
};

export const energySlice = createSlice({
  name: "stream",
  initialState,
  reducers: {
    updateStreams: (state, action) => {
      return { ...state, items: action.payload };
    },
  },
});

export const { updateStreams } = energySlice.actions;

export default energySlice.reducer;
