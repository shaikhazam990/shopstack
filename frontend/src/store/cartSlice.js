import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import apiClient from "../shared/utils/apiClient";

export const fetchCart = createAsyncThunk("cart/fetch", async (_, { rejectWithValue }) => {
  try {
    const { data } = await apiClient.get("/cart");
    return data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message);
  }
});

export const addToCart = createAsyncThunk("cart/add", async (payload, { rejectWithValue }) => {
  try {
    const { data } = await apiClient.post("/cart", payload);
    return data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message);
  }
});

export const updateCartItem = createAsyncThunk("cart/update", async ({ itemId, quantity }, { rejectWithValue }) => {
  try {
    const { data } = await apiClient.put(`/cart/${itemId}`, { quantity });
    return data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message);
  }
});

export const removeCartItem = createAsyncThunk("cart/remove", async (itemId, { rejectWithValue }) => {
  try {
    const { data } = await apiClient.delete(`/cart/${itemId}`);
    return data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message);
  }
});

export const applyCoupon = createAsyncThunk("cart/coupon", async (code, { rejectWithValue }) => {
  try {
    const { data } = await apiClient.post("/cart/coupon", { code });
    return data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message);
  }
});

const cartSlice = createSlice({
  name: "cart",
  initialState: {
    items: [],
    pricing: { subtotal: 0, shipping: 0, tax: 0, discount: 0, total: 0, freeShippingRemaining: 500 },
    upsells: [],
    isOpen: false,
    loading: false,
    error: null,
  },
  reducers: {
    toggleCart: (state) => { state.isOpen = !state.isOpen; },
    openCart: (state) => { state.isOpen = true; },
    closeCart: (state) => { state.isOpen = false; },
  },
  extraReducers: (builder) => {
    const setCart = (state, action) => {
      state.items = action.payload.items || [];
      state.pricing = action.payload.pricing || state.pricing;
      state.upsells = action.payload.upsells || [];
      state.loading = false;
    };
    builder
      .addCase(fetchCart.pending, (state) => { state.loading = true; })
      .addCase(fetchCart.fulfilled, setCart)
      .addCase(fetchCart.rejected, (state) => { state.loading = false; })
      .addCase(addToCart.fulfilled, setCart)
      .addCase(updateCartItem.fulfilled, setCart)
      .addCase(removeCartItem.fulfilled, setCart)
      .addCase(applyCoupon.fulfilled, setCart)
      .addCase(applyCoupon.rejected, (state, action) => { state.error = action.payload; });
  },
});

export const { toggleCart, openCart, closeCart } = cartSlice.actions;

export const selectItemCount = (state) =>
  state.cart.items.reduce((sum, i) => sum + i.quantity, 0);

export default cartSlice.reducer;
