import { createSlice } from "@reduxjs/toolkit";
import { encryptedStorage } from "../utils/encryptedStorage";

const initialState = {
  properties: [],
  selectedProperty: {
    name: encryptedStorage.getItem("selectedPropertyName") || "",
    id: encryptedStorage.getItem("selectedPropertyId") || null,
    kitchenId: encryptedStorage.getItem("selectedKitchenId") || null,
  },
  loading: false,
  error: null,
};

const propertiesSlice = createSlice({
  name: "properties",
  initialState,
  reducers: {
    setProperties: (state, action) => {
      state.properties = [
        { name: "All Properties", _id: null },
        ...action.payload,
      ];
    },
    addProperty: (state, action) => {
      if (!state.properties.some((p) => p.name === action.payload.name)) {
        state.properties = [
          { name: "All Properties", _id: null },
          ...state.properties.filter((p) => p.name !== "All Properties"),
          action.payload,
        ];
      }
    },
    selectProperty: (state, action) => {
      state.selectedProperty = {
        name: action.payload.name,
        id: action.payload.id,
        kitchenId: action.payload.kitchenId,
      };
      encryptedStorage.setItem("selectedPropertyName", action.payload.name);
      encryptedStorage.setItem("selectedPropertyId", action.payload.id);
      encryptedStorage.setItem("selectedKitchenId", action.payload.kitchenId);
    },
    resetPropertySelection: (state) => {
      state.selectedProperty = {
        name: "",
        id: null,
        kitchenId: null,
      };
      encryptedStorage.setItem("selectedPropertyName", "");
      encryptedStorage.setItem("selectedPropertyId", null);
      encryptedStorage.setItem("selectedKitchenId", null);
    },
  },
});

export const {
  setProperties,
  addProperty,
  selectProperty,
  resetPropertySelection,
} = propertiesSlice.actions;

export default propertiesSlice.reducer;
