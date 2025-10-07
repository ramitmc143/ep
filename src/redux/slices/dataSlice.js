import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// Async thunk to fetch data
export const fetchDataOfCategory = createAsyncThunk(
  'data/fetchData',
  async ({ apiLink, langId, responseKey ,device_id }, { rejectWithValue }) => {
    if (!apiLink) return rejectWithValue('API link not provided');

    try {
      const response = await axios.post(apiLink, {
        device_id: device_id,
        lang_id: langId,
      });
      
      // Extracting Filtericons and Sorticons from the response
      const filterIcons = response.data?.Filtericons || [];
      const sortIcons = response.data?.Sorticons || [];

      return {
        data: response.data?.[responseKey] || [],
        Categories: response.data?.Categories || [],
        filterIcons,
        sortIcons
      };

    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const dataSlice = createSlice({
  name: 'data',
  initialState: {
    dataAll: [], // The existing data (if any)
    Categories: [], // State for Categories
    loading: false,
    error: null,
    filterIcons: [], // State for Filtericons
    sortIcons: [],   // State for Sorticons
  },
  reducers: {
    clearData: (state) => {
      state.dataAll = []; // Clear dataAll state
      state.Categories = []; // Clear Categories state
      state.error = null;
      state.filterIcons = []; // Clear Filtericons state
      state.sortIcons = [];   // Clear Sorticons state
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDataOfCategory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDataOfCategory.fulfilled, (state, action) => {
        state.loading = false;
        state.dataAll = action.payload.data; // Store main data
        state.Categories = action.payload.Categories; // Store Categories here
        state.filterIcons = action.payload.filterIcons; // Store Filtericons
        state.sortIcons = action.payload.sortIcons; // Store Sorticons
      })
      .addCase(fetchDataOfCategory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Something went wrong';
      });
  },
});

export const { clearData } = dataSlice.actions;

// Selector to access Categories from Redux state
export const selectCategories = (state) => state.data.Categories;

export default dataSlice.reducer;
