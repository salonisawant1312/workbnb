import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchBookings, createRazorpayOrder, verifyRazorpayPayment } from '../features/bookings/bookingSlice';
import { addReview } from '../features/reviews/reviewSlice';

const bookingImage = 'https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=900&q=80';

export default function BookingHistoryPage() {
  const dispatch = useDispatch();
  const { items, loading, error } = useSelector((s) => s.bookings);
  const [message, setMessage] = useState('');
  const [reviewForm, setReviewForm] = useState(null);
  const [reviewData, setReviewData] = useState({ rating: 5, comment: '' });

  useEffect(() => {
    dispatch(fetchBookings());
  }, [dispatch]);

  const handlePayNow = async (bookingId) => {
    setMessage('');
    const orderRes = await dispatch(createRazorpayOrder(bookingId));
    
    if (orderRes.error) {
      setMessage(orderRes.payload || 'Failed to initialize payment');
      return;
    }
    
    const { orderId, paymentId, amount, currency, mock } = orderRes.payload;

    if (mock) {
      const verifyRes = await dispatch(verifyRazorpayPayment({ paymentId }));
      if (!verifyRes.error) setMessage('Mock payment completed and booking confirmed.');
      else setMessage(verifyRes.payload || 'Mock payment verification failed.');
      return;
    }

    const options = {
      key: import.meta.env.VITE_RAZORPAY_KEY_ID || process.env.VITE_RAZORPAY_KEY_ID,
      amount: Math.round(amount * 100),
      currency: currency || 'INR',
      name: 'WorkBnB',
      description: 'Workspace Booking Payment',
      order_id: orderId,
      handler: async function (response) {
        const verifyRes = await dispatch(verifyRazorpayPayment({
          paymentId,
          razorpay_order_id: response.razorpay_order_id,
          razorpay_payment_id: response.razorpay_payment_id,
          razorpay_signature: response.razorpay_signature
        }));
        
        if (!verifyRes.error) {
          setMessage('Payment completed and booking confirmed.');
        } else {
          setMessage(verifyRes.payload || 'Payment verification failed.');
        }
      },
      prefill: {
        name: 'Guest User',
        email: 'guest@example.com',
      },
      theme: { color: '#0ea5e9' }
    };

    const rzp = new window.Razorpay(options);
    rzp.on('payment.failed', function (response) {
      setMessage(`Payment failed: ${response.error.description || 'Unknown error'}`);
    });
    rzp.open();
  };

  const handleReviewSubmit = async (e, bookingId) => {
    e.preventDefault();
    setMessage('');
    const res = await dispatch(addReview({ bookingId, ...reviewData }));
    if (!res.error) {
      setMessage('Review submitted successfully!');
      setReviewForm(null);
      setReviewData({ rating: 5, comment: '' });
    } else {
      setMessage(res.payload || 'Failed to submit review');
    }
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
                <button className="btn-primary mt-2" disabled={loading} onClick={() => handlePayNow(booking._id)}>
                  {loading ? 'Processing...' : 'Pay now'}
                </button>
              )}
              {(booking.status === 'completed' || (booking.status === 'confirmed' && new Date(booking.checkOutDate) < new Date())) && (
                <div className="mt-2 border-t border-slate-100 pt-2">
                  {reviewForm !== booking._id ? (
                    <button className="btn-ghost text-xs" onClick={() => setReviewForm(booking._id)}>Leave a Review</button>
                  ) : (
                    <form className="space-y-2" onSubmit={(e) => handleReviewSubmit(e, booking._id)}>
                      <div className="flex items-center gap-2">
                        <label className="text-xs font-semibold text-slate-500">Rating (1-5):</label>
                        <input className="input py-1 text-sm max-w-[80px]" type="number" min="1" max="5" value={reviewData.rating} onChange={(e) => setReviewData({ ...reviewData, rating: Number(e.target.value) })} required />
                      </div>
                      <textarea className="input py-2 text-sm resize-none" rows="2" placeholder="How was your experience?" value={reviewData.comment} onChange={(e) => setReviewData({ ...reviewData, comment: e.target.value })} required></textarea>
                      <div className="flex gap-2">
                        <button type="submit" className="btn-primary text-xs py-1 px-3">Submit</button>
                        <button type="button" className="btn-ghost text-xs py-1 px-3" onClick={() => setReviewForm(null)}>Cancel</button>
                      </div>
                    </form>
                  )}
                </div>
              )}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
