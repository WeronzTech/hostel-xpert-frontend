import {configureStore} from "@reduxjs/toolkit";
import authReducer from "./authSlice";
import propertiesReducer from "./propertiesSlice";
import kitchensReducer from "./kitchensSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    properties: propertiesReducer,
    kitchens: kitchensReducer,
  },
});
