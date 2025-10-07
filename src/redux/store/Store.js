import {configureStore} from '@reduxjs/toolkit';
import languageReducer from '../languageSlice/LanguageSlice';
import selectedScreenReducer from '../selectedScreenSlice/selectedScreenSlice';
import language_id_status_reducer from '../language_id_status_slice/language_id_status_Slice'
import dataOfCategoryOFNotificationReducer from '../slices/dataSlice'
import selectedCategoryReducer from '../slices/selectedCategorySlice';
import selectedSortReducer from '../slices/selectedSortSlice';



export const Store = configureStore({
  reducer: {
    language: languageReducer,
    selectedScreen: selectedScreenReducer,
    language_id_status: language_id_status_reducer,
    dataOfCategoryOFNotification : dataOfCategoryOFNotificationReducer,
    selectedCategory: selectedCategoryReducer,
    selectedSort: selectedSortReducer,
    
  },
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});
