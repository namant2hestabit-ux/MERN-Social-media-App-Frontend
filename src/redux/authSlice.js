import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../api/api";
import { toast } from "react-toastify";

export const loginUser = createAsyncThunk(
  "auth/loginUser",
  async ({ email, password }, thunkAPI) => {
    try {
      const res = await api.post("/login", {
        email,
        password,
      });

      if (res.status === 200)
        toast.success(res.data?.message || "User Logged in successfully");

      return res.data;
    } catch (error) {
      toast.error(error.response?.data?.message || "Login Failed");
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Login failed"
      );
    }
  }
);

export const signUpUser = createAsyncThunk(
  "auth/signUpUser",
  async ({ firstName, lastName, email, password }, thunkAPI) => {
    try {
      const res = await api.post("/signup", {
        firstName,
        lastName,
        email,
        password,
      });

      if (res.status === 201)
        toast.success(res.data?.message || "User Created successfully");
      else toast.error("Sign Up failed");

      return res.data;
    } catch (error) {
      toast.error(error.response?.data?.message || "Sign Up failed");

      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Sign Up failed"
      );
    }
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState: {
    user: null,
    token: null,
    loading: false,
    error: null,
  },
  reducers: {
    setUser(state, action) {
      state.user = action.payload;
    },
    logout(state) {
      state.user = null;
      state.token = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      //Sign Up
      .addCase(signUpUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(signUpUser.fulfilled, (state, action) => {
        state.loading = false;
      })
      .addCase(signUpUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { setUser, logout } = authSlice.actions;
export default authSlice.reducer;
