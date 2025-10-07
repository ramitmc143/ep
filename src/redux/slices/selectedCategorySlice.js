import { createSlice } from '@reduxjs/toolkit';

export const selectedCategorySlice = createSlice({
  name: 'selectedCategory',
  initialState: {
    selectedCategoryId: null,
  },
  reducers: {
    setSelectedCategoryId: (state, action) => {
      state.selectedCategoryId = action.payload;
    },
  },
});

export const { setSelectedCategoryId } = selectedCategorySlice.actions;
export default selectedCategorySlice.reducer;
