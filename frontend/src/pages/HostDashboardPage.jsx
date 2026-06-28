import { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createListing, fetchHostListings } from '../features/listings/listingSlice';
import { linkRazorpayAccount } from '../features/auth/authSlice';
import { api } from '../api/client';

const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const TABS = [
  { id: 'listings', label: 'My Listings', icon: '🏢' },
  { id: 'orders', label: 'Booking Orders', icon: '📋' },
  { id: 'payments', label: 'Payments', icon: '💳' },
];

/* ─── status badge helper ─── */
function StatusBadge({ status, type = 'booking' }) {
  const maps = {
    booking: {
      pending: 'bg-amber-50 text-amber-700 border-amber-200',
      confirmed: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      cancelled: 'bg-red-50 text-red-700 border-red-200',
      completed: 'bg-blue-50 text-blue-700 border-blue-200',
    },
    payment: {
      pending: 'bg-amber-50 text-amber-700 border-amber-200',
      created: 'bg-slate-50 text-slate-600 border-slate-200',
      succeeded: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      paid: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      failed: 'bg-red-50 text-red-700 border-red-200',
      refunded: 'bg-purple-50 text-purple-700 border-purple-200',
    },
  };
  const cls = maps[type]?.[status] || 'bg-slate-100 text-slate-500 border-slate-200';
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold capitalize ${cls}`}>
      {status}
    </span>
  );
}

/* ─── stat card ─── */
function StatCard({ label, value, sub, accent }) {
  return (
    <div className="glass rounded-2xl p-4">
      <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">{label}</p>
      <p className={`mt-1 text-2xl font-bold ${accent || 'text-slate-900'}`}>{value}</p>
      {sub && <p className="mt-0.5 text-xs text-slate-500">{sub}</p>}
    </div>
  );
}

export default function HostDashboardPage() {
  const dispatch = useDispatch();
  const { items: listings, loading, error } = useSelector((s) => s.listings);
  const authUser = useSelector((s) => s.auth.user);

  const [activeTab, setActiveTab] = useState('listings');
  const [showAddForm, setShowAddForm] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');

  /* orders & payments state */
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [payments, setPayments] = useState([]);
  const [paymentsLoading, setPaymentsLoading] = useState(false);
  const [actionMsg, setActionMsg] = useState('');

  /* account setup */
  const [setupForm, setSetupForm] = useState({ phone: '', accountName: '', accountNumber: '', ifscCode: '' });
  const [setupLoading, setSetupLoading] = useState(false);

  /* listing form */
  const [formData, setFormData] = useState({
    title: '', description: '', workspaceType: 'desk',
    capacity: 4, pricePerHour: 20, pricePerDay: 95, pricePerMonth: 1200,
    amenities: 'WiFi,AC,Parking,Coffee', city: '', area: 150
  });
  const [images, setImages] = useState([]);
  const [timeSlot, setTimeSlot] = useState('09:00 - 18:00');
  const [selectedDays, setSelectedDays] = useState(['Mon', 'Tue', 'Wed', 'Thu', 'Fri']);
  const previews = useMemo(() => images.map((f) => URL.createObjectURL(f)), [images]);

  /* fetch data based on tab */
  useEffect(() => { dispatch(fetchHostListings()); }, [dispatch]);

  useEffect(() => {
    if (activeTab === 'orders') fetchOrders();
    if (activeTab === 'payments') fetchPayments();
  }, [activeTab]);

  const fetchOrders = async () => {
    setOrdersLoading(true);
    try {
      const { data } = await api.get('/bookings/host-orders');
      setOrders(data.data || []);
    } catch { setOrders([]); }
    setOrdersLoading(false);
  };

  const fetchPayments = async () => {
    setPaymentsLoading(true);
    try {
      const { data } = await api.get('/payments/host-payments');
      setPayments(data.data || []);
    } catch { setPayments([]); }
    setPaymentsLoading(false);
  };

  /* booking actions */
  const handleConfirm = async (id) => {
    setActionMsg('');
    try {
      await api.post(`/bookings/${id}/confirm`);
      setActionMsg('Booking confirmed!');
      fetchOrders();
    } catch (err) { setActionMsg(err.response?.data?.message || 'Action failed'); }
  };

  const handleCancel = async (id) => {
    setActionMsg('');
    try {
      await api.delete(`/bookings/${id}`);
      setActionMsg('Booking cancelled.');
      fetchOrders();
    } catch (err) { setActionMsg(err.response?.data?.message || 'Action failed'); }
  };

  /* listing form */
  const toggleDay = (d) => setSelectedDays((p) => p.includes(d) ? p.filter((x) => x !== d) : [...p, d]);

  const onSubmit = async (e) => {
    e.preventDefault();
    setSubmitMessage('');
    const payload = {
      title: formData.title, description: formData.description,
      workspaceType: formData.workspaceType,
      capacity: Number(formData.capacity),
      pricePerHour: Number(formData.pricePerHour),
      pricePerDay: Number(formData.pricePerDay),
      pricePerMonth: Number(formData.pricePerMonth),
      area: Number(formData.area || 150),
      amenities: formData.amenities.split(',').map((s) => s.trim()).filter(Boolean),
      address: { city: formData.city }, images
    };
    const result = await dispatch(createListing(payload));
    if (!result.error) {
      setSubmitMessage('Workspace published successfully!');
      setShowAddForm(false);
      dispatch(fetchHostListings());
      setFormData({ title: '', description: '', workspaceType: 'desk', capacity: 4, pricePerHour: 20, pricePerDay: 95, pricePerMonth: 1200, amenities: 'WiFi,AC,Parking,Coffee', city: '', area: 150 });
      setImages([]);
    } else {
      setSubmitMessage(result.payload || 'Unable to publish.');
    }
  };

  const handleAccountSetup = async (e) => {
    e.preventDefault();
    setSetupLoading(true);
    setActionMsg('');
    const res = await dispatch(linkRazorpayAccount(setupForm));
    if (res.error) setActionMsg(res.payload || 'Failed to setup account');
    else setActionMsg('Account setup successfully!');
    setSetupLoading(false);
  };

  /* stats */
  const totalListings = listings.length;
  const activeListings = listings.filter((l) => l.isActive !== false).length;
  const totalOrders = orders.length;
  const pendingOrders = orders.filter((o) => o.status === 'pending').length;
  const totalRevenue = payments.filter((p) => p.status === 'succeeded').reduce((s, p) => s + (p.amount || 0), 0);

  /* ─── role gate ─── */
  if (authUser && ['moderator', 'regulator'].includes(authUser.role)) {
    return (
      <section className="glass rounded-3xl p-6 md:p-8">
        <h1 className="text-2xl font-bold">Access Denied</h1>
        <p className="mt-2 text-slate-600">Staff accounts cannot manage workspaces.</p>
      </section>
    );
  }

  return (
    <section className="space-y-6">
      {/* ── header ── */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-brand-600">Host Dashboard</p>
          <h1 className="text-3xl font-bold">Welcome back, {authUser?.name || 'Host'} 👋</h1>
        </div>
        <div className="flex gap-3">
          {activeTab === 'listings' && authUser?.isRazorpayLinked && (
            <button onClick={() => setShowAddForm(!showAddForm)} className={showAddForm ? 'btn-ghost border border-slate-200' : 'btn-primary'}>
              {showAddForm ? '✕ Cancel' : '+ Add New Listing'}
            </button>
          )}
        </div>
      </div>

      {!authUser?.isRazorpayLinked && (
        <div className="glass rounded-3xl p-6 border-l-4 border-l-brand-500">
          <h2 className="text-xl font-bold text-slate-800">Complete your account setup</h2>
          <p className="mt-1 text-sm text-slate-600">Please provide your bank details to receive payouts for your bookings.</p>
          <form className="mt-4 grid gap-3 md:grid-cols-2 lg:grid-cols-4 max-w-4xl" onSubmit={handleAccountSetup}>
            <input className="input m-0" placeholder="Phone Number" required value={setupForm.phone} onChange={(e)=>setSetupForm({...setupForm, phone: e.target.value})} />
            <input className="input m-0" placeholder="Account Holder Name" required value={setupForm.accountName} onChange={(e)=>setSetupForm({...setupForm, accountName: e.target.value})} />
            <input className="input m-0" placeholder="Account Number" required value={setupForm.accountNumber} onChange={(e)=>setSetupForm({...setupForm, accountNumber: e.target.value})} />
            <input className="input m-0" placeholder="IFSC Code" required value={setupForm.ifscCode} onChange={(e)=>setSetupForm({...setupForm, ifscCode: e.target.value})} />
            <div className="md:col-span-2 lg:col-span-4">
              <button disabled={setupLoading} className="btn-primary">{setupLoading ? 'Saving...' : 'Save & Link Account'}</button>
            </div>
          </form>
        </div>
      )}

      {/* ── stats bar ── */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatCard label="Total Listings" value={totalListings} sub={`${activeListings} active`} />
        <StatCard label="Booking Orders" value={totalOrders} sub={pendingOrders ? `${pendingOrders} pending` : 'All clear'} accent={pendingOrders ? 'text-amber-600' : ''} />
        <StatCard label="Total Revenue" value={`₹${totalRevenue.toLocaleString('en-IN')}`} sub="from confirmed bookings" accent="text-emerald-600" />
        <StatCard label="Avg. Rating" value="4.8" sub="across all spaces" accent="text-amber-500" />
      </div>

      {/* ── tab bar ── */}
      <div className="flex gap-1 rounded-2xl bg-slate-100 p-1">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => { setActiveTab(tab.id); setShowAddForm(false); }}
            className={`flex-1 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all ${activeTab === tab.id ? 'bg-white text-slate-900 shadow-soft' : 'text-slate-500 hover:text-slate-700'}`}
          >
            <span className="mr-1.5">{tab.icon}</span>{tab.label}
          </button>
        ))}
      </div>

      {actionMsg && <p className="rounded-2xl bg-emerald-50 p-3 text-sm text-emerald-700">{actionMsg}</p>}
      {submitMessage && <p className="rounded-2xl bg-emerald-50 p-3 text-sm text-emerald-700">{submitMessage}</p>}
      {error && <p className="rounded-2xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}

      {/* ═══════════════════ TAB: LISTINGS ═══════════════════ */}
      {activeTab === 'listings' && (
        <>
          {showAddForm && (
            <article className="glass rounded-3xl p-6 md:p-8">
              <h2 className="text-xl font-bold">List a new workspace</h2>
              <p className="mt-1 text-sm text-slate-600">Fill in the details, upload photos, and publish.</p>

              <form className="mt-5 space-y-4" onSubmit={onSubmit}>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <label className="text-sm text-slate-600">Workspace title<input className="input" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} required /></label>
                  <label className="text-sm text-slate-600">City<input className="input" value={formData.city} onChange={(e) => setFormData({ ...formData, city: e.target.value })} required /></label>
                  <label className="text-sm text-slate-600">Type
                    <select className="input" value={formData.workspaceType} onChange={(e) => setFormData({ ...formData, workspaceType: e.target.value })}>
                      <option value="desk">Desk</option><option value="meeting-room">Meeting room</option>
                      <option value="studio">Studio</option><option value="co-working">Co-working</option>
                    </select>
                  </label>
                  <label className="text-sm text-slate-600">Capacity (No. of Professionals)<input className="input" type="number" min="1" value={formData.capacity} onChange={(e) => setFormData({ ...formData, capacity: e.target.value })} required /></label>
                  <label className="text-sm text-slate-600">Area (Sq. Ft.)<input className="input" type="number" min="1" value={formData.area} onChange={(e) => setFormData({ ...formData, area: e.target.value })} required /></label>
                  <label className="text-sm text-slate-600">Price / hour (INR)<input className="input" type="number" min="0" value={formData.pricePerHour} onChange={(e) => setFormData({ ...formData, pricePerHour: e.target.value })} required /></label>
                  <label className="text-sm text-slate-600">Price / day (INR)<input className="input" type="number" min="0" value={formData.pricePerDay} onChange={(e) => setFormData({ ...formData, pricePerDay: e.target.value })} required /></label>
                  <label className="text-sm text-slate-600">Price / month (INR)<input className="input" type="number" min="0" value={formData.pricePerMonth} onChange={(e) => setFormData({ ...formData, pricePerMonth: e.target.value })} required /></label>
                  
                  <div className="md:col-span-2">
                    <label className="text-sm text-slate-600">Amenities & Facilities
                      <input className="input" placeholder="WiFi, AC, Parking, Coffee, Projector" value={formData.amenities} onChange={(e) => setFormData({ ...formData, amenities: e.target.value })} />
                    </label>
                    <div className="mt-2 flex flex-wrap gap-1.5 items-center">
                      <span className="text-[10px] font-bold uppercase text-slate-400 mr-1">Quick Add:</span>
                      {['WiFi', 'AC', 'Parking', 'Coffee', 'Projector', 'Whiteboard', 'Lounge', 'Ergonomic Chairs', 'Monitors'].map((item) => {
                        const list = formData.amenities.split(',').map(s => s.trim()).filter(Boolean);
                        const isAdded = list.includes(item);
                        return (
                          <button
                            key={item}
                            type="button"
                            onClick={() => {
                              const newList = isAdded ? list.filter(s => s !== item) : [...list, item];
                              setFormData({ ...formData, amenities: newList.join(', ') });
                            }}
                            className={`rounded-full px-2.5 py-1 text-[10px] font-bold border transition ${
                              isAdded
                                ? 'bg-indigo-50 border-brand-300 text-brand-700'
                                : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
                            }`}
                          >
                            {isAdded ? '✓' : '+'} {item}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <label className="text-sm text-slate-600 md:col-span-2">Description<textarea className="input min-h-24" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} required /></label>
                  <label className="text-sm text-slate-600 md:col-span-2">Upload images<input className="input" type="file" accept="image/*" multiple onChange={(e) => setImages(Array.from(e.target.files || []))} /></label>
                </div>

                {!!previews.length && (
                  <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
                    {previews.map((url) => <img key={url} src={url} alt="preview" className="h-24 w-full rounded-2xl object-cover" />)}
                  </div>
                )}

                <h3 className="text-lg font-semibold">Availability</h3>
                <div className="flex flex-wrap gap-2">
                  {weekDays.map((day) => (
                    <button key={day} type="button" onClick={() => toggleDay(day)} className={`rounded-full border px-3 py-1 text-sm ${selectedDays.includes(day) ? 'border-brand-500 bg-brand-50 text-brand-700' : 'border-slate-200 bg-white text-slate-600'}`}>
                      {day}
                    </button>
                  ))}
                </div>

                <label className="block max-w-sm text-sm text-slate-600">Default time slot
                  <select className="input" value={timeSlot} onChange={(e) => setTimeSlot(e.target.value)}>
                    <option>07:00 - 13:00</option><option>09:00 - 18:00</option>
                    <option>13:00 - 20:00</option><option>24 Hours</option>
                  </select>
                </label>

                <button className="btn-primary" disabled={loading}>{loading ? 'Publishing...' : 'Publish workspace'}</button>
              </form>
            </article>
          )}

          {/* listing cards */}
          {listings.length === 0 && !loading && !showAddForm && (
            <div className="rounded-3xl border-2 border-dashed border-slate-200 p-12 text-center">
              <p className="text-4xl">🏗️</p>
              <p className="mt-3 font-semibold text-slate-700">No listings yet</p>
              <p className="text-sm text-slate-500">Create your first workspace listing to start earning.</p>
              <button onClick={() => setShowAddForm(true)} className="btn-primary mt-4">+ Add your first listing</button>
            </div>
          )}

          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {listings.map((listing) => (
              <article key={listing._id} className="group overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-soft transition hover:-translate-y-1 hover:shadow-float">
                <img src={listing.images?.[0] || 'https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=600&q=80'} alt={listing.title} className="h-44 w-full object-cover transition duration-300 group-hover:scale-105" />
                <div className="p-4 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-bold text-lg leading-tight">{listing.title}</h3>
                    <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-bold ${listing.isActive !== false ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-500'}`}>
                      {listing.isActive !== false ? 'Active' : 'Draft'}
                    </span>
                  </div>
                  <p className="text-sm text-slate-500">{listing.address?.city || 'Unknown'} • {listing.workspaceType}</p>
                  <div className="flex items-center gap-3 text-sm">
                    <span className="font-semibold">₹{listing.pricePerHour}/hr</span>
                    <span className="text-slate-300">•</span>
                    <span className="font-semibold">₹{listing.pricePerDay}/day</span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </>
      )}

      {/* ═══════════════════ TAB: BOOKING ORDERS ═══════════════════ */}
      {activeTab === 'orders' && (
        <div className="space-y-4">
          {ordersLoading && <p className="text-center text-slate-500 py-8">Loading booking orders...</p>}

          {!ordersLoading && orders.length === 0 && (
            <div className="rounded-3xl border-2 border-dashed border-slate-200 p-12 text-center">
              <p className="text-4xl">📭</p>
              <p className="mt-3 font-semibold text-slate-700">No booking orders yet</p>
              <p className="text-sm text-slate-500">When guests book your workspaces, their requests will appear here.</p>
            </div>
          )}

          {/* orders table */}
          {!ordersLoading && orders.length > 0 && (
            <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/80 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                    <th className="px-4 py-3">Workspace</th>
                    <th className="px-4 py-3">Guest</th>
                    <th className="px-4 py-3">Check-in</th>
                    <th className="px-4 py-3">Check-out</th>
                    <th className="px-4 py-3">Amount</th>
                    <th className="px-4 py-3">Booking</th>
                    <th className="px-4 py-3">Payment</th>
                    <th className="px-4 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr key={order._id} className="border-b border-slate-50 hover:bg-slate-50/60 transition">
                      <td className="px-4 py-3 font-medium">{order.listingId?.title || '—'}</td>
                      <td className="px-4 py-3">
                        <p className="font-medium">{order.guestId?.name || '—'}</p>
                        <p className="text-xs text-slate-400">{order.guestId?.email}</p>
                      </td>
                      <td className="px-4 py-3">{new Date(order.checkInDate).toLocaleDateString('en-IN')}</td>
                      <td className="px-4 py-3">{new Date(order.checkOutDate).toLocaleDateString('en-IN')}</td>
                      <td className="px-4 py-3 font-semibold">₹{order.totalAmount?.toLocaleString('en-IN')}</td>
                      <td className="px-4 py-3"><StatusBadge status={order.status} type="booking" /></td>
                      <td className="px-4 py-3"><StatusBadge status={order.paymentStatus} type="payment" /></td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          {order.status === 'pending' && (
                            <>
                              <button onClick={() => handleConfirm(order._id)} className="rounded-lg bg-emerald-500 px-3 py-1 text-xs font-semibold text-white hover:bg-emerald-600 transition">Confirm</button>
                              <button onClick={() => handleCancel(order._id)} className="rounded-lg bg-red-500 px-3 py-1 text-xs font-semibold text-white hover:bg-red-600 transition">Reject</button>
                            </>
                          )}
                          {order.status === 'confirmed' && <span className="text-xs text-emerald-600 font-semibold">✓ Allotted</span>}
                          {order.status === 'cancelled' && <span className="text-xs text-red-500 font-semibold">✕ Rejected</span>}
                          {order.status === 'completed' && <span className="text-xs text-blue-600 font-semibold">✓ Completed</span>}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ═══════════════════ TAB: PAYMENTS ═══════════════════ */}
      {activeTab === 'payments' && (
        <div className="space-y-4">
          {paymentsLoading && <p className="text-center text-slate-500 py-8">Loading payment records...</p>}

          {!paymentsLoading && payments.length === 0 && (
            <div className="rounded-3xl border-2 border-dashed border-slate-200 p-12 text-center">
              <p className="text-4xl">💰</p>
              <p className="mt-3 font-semibold text-slate-700">No payments recorded</p>
              <p className="text-sm text-slate-500">Payment records will appear here once guests pay for their bookings.</p>
            </div>
          )}

          {!paymentsLoading && payments.length > 0 && (
            <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/80 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                    <th className="px-4 py-3">Payment ID</th>
                    <th className="px-4 py-3">Guest</th>
                    <th className="px-4 py-3">Total</th>
                    <th className="px-4 py-3">Commission (10%)</th>
                    <th className="px-4 py-3">Your Payout</th>
                    <th className="px-4 py-3">Payment Status</th>
                    <th className="px-4 py-3">Payout Status</th>
                    <th className="px-4 py-3">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.map((pay) => (
                    <tr key={pay._id} className="border-b border-slate-50 hover:bg-slate-50/60 transition">
                      <td className="px-4 py-3 font-mono text-xs text-slate-500 text-nowrap">{pay._id.slice(-8).toUpperCase()}</td>
                      <td className="px-4 py-3">
                        <p className="font-medium text-nowrap">{pay.userId?.name || '—'}</p>
                        <p className="text-xs text-slate-400">{pay.userId?.email}</p>
                      </td>
                      <td className="px-4 py-3 font-semibold">₹{pay.amount?.toLocaleString('en-IN')}</td>
                      <td className="px-4 py-3 font-medium text-red-500">-₹{pay.commissionAmount?.toLocaleString('en-IN') || 0}</td>
                      <td className="px-4 py-3 font-bold text-emerald-600">₹{pay.transferAmount?.toLocaleString('en-IN') || pay.amount}</td>
                      <td className="px-4 py-3"><StatusBadge status={pay.status} type="payment" /></td>
                      <td className="px-4 py-3"><StatusBadge status={pay.payoutStatus || 'pending'} type="booking" /></td>
                      <td className="px-4 py-3 text-slate-500 text-nowrap">{new Date(pay.createdAt).toLocaleDateString('en-IN')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
