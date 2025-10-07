// src/redux/selectedScreenSlice.js
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  selectedScreen: '', // default screen
};

const selectedScreenSlice = createSlice({
  name: 'selectedScreen',
  initialState,
  reducers: {
    setSelectedScreen: (state, action) => {
      state.selectedScreen = action.payload;
    },
  },
});

export const { setSelectedScreen } = selectedScreenSlice.actions;
export default selectedScreenSlice.reducer;
