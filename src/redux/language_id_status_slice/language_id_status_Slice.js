// src/redux/slices/languageToggleSlice.js
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  eng_lang_id: true,
  tel_lang_id: true,
};

const language_id_Status_slice = createSlice({
  name: 'languageIdStatus',
  initialState,
  reducers: {
    toggleEnglish: (state) => {
      state.eng_lang_id = true;
      state.tel_lang_id = false;
    },
    toggleTelugu: (state) => {
      state.eng_lang_id = false;
      state.tel_lang_id = true;
    },
    resetLanguages: (state) => {
      state.eng_lang_id = false;
      state.tel_lang_id = false;
    },
    // 🔥 New dynamic setter reducer
    setLanguageStatus: (state, action) => {
      const { eng_lang_id, tel_lang_id } = action.payload;
      state.eng_lang_id = eng_lang_id;
      state.tel_lang_id = tel_lang_id;
    },
  },
});

export const {
  toggleEnglish,
  toggleTelugu,
  resetLanguages,
  setLanguageStatus, // Export new action
} = language_id_Status_slice.actions;

export default language_id_Status_slice.reducer;
