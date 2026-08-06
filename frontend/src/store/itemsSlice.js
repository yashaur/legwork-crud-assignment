import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

export const fetchItems = createAsyncThunk(
  "items/fetchItems",
  async (api, { rejectWithValue }) => {
    try {
      return await api.get("/api/items/");
    } catch (err) {
      return rejectWithValue({
        status: err.status ?? null,
        body: err.body ?? null,
      });
    }
  },
);

const itemsSlice = createSlice({
  name: "items",
  initialState: { items: [], status: "idle", error: null },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchItems.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchItems.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.items = action.payload;
      })
      .addCase(fetchItems.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      });
  },
});

export default itemsSlice.reducer;
