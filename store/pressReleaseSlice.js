import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  pressReleases: [],
};

const pressReleaseSlice = createSlice({
  name: "press",
  initialState,
  reducers: {
    addPressReleaseData: (state, action) => {
      state.pressReleases.unshift(action.payload);
    },
    pressReleaseData: (store, action) => {
      store.pressReleases = action.payload;
    },
    removePressReleaseData: (store, action) => {
      store.pressReleases = store.pressReleases.filter(
        (item) => item._id !== action.payload
      );
    },
  },
});

export const { addPressReleaseData, pressReleaseData, removePressReleaseData } =
  pressReleaseSlice.actions;
export default pressReleaseSlice.reducer;
