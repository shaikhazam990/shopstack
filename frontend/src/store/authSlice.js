import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import apiClient from "../shared/utils/apiClient";

export const fetchMe = createAsyncThunk("auth/fetchMe", async (_, { rejectWithValue }) => {
  try {
    const { data } = await apiClient.get("/auth/me");
    return data.user;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message);
  }
});

export const login = createAsyncThunk("auth/login", async (credentials, { rejectWithValue }) => {
  try {
    const { data } = await apiClient.post("/auth/login", credentials);
    localStorage.setItem("accessToken", data.accessToken);
    return data.user;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || "Login failed");
  }
});

export const register = createAsyncThunk("auth/register", async (userData, { rejectWithValue }) => {
  try {
    const { data } = await apiClient.post("/auth/register", userData);
    localStorage.setItem("accessToken", data.accessToken);
    return data.user;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || "Registration failed");
  }
});

export const logout = createAsyncThunk("auth/logout", async () => {
  await apiClient.post("/auth/logout");
  localStorage.removeItem("accessToken");
});

const authSlice = createSlice({
  name: "auth",
  initialState: { user: null, loading: true, error: null },
  reducers: {
    clearError: (state) => { state.error = null; },
    setUser: (state, action) => { state.user = action.payload; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMe.pending, (state) => { state.loading = true; })
      .addCase(fetchMe.fulfilled, (state, action) => { state.user = action.payload; state.loading = false; })
      .addCase(fetchMe.rejected, (state) => { state.loading = false; })
      .addCase(login.fulfilled, (state, action) => { state.user = action.payload; state.error = null; })
      .addCase(login.rejected, (state, action) => { state.error = action.payload; })
      .addCase(register.fulfilled, (state, action) => { state.user = action.payload; state.error = null; })
      .addCase(register.rejected, (state, action) => { state.error = action.payload; })
      .addCase(logout.fulfilled, (state) => { state.user = null; });
  },
});

export const { clearError, setUser } = authSlice.actions;
export default authSlice.reducer;
