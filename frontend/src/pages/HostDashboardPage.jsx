import { useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createListing } from '../features/listings/listingSlice';
import { useNavigate } from 'react-router-dom';

const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export default function HostDashboardPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((s) => s.listings);
  const authUser = useSelector((s) => s.auth.user);
  const [submitMessage, setSubmitMessage] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    workspaceType: 'desk',
    capacity: 4,
    pricePerHour: 20,
    pricePerDay: 95,
    pricePerMonth: 1200,
    amenities: 'WiFi,AC,Parking,Coffee',
    city: ''
  });
  const [images, setImages] = useState([]);
  const [timeSlot, setTimeSlot] = useState('09:00 - 18:00');
  const [selectedDays, setSelectedDays] = useState(['Mon', 'Tue', 'Wed', 'Thu', 'Fri']);

  const previews = useMemo(() => images.map((file) => URL.createObjectURL(file)), [images]);

  const toggleDay = (day) => {
    setSelectedDays((prev) => (prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setSubmitMessage('');
    const payload = {
      title: formData.title,
      description: formData.description,
      workspaceType: formData.workspaceType,
      capacity: Number(formData.capacity),
      pricePerHour: Number(formData.pricePerHour),
      pricePerDay: Number(formData.pricePerDay),
      pricePerMonth: Number(formData.pricePerMonth),
      amenities: formData.amenities.split(',').map((s) => s.trim()).filter(Boolean),
      address: { city: formData.city },
      images
    };

    const result = await dispatch(createListing(payload));
    if (!result.error) {
      setSubmitMessage('Workspace published successfully.');
      navigate('/');
    } else {
      setSubmitMessage(result.payload || 'Unable to publish. Host role required.');
    }
  };

  if (authUser && !['host', 'admin'].includes(authUser.role)) {
    return (
      <section className="glass rounded-3xl p-6 md:p-8">
        <h1 className="text-2xl font-bold">Host access required</h1>
        <p className="mt-2 text-slate-600">
          Your current role is <strong>{authUser.role}</strong>. Only <strong>host</strong> or <strong>admin</strong> accounts can publish workspaces.
        </p>
        <p className="mt-3 text-sm text-slate-500">Log in with a host account (for seeded data: testhost@workbnb.dev) and try again.</p>
      </section>
    );
  }

  return (
    <section className="glass rounded-3xl p-6 md:p-8">
      <h1 className="text-3xl font-bold">Host Dashboard</h1>
      <p className="mt-2 text-slate-600">List your workspace with images, flexible pricing, and availability.</p>

      <form className="mt-6 space-y-4" onSubmit={onSubmit}>
        {(error || submitMessage) && (
          <p className={`rounded-2xl p-3 text-sm ${error ? 'bg-red-50 text-red-700' : 'bg-emerald-50 text-emerald-700'}`}>
            {error || submitMessage}
          </p>
        )}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <label className="text-sm text-slate-600">Workspace title<input className="input" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} required /></label>
          <label className="text-sm text-slate-600">City<input className="input" value={formData.city} onChange={(e) => setFormData({ ...formData, city: e.target.value })} required /></label>
          <label className="text-sm text-slate-600">Type
            <select className="input" value={formData.workspaceType} onChange={(e) => setFormData({ ...formData, workspaceType: e.target.value })}>
              <option value="desk">Desk</option>
              <option value="meeting-room">Meeting room</option>
              <option value="studio">Studio</option>
              <option value="co-working">Co-working</option>
            </select>
          </label>
          <label className="text-sm text-slate-600">Capacity<input className="input" type="number" min="1" value={formData.capacity} onChange={(e) => setFormData({ ...formData, capacity: e.target.value })} required /></label>
          <label className="text-sm text-slate-600">Price / hour (INR)<input className="input" type="number" min="0" value={formData.pricePerHour} onChange={(e) => setFormData({ ...formData, pricePerHour: e.target.value })} required /></label>
          <label className="text-sm text-slate-600">Price / day (INR)<input className="input" type="number" min="0" value={formData.pricePerDay} onChange={(e) => setFormData({ ...formData, pricePerDay: e.target.value })} required /></label>
          <label className="text-sm text-slate-600">Price / month (INR)<input className="input" type="number" min="0" value={formData.pricePerMonth} onChange={(e) => setFormData({ ...formData, pricePerMonth: e.target.value })} required /></label>
          <label className="text-sm text-slate-600">Amenities<input className="input" value={formData.amenities} onChange={(e) => setFormData({ ...formData, amenities: e.target.value })} /></label>
          <label className="text-sm text-slate-600 md:col-span-2">Description<textarea className="input min-h-24" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} required /></label>
          <label className="text-sm text-slate-600 md:col-span-2">Upload images<input className="input" type="file" accept="image/*" multiple onChange={(e) => setImages(Array.from(e.target.files || []))} /></label>
        </div>

        {!!previews.length && (
          <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
            {previews.map((url) => <img key={url} src={url} alt="preview" className="h-24 w-full rounded-2xl object-cover" />)}
          </div>
        )}

        <h3 className="text-lg font-semibold">Availability calendar</h3>
        <div className="flex flex-wrap gap-2">
          {weekDays.map((day) => (
            <button
              key={day}
              type="button"
              className={`rounded-full border px-3 py-1 text-sm ${selectedDays.includes(day) ? 'border-brand-500 bg-brand-50 text-brand-700' : 'border-slate-200 bg-white text-slate-600'}`}
              onClick={() => toggleDay(day)}
            >
              {day}
            </button>
          ))}
        </div>

        <label className="block max-w-sm text-sm text-slate-600">Default time slot
          <select className="input" value={timeSlot} onChange={(e) => setTimeSlot(e.target.value)}>
            <option>07:00 - 13:00</option>
            <option>09:00 - 18:00</option>
            <option>13:00 - 20:00</option>
            <option>24 Hours</option>
          </select>
        </label>

        <button className="btn-primary" disabled={loading}>{loading ? 'Publishing...' : 'Publish workspace'}</button>
      </form>
    </section>
  );
}
