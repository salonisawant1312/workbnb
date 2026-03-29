import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchBookings, payForBooking } from '../features/bookings/bookingSlice';

const bookingImage = 'https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=900&q=80';

export default function BookingHistoryPage() {
  const dispatch = useDispatch();
  const { items, loading, error } = useSelector((s) => s.bookings);
  const [message, setMessage] = useState('');

  useEffect(() => {
    dispatch(fetchBookings());
  }, [dispatch]);

  const handlePayNow = async (bookingId) => {
    const result = await dispatch(payForBooking(bookingId));
    if (!result.error) setMessage('Payment completed and booking confirmed.');
  };

  return (
    <section className="space-y-4">
      <h2 className="text-3xl font-bold">Your bookings</h2>
      {message && <p className="rounded-2xl bg-emerald-50 p-3 text-sm text-emerald-700">{message}</p>}
      {error && <p className="rounded-2xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}
      {items.length === 0 && <p className="text-slate-500">No bookings yet.</p>}

      <div className="grid gap-4 md:grid-cols-2">
        {items.map((booking) => (
          <article key={booking._id} className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-soft">
            <img src={booking.listingId?.images?.[0] || bookingImage} alt={booking.listingId?.title || 'Workspace'} className="h-44 w-full object-cover" />
            <div className="space-y-2 p-4">
              <h4 className="text-lg font-semibold">{booking.listingId?.title || 'Workspace'}</h4>
              <p className="text-sm text-slate-600">{new Date(booking.checkInDate).toLocaleDateString()} to {new Date(booking.checkOutDate).toLocaleDateString()}</p>
              <p className="text-sm">Status: <span className="font-medium">{booking.status}</span></p>
              <p className="text-sm">Payment: <span className="font-medium">{booking.paymentStatus}</span></p>
              <p className="text-sm">Total: <span className="font-semibold">₹{booking.totalAmount} INR</span></p>
              {booking.paymentStatus !== 'paid' && (
                <button className="btn-primary" disabled={loading} onClick={() => handlePayNow(booking._id)}>
                  {loading ? 'Processing...' : 'Pay now'}
                </button>
              )}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
