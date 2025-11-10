import {createSlice} from '@reduxjs/toolkit';

const initialState = {
  notificationsEnabled: true,
  theme: 'light',
  selectedCategories: [],
  fontSize: 'Medium',
  layout: 'Compact', // optional
};

const preferencesSlice = createSlice({
  name: 'preferences',
  initialState,
  reducers: {
    toggleNotifications: state => {
      state.notificationsEnabled = !state.notificationsEnabled;
    },
    setTheme: (state, action) => {
      state.theme = action.payload;
    },
    setSelectedCategories: (state, action) => {
      state.selectedCategories = action.payload;
    },
    setFontSize: (state, action) => {
      state.fontSize = action.payload;
    },
    setLayout: (state, action) => {
      state.layout = action.payload;
    },
    resetPreferences: state => {
      Object.assign(state, initialState);
    },
  },
});

export const {
  toggleNotifications,
  setTheme,
  setSelectedCategories,
  setFontSize,
  setLayout,
  resetPreferences,
} = preferencesSlice.actions;

export default preferencesSlice.reducer;
