import {createSlice} from "@reduxjs/toolkit";
import {encryptedStorage} from "../utils/encryptedStorage";

const initialState = {
  kitchens: [],
  selectedKitchen: {
    name: encryptedStorage.getItem("selectedKitchenName") || "",
    id: encryptedStorage.getItem("selectedKitchenId") || null,
  },
  loading: false,
  error: null,
};

const kitchensSlice = createSlice({
  name: "kitchens",
  initialState,
  reducers: {
    setKitchens: (state, action) => {
      state.kitchens = [{name: "All Kitchens", _id: null}, ...action.payload];
    },
    createKitchen: (state, action) => {
      if (!state.kitchens.some((p) => p.name === action.payload.name)) {
        state.kitchens = [
          {name: "All Kitchens", _id: null},
          ...state.kitchens.filter((p) => p.name !== "All Kitchens"),
          action.payload,
        ];
      }
    },
    selectKitchen: (state, action) => {
      state.selectedKitchen = {
        name: action.payload.name,
        id: action.payload.id,
      };
      encryptedStorage.setItem("selectedKitchenName", action.payload.name);
      encryptedStorage.setItem("selectedKitchenId", action.payload.id);
    },
  },
});

export const {setKitchens, createKitchen, selectKitchen} =
  kitchensSlice.actions;

export default kitchensSlice.reducer;
