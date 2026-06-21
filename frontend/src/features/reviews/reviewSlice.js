import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '../../api/client';

export const addReview = createAsyncThunk('reviews/create', async (payload, thunkAPI) => {
  try {
    const { data } = await api.post('/reviews', payload);
    return data.data;
  } catch (err) {
    return thunkAPI.rejectWithValue(err.response?.data?.message || 'Failed to create review');
  }
});

export const fetchListingReviews = createAsyncThunk('reviews/listing', async (listingId, thunkAPI) => {
  try {
    const { data } = await api.get(`/reviews/listing/${listingId}`);
    return data.data;
  } catch (err) {
    return thunkAPI.rejectWithValue(err.response?.data?.message || 'Failed to fetch reviews');
  }
});

const reviewSlice = createSlice({
  name: 'reviews',
  initialState: { items: [], loading: false, error: null },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchListingReviews.pending, (state) => { state.loading = true; })
      .addCase(fetchListingReviews.fulfilled, (state, action) => { state.loading = false; state.items = action.payload; })
      .addCase(fetchListingReviews.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
      .addCase(addReview.fulfilled, (state, action) => { state.items.unshift(action.payload); });
  }
});

export default reviewSlice.reducer;
