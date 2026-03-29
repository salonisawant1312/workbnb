import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '../../api/client';

export const fetchListings = createAsyncThunk('listings/fetchAll', async (params = {}, thunkAPI) => {
  try {
    const { data } = await api.get('/listings', { params });
    return data.data;
  } catch (err) {
    return thunkAPI.rejectWithValue(err.response?.data?.message || 'Failed to fetch listings');
  }
});

export const fetchListingById = createAsyncThunk('listings/fetchById', async (id, thunkAPI) => {
  try {
    const { data } = await api.get(`/listings/${id}`);
    return data.data;
  } catch (err) {
    return thunkAPI.rejectWithValue(err.response?.data?.message || 'Failed to fetch listing');
  }
});

export const createListing = createAsyncThunk('listings/create', async (payload, thunkAPI) => {
  try {
    const formData = new FormData();
    formData.append('title', payload.title);
    formData.append('description', payload.description);
    formData.append('workspaceType', payload.workspaceType);
    formData.append('capacity', String(payload.capacity));
    formData.append('pricePerHour', String(payload.pricePerHour || 0));
    formData.append('pricePerDay', String(payload.pricePerDay || 0));
    formData.append('pricePerMonth', String(payload.pricePerMonth || 0));
    formData.append('amenities', (payload.amenities || []).join(','));
    formData.append('address', JSON.stringify(payload.address || {}));

    (payload.images || []).forEach((file) => {
      formData.append('images', file);
    });

    const { data } = await api.post('/listings', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return data.data;
  } catch (err) {
    return thunkAPI.rejectWithValue(err.response?.data?.message || 'Failed to create listing');
  }
});

const listingSlice = createSlice({
  name: 'listings',
  initialState: {
    items: [],
    selected: null,
    loading: false,
    error: null
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchListings.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchListings.fulfilled, (state, action) => { state.loading = false; state.items = action.payload; })
      .addCase(fetchListings.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
      .addCase(fetchListingById.fulfilled, (state, action) => { state.selected = action.payload; })
      .addCase(createListing.fulfilled, (state, action) => { state.items.unshift(action.payload); });
  }
});

export default listingSlice.reducer;
