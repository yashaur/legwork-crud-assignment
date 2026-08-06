import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./authSlice.js";
import itemsReducer from "./itemsSlice.js";

const store = configureStore({
  reducer: {
    auth: authReducer,
    items: itemsReducer,
  },
});

export default store;
