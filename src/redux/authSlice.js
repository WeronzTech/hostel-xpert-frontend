import { createSlice } from "@reduxjs/toolkit";
import { encryptedStorage } from "../utils/encryptedStorage";

const isTokenExpired = (token) => {
  if (!token) return true;
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.exp * 1000 < Date.now();
  } catch {
    return true;
  }
};

const setLoginDataInEncryptedStorage = (token, user = null) => {
  if (token) {
    encryptedStorage.setItem("token", token);
    const payload = JSON.parse(atob(token.split(".")[1]));
    encryptedStorage.setItem("token_exp", payload.exp);
    if (user) {
      encryptedStorage.setItem("user", user);
    }
  } else {
    encryptedStorage.removeItem("token");
    encryptedStorage.removeItem("token_exp");
    encryptedStorage.removeItem("user");
  }
};

const initialState = {
  user: null,
  token: null,
  loading: false,
  error: null,
  isAuthenticated: false,
  initialized: false,
  showExpirationModal: false,
  expirationReason: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    loginStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    loginSuccess: (state, action) => {
      state.user = action.payload.client;
      state.token = action.payload.token;
      state.isAuthenticated = true;
      state.loading = false;
      state.error = null;
      state.showExpirationModal = false;
      state.expirationReason = null;
      setLoginDataInEncryptedStorage(
        action.payload.token,
        action.payload.client
      );
    },
    loginFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
      setLoginDataInEncryptedStorage(null);
    },
    logout: (state, action) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.showExpirationModal = action?.payload?.showModal || false;
      state.expirationReason = action?.payload?.reason || null;
      setLoginDataInEncryptedStorage(null);
    },
    initializeAuth: (state) => {
      const token = encryptedStorage.getItem("token");
      const user = encryptedStorage.getItem("user");
      if (token && !isTokenExpired(token)) {
        state.token = token;
        state.user = user || null;
        state.isAuthenticated = true;
      } else if (token) {
        state.showExpirationModal = true;
        state.expirationReason = "timeout";
        state.isAuthenticated = false;
        setLoginDataInEncryptedStorage(null);
      }
      state.initialized = true;
    },
    showExpirationModal: (state) => {
      state.showExpirationModal = true;
      state.expirationReason = "timeout";
      state.isAuthenticated = false;
      setLoginDataInEncryptedStorage(null);
    },
    hideExpirationModal: (state) => {
      state.showExpirationModal = false;
      state.expirationReason = null;
    },
  },
});

export const checkTokenExpiration = () => (dispatch, getState) => {
  const { token, isAuthenticated } = getState().auth;
  if (isAuthenticated && isTokenExpired(token)) {
    dispatch(authSlice.actions.showExpirationModal());
  }
};

export const {
  loginStart,
  loginSuccess,
  loginFailure,
  logout,
  initializeAuth,
  hideExpirationModal,
} = authSlice.actions;

export default authSlice.reducer;
