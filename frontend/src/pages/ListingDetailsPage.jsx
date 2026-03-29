import { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { fetchListingById } from '../features/listings/listingSlice';
import { createBooking } from '../features/bookings/bookingSlice';
import { addReview, fetchListingReviews } from '../features/reviews/reviewSlice';

const stockImages = [
  'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1400&q=80',
  'https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1400&q=80',
  'https://images.unsplash.com/photo-1497215842964-222b430dc094?auto=format&fit=crop&w=1400&q=80',
  'https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=1400&q=80',
  'https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=1400&q=80'
];

const amenities = [
  { key: 'WiFi', icon: '📶' },
  { key: 'AC', icon: '❄️' },
  { key: 'Parking', icon: '🅿️' },
  { key: 'Coffee', icon: '☕' }
];

export default function ListingDetailsPage() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { selected, loading } = useSelector((s) => s.listings);
  const { token } = useSelector((s) => s.auth);
  const reviews = useSelector((s) => s.reviews.items);

  const [bookingData, setBookingData] = useState({ checkInDate: '', checkOutDate: '', guestsCount: 1, timeSlot: '09:00 - 18:00' });
  const [reviewData, setReviewData] = useState({ bookingId: '', rating: 5, comment: '' });
  const [message, setMessage] = useState('');

  useEffect(() => {
    dispatch(fetchListingById(id));
    dispatch(fetchListingReviews(id));
  }, [dispatch, id]);

  const gallery = useMemo(() => {
    const live = selected?.images?.length ? selected.images : [];
    return [...live, ...stockImages].slice(0, 5);
  }, [selected]);

  const nights = useMemo(() => {
    if (!bookingData.checkInDate || !bookingData.checkOutDate) return 1;
    const start = new Date(bookingData.checkInDate);
    const end = new Date(bookingData.checkOutDate);
    return Math.max(1, Math.ceil((end - start) / 86400000));
  }, [bookingData.checkInDate, bookingData.checkOutDate]);

  const basePrice = Number(selected?.pricePerDay || 95);
  const subtotal = basePrice * nights;
  const serviceFee = Math.round(subtotal * 0.1);
  const total = subtotal + serviceFee;

  const handleBooking = async (e) => {
    e.preventDefault();
    const result = await dispatch(createBooking({ ...bookingData, listingId: id, guestsCount: Number(bookingData.guestsCount) }));
    if (!result.error) setMessage('Reserved. Complete payment from Trips page.');
  };

  const handleReview = async (e) => {
    e.preventDefault();
    await dispatch(addReview({ ...reviewData, rating: Number(reviewData.rating) }));
    dispatch(fetchListingReviews(id));
    setReviewData({ bookingId: '', rating: 5, comment: '' });
  };

  if (loading || !selected) {
    return <div className="h-72 animate-pulse rounded-3xl bg-slate-200" />;
  }

  return (
    <section className="space-y-5">
      <div>
        <h1 className="text-3xl font-bold">{selected.title}</h1>
        <p className="mt-1 text-slate-600">★ {selected.rating || 4.8} • {selected.address?.city || 'Prime district'}</p>
      </div>

      <div className="grid gap-3 md:grid-cols-[1.4fr_1fr]">
        <img className="h-[360px] w-full rounded-3xl object-cover" src={gallery[0]} alt={selected.title} />
        <div className="grid grid-cols-2 gap-3 md:grid-rows-2">
          {gallery.slice(1).map((src) => <img key={src} src={src} alt="workspace" className="h-full min-h-[170px] w-full rounded-3xl object-cover" />)}
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.4fr_0.9fr]">
        <article className="glass rounded-3xl p-5">
          <h2 className="text-xl font-semibold">About this space</h2>
          <p className="mt-2 text-slate-700">{selected.description}</p>

          <h3 className="mt-6 text-lg font-semibold">Amenities</h3>
          <div className="mt-3 grid grid-cols-2 gap-3">
            {amenities.map((amenity) => (
              <div key={amenity.key} className="rounded-2xl border border-slate-200 bg-white p-3 text-sm">
                <span className="mr-2">{amenity.icon}</span>{amenity.key}
              </div>
            ))}
          </div>

          <h3 className="mt-6 text-lg font-semibold">Reviews</h3>
          <div className="mt-3 space-y-3">
            {reviews.length === 0 && <p className="text-slate-500">No reviews yet.</p>}
            {reviews.map((review) => (
              <div key={review._id} className="rounded-2xl border border-slate-200 bg-white p-3">
                <p className="text-sm font-semibold">{review.reviewerId?.name || 'Guest'} • {review.rating}/5</p>
                <p className="mt-1 text-sm text-slate-600">{review.comment}</p>
              </div>
            ))}
          </div>

          {token && (
            <form className="mt-4 space-y-3" onSubmit={handleReview}>
              <h4 className="font-semibold">Write a review</h4>
              <input className="input" placeholder="Booking ID" value={reviewData.bookingId} onChange={(e) => setReviewData({ ...reviewData, bookingId: e.target.value })} required />
              <div className="grid gap-3 sm:grid-cols-[120px_1fr]">
                <input className="input" type="number" min="1" max="5" value={reviewData.rating} onChange={(e) => setReviewData({ ...reviewData, rating: e.target.value })} required />
                <input className="input" placeholder="Your feedback" value={reviewData.comment} onChange={(e) => setReviewData({ ...reviewData, comment: e.target.value })} required />
              </div>
              <button className="btn-ghost">Submit review</button>
            </form>
          )}
        </article>

        <aside className="glass h-fit rounded-3xl p-5 lg:sticky lg:top-24">
          <h3 className="text-2xl font-bold">₹{basePrice} <span className="text-base font-normal text-slate-500">/ day (INR)</span></h3>
          <form className="mt-3 space-y-3" onSubmit={handleBooking}>
            <label className="text-sm text-slate-600">Check-in<input className="input" type="date" value={bookingData.checkInDate} onChange={(e) => setBookingData({ ...bookingData, checkInDate: e.target.value })} required /></label>
            <label className="text-sm text-slate-600">Check-out<input className="input" type="date" value={bookingData.checkOutDate} onChange={(e) => setBookingData({ ...bookingData, checkOutDate: e.target.value })} required /></label>
            <label className="text-sm text-slate-600">Time slot
              <select className="input" value={bookingData.timeSlot} onChange={(e) => setBookingData({ ...bookingData, timeSlot: e.target.value })}>
                <option>07:00 - 13:00</option>
                <option>09:00 - 18:00</option>
                <option>13:00 - 20:00</option>
              </select>
            </label>
            <label className="text-sm text-slate-600">Guests<input className="input" type="number" min="1" value={bookingData.guestsCount} onChange={(e) => setBookingData({ ...bookingData, guestsCount: e.target.value })} required /></label>

            <div className="space-y-1 border-t border-slate-200 pt-3 text-sm">
              <p className="flex justify-between"><span>₹{basePrice} x {nights} day(s)</span><span>₹{subtotal}</span></p>
              <p className="flex justify-between"><span>Service fee</span><span>₹{serviceFee}</span></p>
              <p className="flex justify-between font-bold"><span>Total (INR)</span><span>₹{total}</span></p>
            </div>

            <button className="btn-primary" disabled={!token}>{token ? 'Reserve' : 'Login to reserve'}</button>
            {message && <p className="rounded-2xl bg-emerald-50 p-2 text-sm text-emerald-700">{message}</p>}
          </form>
        </aside>
      </div>
    </section>
  );
}
