// redux/slices/selectedSortSlice.js

import { createSlice } from '@reduxjs/toolkit';

export const selectedSortSlice = createSlice({
  name: 'selectedSort',
  initialState: {
    selectedSortOrder: 1, // Default: 1 (ascending or latest)
  },
  reducers: {
    setSelectedSortOrder: (state, action) => {
      state.selectedSortOrder = action.payload;
    },
  },
});

export const { setSelectedSortOrder } = selectedSortSlice.actions;
export default selectedSortSlice.reducer;
