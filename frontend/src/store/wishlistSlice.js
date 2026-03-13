import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import apiClient from "../shared/utils/apiClient";

export const fetchWishlists = createAsyncThunk("wishlist/fetch", async (_, { rejectWithValue }) => {
  try {
    const { data } = await apiClient.get("/users/wishlists");
    return data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message);
  }
});

export const createFolder = createAsyncThunk("wishlist/createFolder", async (payload, { rejectWithValue }) => {
  try {
    const { data } = await apiClient.post("/users/wishlists", payload);
    return data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message);
  }
});

export const toggleWishlistItem = createAsyncThunk("wishlist/toggle", async ({ folderId, productId }, { rejectWithValue }) => {
  try {
    const { data } = await apiClient.put(`/users/wishlists/${folderId}/toggle/${productId}`);
    return { folderId, folder: data.data };
  } catch (err) {
    return rejectWithValue(err.response?.data?.message);
  }
});

const wishlistSlice = createSlice({
  name: "wishlist",
  initialState: { folders: [], loading: false },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchWishlists.pending, (state) => { state.loading = true; })
      .addCase(fetchWishlists.fulfilled, (state, action) => { state.folders = action.payload; state.loading = false; })
      .addCase(createFolder.fulfilled, (state, action) => { state.folders = action.payload; })
      .addCase(toggleWishlistItem.fulfilled, (state, action) => {
        const idx = state.folders.findIndex((f) => f._id === action.payload.folderId);
        if (idx > -1) state.folders[idx] = action.payload.folder;
      });
  },
});

export const selectIsWishlisted = (productId) => (state) =>
  state.wishlist.folders.some((f) => f.products?.some((p) => (p._id || p) === productId));

export default wishlistSlice.reducer;
