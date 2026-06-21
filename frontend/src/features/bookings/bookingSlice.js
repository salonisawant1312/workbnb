import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '../../api/client';

export const createBooking = createAsyncThunk('bookings/create', async (payload, thunkAPI) => {
  try {
    const { data } = await api.post('/bookings', payload);
    return data.data;
  } catch (err) {
    return thunkAPI.rejectWithValue(err.response?.data?.message || 'Failed to create booking');
  }
});

export const fetchBookings = createAsyncThunk('bookings/fetchMine', async (_, thunkAPI) => {
  try {
    const { data } = await api.get('/bookings');
    return data.data;
  } catch (err) {
    return thunkAPI.rejectWithValue(err.response?.data?.message || 'Failed to fetch bookings');
  }
});

export const createRazorpayOrder = createAsyncThunk('bookings/createOrder', async (bookingId, thunkAPI) => {
  try {
    const { data } = await api.post('/payments/create-order', { bookingId });
    return data; // returns orderId, paymentId, amount, currency, mock state
  } catch (err) {
    return thunkAPI.rejectWithValue(err.response?.data?.message || 'Failed to initialize payment');
  }
});

export const verifyRazorpayPayment = createAsyncThunk('bookings/verifyPayment', async (payload, thunkAPI) => {
  try {
    await api.post('/payments/verify', payload);
    const { data } = await api.get('/bookings');
    return data.data;
  } catch (err) {
    return thunkAPI.rejectWithValue(err.response?.data?.message || err.message || 'Payment verification failed');
  }
});

const bookingSlice = createSlice({
  name: 'bookings',
  initialState: {
    items: [],
    loading: false,
    error: null,
    created: null
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(createBooking.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createBooking.fulfilled, (state, action) => {
        state.loading = false;
        state.created = action.payload;
        state.items.unshift(action.payload);
      })
      .addCase(createBooking.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchBookings.fulfilled, (state, action) => {
        state.items = action.payload;
      })
      .addCase(verifyRazorpayPayment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(verifyRazorpayPayment.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(verifyRazorpayPayment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export default bookingSlice.reducer;
