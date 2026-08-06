import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  access: localStorage.getItem("access_token"),
  refresh: localStorage.getItem("refresh_token"),
  username: localStorage.getItem("username"),
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setTokens: (state, action) => {
      localStorage.setItem("access_token", action.payload.access);
      localStorage.setItem("refresh_token", action.payload.refresh);
      localStorage.setItem("username", action.payload.username);

      state.access = action.payload.access;
      state.refresh = action.payload.refresh;
      state.username = action.payload.username;
    },
    logout: () => {
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      localStorage.removeItem("username");
    },
  },
});

export const { setTokens, logout } = authSlice.actions;
export default authSlice.reducer;
