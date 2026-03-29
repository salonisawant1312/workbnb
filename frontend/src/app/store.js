import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice';
import listingReducer from '../features/listings/listingSlice';
import bookingReducer from '../features/bookings/bookingSlice';
import reviewReducer from '../features/reviews/reviewSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    listings: listingReducer,
    bookings: bookingReducer,
    reviews: reviewReducer
  }
});
