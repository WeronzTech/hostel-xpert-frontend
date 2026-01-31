import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import propertiesReducer from './propertiesSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    properties: propertiesReducer
  },
});