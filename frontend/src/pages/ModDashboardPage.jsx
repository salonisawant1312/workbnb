import React, { useEffect, useState } from 'react';
import { api as axiosInstance } from '../api/client';
import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';

export default function ModDashboardPage() {
  const { user } = useSelector((s) => s.auth);
  
  // Tabs: 'users', 'listings', 'bookings', 'payments', 'reviews'
  const [activeTab, setActiveTab] = useState('users');
  
  // State for Users
  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(true);
  const [usersError, setUsersError] = useState(null);

  // State for Listings
  const [listings, setListings] = useState([]);
  const [listingsLoading, setListingsLoading] = useState(false);
  const [listingsError, setListingsError] = useState(null);

  // State for Bookings
  const [bookings, setBookings] = useState([]);
  const [bookingsLoading, setBookingsLoading] = useState(false);
  const [bookingsError, setBookingsError] = useState(null);

  // State for Payments
  const [payments, setPayments] = useState([]);
  const [paymentsLoading, setPaymentsLoading] = useState(false);
  const [paymentsError, setPaymentsError] = useState(null);

  // State for Reviews
  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [reviewsError, setReviewsError] = useState(null);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all'); // specific to Users
  const [workspaceTypeFilter, setWorkspaceTypeFilter] = useState('all'); // Listings & Bookings
  const [bookingStatusFilter, setBookingStatusFilter] = useState('all'); // specific to Bookings
  const [paymentStatusFilter, setPaymentStatusFilter] = useState('all'); // specific to Payments
  const [ratingFilter, setRatingFilter] = useState('all'); // specific to Reviews

  // Verify role: only moderators and regulators can see this page
  if (!user || !['moderator', 'regulator'].includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  // Fetch functions
  const fetchUsers = async () => {
    try {
      setUsersLoading(true);
      const { data } = await axiosInstance.get('/admin/users');
      setUsers(data.users || []);
      setUsersError(null);
    } catch (err) {
      setUsersError(err.response?.data?.message || 'Failed to fetch users');
    } finally {
      setUsersLoading(false);
    }
  };

  const fetchListings = async () => {
    try {
      setListingsLoading(true);
      const { data } = await axiosInstance.get('/admin/listings');
      setListings(data.listings || []);
      setListingsError(null);
    } catch (err) {
      setListingsError(err.response?.data?.message || 'Failed to fetch listings');
    } finally {
      setListingsLoading(false);
    }
  };

  const fetchBookings = async () => {
    try {
      setBookingsLoading(true);
      const { data } = await axiosInstance.get('/admin/bookings');
      setBookings(data.bookings || []);
      setBookingsError(null);
    } catch (err) {
      setBookingsError(err.response?.data?.message || 'Failed to fetch bookings');
    } finally {
      setBookingsLoading(false);
    }
  };

  const fetchPayments = async () => {
    try {
      setPaymentsLoading(true);
      const { data } = await axiosInstance.get('/admin/payments');
      setPayments(data.payments || []);
      setPaymentsError(null);
    } catch (err) {
      setPaymentsError(err.response?.data?.message || 'Failed to fetch payments');
    } finally {
      setPaymentsLoading(false);
    }
  };

  const fetchReviews = async () => {
    try {
      setReviewsLoading(true);
      const { data } = await axiosInstance.get('/admin/reviews');
      setReviews(data.reviews || []);
      setReviewsError(null);
    } catch (err) {
      setReviewsError(err.response?.data?.message || 'Failed to fetch reviews');
    } finally {
      setReviewsLoading(false);
    }
  };

  // Load data based on active tab
  useEffect(() => {
    if (activeTab === 'users') {
      fetchUsers();
    } else if (activeTab === 'listings') {
      fetchListings();
    } else if (activeTab === 'bookings') {
      fetchBookings();
    } else if (activeTab === 'payments') {
      fetchPayments();
    } else if (activeTab === 'reviews') {
      fetchReviews();
    }
  }, [activeTab]);

  const handleToggleStatus = async (userId, currentStatus) => {
    const newStatus = currentStatus === 'active' ? 'suspended' : 'active';
    try {
      await axiosInstance.put(`/admin/users/${userId}/status`, { status: newStatus });
      setUsers(users.map(u => u._id === userId ? { ...u, status: newStatus } : u));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update user status');
    }
  };

  // Filtering Logic
  const getFilteredData = () => {
    const query = searchQuery.toLowerCase();
    
    if (activeTab === 'users') {
      return users.filter((u) => {
        const matchesSearch =
          (u.name || '').toLowerCase().includes(query) ||
          (u.email || '').toLowerCase().includes(query);
        const matchesRole = roleFilter === 'all' ? true : u.role === roleFilter;
        return matchesSearch && matchesRole;
      });
    }

    if (activeTab === 'listings') {
      return listings.filter((l) => {
        const matchesSearch =
          (l.title || '').toLowerCase().includes(query) ||
          (l.description || '').toLowerCase().includes(query) ||
          (l.hostId?.name || '').toLowerCase().includes(query) ||
          (l.hostId?.email || '').toLowerCase().includes(query);
        const matchesType = workspaceTypeFilter === 'all' ? true : l.workspaceType === workspaceTypeFilter;
        return matchesSearch && matchesType;
      });
    }

    if (activeTab === 'bookings') {
      return bookings.filter((b) => {
        const matchesSearch =
          (b.guestId?.name || '').toLowerCase().includes(query) ||
          (b.guestId?.email || '').toLowerCase().includes(query) ||
          (b.listingId?.title || '').toLowerCase().includes(query) ||
          (b.listingId?.workspaceType || '').toLowerCase().includes(query) ||
          (b.hostId?.name || '').toLowerCase().includes(query) ||
          (b.hostId?.email || '').toLowerCase().includes(query);
        const matchesType = workspaceTypeFilter === 'all' ? true : b.listingId?.workspaceType === workspaceTypeFilter;
        const matchesStatus = bookingStatusFilter === 'all' ? true : b.status === bookingStatusFilter;
        return matchesSearch && matchesType && matchesStatus;
      });
    }

    if (activeTab === 'payments') {
      return payments.filter((p) => {
        const matchesSearch =
          (p.userId?.name || '').toLowerCase().includes(query) ||
          (p.userId?.email || '').toLowerCase().includes(query) ||
          (p.bookingId?.listingId?.title || '').toLowerCase().includes(query) ||
          (p.razorpayPaymentId || '').toLowerCase().includes(query) ||
          (p._id || '').toLowerCase().includes(query);
        const matchesStatus = paymentStatusFilter === 'all' ? true : p.status === paymentStatusFilter;
        return matchesSearch && matchesStatus;
      });
    }

    if (activeTab === 'reviews') {
      return reviews.filter((r) => {
        const matchesSearch =
          (r.comment || '').toLowerCase().includes(query) ||
          (r.reviewerId?.name || '').toLowerCase().includes(query) ||
          (r.reviewerId?.email || '').toLowerCase().includes(query) ||
          (r.listingId?.title || '').toLowerCase().includes(query);
        const matchesRating = ratingFilter === 'all' ? true : r.rating === Number(ratingFilter);
        return matchesSearch && matchesRating;
      });
    }

    return [];
  };

  const filteredData = getFilteredData();
  const isLoading = 
    (activeTab === 'users' && usersLoading) ||
    (activeTab === 'listings' && listingsLoading) ||
    (activeTab === 'bookings' && bookingsLoading) ||
    (activeTab === 'payments' && paymentsLoading) ||
    (activeTab === 'reviews' && reviewsLoading);
  
  const activeError = 
    (activeTab === 'users' && usersError) ||
    (activeTab === 'listings' && listingsError) ||
    (activeTab === 'bookings' && bookingsError) ||
    (activeTab === 'payments' && paymentsError) ||
    (activeTab === 'reviews' && reviewsError);

  const handleDownloadCSV = () => {
    if (filteredData.length === 0) return;

    let csvContent = "data:text/csv;charset=utf-8,";
    let headers = [];
    let rows = [];

    if (activeTab === 'users') {
      headers = ['Name', 'Email', 'Role', 'Status'];
      rows = filteredData.map(u => [u.name, u.email, u.role, u.status || 'active']);
    } else if (activeTab === 'listings') {
      headers = ['Title', 'Host Name', 'Host Email', 'Workspace Type', 'Price Per Hour', 'Price Per Day', 'City', 'Status'];
      rows = filteredData.map(l => [
        l.title, l.hostId?.name || '', l.hostId?.email || '', l.workspaceType,
        l.pricePerHour, l.pricePerDay, l.address?.city || '', l.isActive ? 'Active' : 'Inactive'
      ]);
    } else if (activeTab === 'bookings') {
      headers = ['Guest Name', 'Guest Email', 'Workspace', 'Workspace Type', 'Host Name', 'Check-in', 'Check-out', 'Amount', 'Status'];
      rows = filteredData.map(b => [
        b.guestId?.name || '', b.guestId?.email || '', b.listingId?.title || '', b.listingId?.workspaceType || '',
        b.hostId?.name || '', new Date(b.checkInDate).toLocaleDateString(), new Date(b.checkOutDate).toLocaleDateString(),
        b.totalAmount, b.status
      ]);
    } else if (activeTab === 'payments') {
      headers = ['Payment ID', 'Guest Name', 'Guest Email', 'Workspace', 'Amount', 'Status', 'Date'];
      rows = filteredData.map(p => [
        p.razorpayPaymentId || p._id, p.userId?.name || '', p.userId?.email || '', p.bookingId?.listingId?.title || '',
        (p.amount / 100).toFixed(2), p.status, new Date(p.createdAt).toLocaleString()
      ]);
    } else if (activeTab === 'reviews') {
      headers = ['Workspace', 'Reviewer Name', 'Host Name', 'Rating', 'Comment', 'Date'];
      rows = filteredData.map(r => [
        r.listingId?.title || '', r.reviewerId?.name || '', r.hostId?.name || '', r.rating,
        (r.comment || '').replace(/\n/g, ' '), new Date(r.createdAt || Date.now()).toLocaleDateString()
      ]);
    }

    const escapeCell = (cell) => {
      if (cell === null || cell === undefined) return '""';
      const str = String(cell);
      if (str.includes(',') || str.includes('"') || str.includes('\n')) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    };

    csvContent += headers.map(escapeCell).join(',') + '\n';
    rows.forEach(row => {
      csvContent += row.map(escapeCell).join(',') + '\n';
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `workbnb_report_${activeTab}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-brand-600">
            {user.role} workspace panel
          </p>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 capitalize">
            {user.role} Dashboard
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Monitor users, listings, bookings, payments, reviews, and track which guests book what kind of offices.
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-xl bg-indigo-50 px-3 py-1.5 text-xs font-semibold text-brand-700">
          <span className="h-2 w-2 rounded-full bg-brand-500 animate-pulse" />
          Live Regulator Mode
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 gap-6 overflow-x-auto">
        {[
          { id: 'users', label: 'Users', icon: '👤' },
          { id: 'listings', label: 'Listings', icon: '🏢' },
          { id: 'bookings', label: 'Bookings', icon: '📅' },
          { id: 'payments', label: 'Payments', icon: '💳' },
          { id: 'reviews', label: 'Reviews', icon: '⭐' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => {
              setActiveTab(tab.id);
              setSearchQuery('');
              setWorkspaceTypeFilter('all');
            }}
            className={`pb-4 text-sm font-semibold border-b-2 flex items-center gap-2 transition-all shrink-0 ${
              activeTab === tab.id
                ? 'border-brand-600 text-brand-600'
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
            }`}
          >
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Filter and search control box */}
      <div className="glass rounded-2xl p-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-md">
          <input
            type="text"
            placeholder={
              activeTab === 'users' ? "Search by name or email..." :
              activeTab === 'listings' ? "Search by title, host, description..." :
              activeTab === 'bookings' ? "Search by guest, host, room name..." :
              activeTab === 'payments' ? "Search by guest, room, payment ID..." :
              "Search reviews by guest, comment, room..."
            }
            className="input pr-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <div className="absolute right-3 top-3.5 text-slate-400">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.637 10.637z" />
            </svg>
          </div>
        </div>

        {/* Filter selection based on active tab */}
        <div className="flex items-center gap-2">
          {activeTab === 'users' && (
            <>
              <label className="text-xs font-bold uppercase text-slate-400 tracking-wider">Role:</label>
              <select
                className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold outline-none transition focus:border-brand-500"
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
              >
                <option value="all">All Roles</option>
                <option value="host">Hosts Only</option>
                <option value="guest">Guests Only</option>
              </select>
            </>
          )}

          {activeTab === 'listings' && (
            <>
              <label className="text-xs font-bold uppercase text-slate-400 tracking-wider">Type:</label>
              <select
                className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold outline-none transition focus:border-brand-500"
                value={workspaceTypeFilter}
                onChange={(e) => setWorkspaceTypeFilter(e.target.value)}
              >
                <option value="all">All Types</option>
                <option value="desk">Desk</option>
                <option value="meeting-room">Meeting Room</option>
                <option value="studio">Studio</option>
                <option value="co-working">Co-working</option>
              </select>
            </>
          )}

          {activeTab === 'bookings' && (
            <>
              <label className="text-xs font-bold uppercase text-slate-400 tracking-wider">Type:</label>
              <select
                className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold outline-none transition focus:border-brand-500"
                value={workspaceTypeFilter}
                onChange={(e) => setWorkspaceTypeFilter(e.target.value)}
              >
                <option value="all">All Types</option>
                <option value="desk">Desk</option>
                <option value="meeting-room">Meeting Room</option>
                <option value="studio">Studio</option>
                <option value="co-working">Co-working</option>
              </select>

              <label className="text-xs font-bold uppercase text-slate-400 tracking-wider ml-2">Status:</label>
              <select
                className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold outline-none transition focus:border-brand-500"
                value={bookingStatusFilter}
                onChange={(e) => setBookingStatusFilter(e.target.value)}
              >
                <option value="all">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="cancelled">Cancelled</option>
                <option value="completed">Completed</option>
              </select>
            </>
          )}

          {activeTab === 'payments' && (
            <>
              <label className="text-xs font-bold uppercase text-slate-400 tracking-wider">Status:</label>
              <select
                className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold outline-none transition focus:border-brand-500"
                value={paymentStatusFilter}
                onChange={(e) => setPaymentStatusFilter(e.target.value)}
              >
                <option value="all">All Statuses</option>
                <option value="created">Created</option>
                <option value="succeeded">Succeeded</option>
                <option value="failed">Failed</option>
                <option value="refunded">Refunded</option>
              </select>
            </>
          )}

          {activeTab === 'reviews' && (
            <>
              <label className="text-xs font-bold uppercase text-slate-400 tracking-wider">Rating:</label>
              <select
                className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold outline-none transition focus:border-brand-500"
                value={ratingFilter}
                onChange={(e) => setRatingFilter(e.target.value)}
              >
                <option value="all">All Ratings</option>
                <option value="5">5 Stars</option>
                <option value="4">4 Stars</option>
                <option value="3">3 Stars</option>
                <option value="2">2 Stars</option>
                <option value="1">1 Star</option>
              </select>
            </>
          )}

          <button
            onClick={handleDownloadCSV}
            disabled={filteredData.length === 0}
            className="ml-4 flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
            </svg>
            Download Report (CSV)
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      {isLoading ? (
        <div className="p-12 text-center text-slate-600 bg-white rounded-2xl border border-slate-200 shadow-soft">
          <div className="flex flex-col items-center justify-center gap-3">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-brand-600" />
            <span className="text-sm font-medium">Loading data...</span>
          </div>
        </div>
      ) : activeError ? (
        <div className="p-8 text-center text-red-500 bg-red-50 border border-red-200 rounded-2xl">
          {activeError}
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-soft">
          
          {/* TAB 1: USERS */}
          {activeTab === 'users' && (
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-xs uppercase text-slate-700 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4 font-bold">User</th>
                  <th className="px-6 py-4 font-bold">Role</th>
                  <th className="px-6 py-4 font-bold">Status</th>
                  <th className="px-6 py-4 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredData.map((u) => (
                  <tr key={u._id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-semibold text-slate-900">{u.name}</span>
                        <span className="text-xs text-slate-500">{u.email}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${
                        u.role === 'host' ? 'bg-blue-50 text-blue-700 border border-blue-100' : 'bg-slate-50 text-slate-600 border border-slate-100'
                      }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${
                        u.status === 'suspended' ? 'bg-red-50 text-red-700 border border-red-100' : 'bg-green-50 text-green-700 border border-green-100'
                      }`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${u.status === 'suspended' ? 'bg-red-500' : 'bg-green-500'}`} />
                        {u.status || 'active'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleToggleStatus(u._id, u.status || 'active')}
                        className={`inline-flex items-center justify-center rounded-xl px-4 py-2 text-xs font-bold transition shadow-sm ${
                          u.status === 'suspended'
                            ? 'bg-green-600 text-white hover:bg-green-700 hover:-translate-y-0.5'
                            : 'bg-red-600 text-white hover:bg-red-700 hover:-translate-y-0.5'
                        }`}
                      >
                        {u.status === 'suspended' ? 'Activate Account' : 'Suspend Account'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {/* TAB 2: LISTINGS */}
          {activeTab === 'listings' && (
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-xs uppercase text-slate-700 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4 font-bold">Listing Room</th>
                  <th className="px-6 py-4 font-bold">Host</th>
                  <th className="px-6 py-4 font-bold">Workspace Type</th>
                  <th className="px-6 py-4 font-bold">Price Details</th>
                  <th className="px-6 py-4 font-bold">Location</th>
                  <th className="px-6 py-4 font-bold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredData.map((l) => (
                  <tr key={l._id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {l.images && l.images[0] && (
                          <img src={l.images[0]} alt={l.title} className="w-10 h-10 rounded-lg object-cover" />
                        )}
                        <div className="flex flex-col">
                          <span className="font-semibold text-slate-900">{l.title}</span>
                          <span className="text-xs text-slate-500 line-clamp-1">{l.description}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-medium text-slate-800">{l.hostId?.name || 'Unknown'}</span>
                        <span className="text-xs text-slate-500">{l.hostId?.email || '-'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center rounded-full bg-indigo-50 text-indigo-700 px-2.5 py-0.5 text-xs font-semibold capitalize border border-indigo-100">
                        {l.workspaceType}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-xs space-y-0.5">
                        <div><strong className="text-slate-700">Hour:</strong> ₹{l.pricePerHour}</div>
                        <div><strong className="text-slate-700">Day:</strong> ₹{l.pricePerDay}</div>
                        <div><strong className="text-slate-700">Month:</strong> ₹{l.pricePerMonth}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-700 font-medium">
                      {l.address?.city || '-'}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${
                        l.isActive ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-amber-50 text-amber-700 border border-amber-100'
                      }`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${l.isActive ? 'bg-green-500' : 'bg-amber-500'}`} />
                        {l.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {/* TAB 3: BOOKINGS */}
          {activeTab === 'bookings' && (
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-xs uppercase text-slate-700 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4 font-bold">Guest (Who)</th>
                  <th className="px-6 py-4 font-bold">Workspace / Office Type (What)</th>
                  <th className="px-6 py-4 font-bold">Host</th>
                  <th className="px-6 py-4 font-bold">Booking Dates</th>
                  <th className="px-6 py-4 font-bold">Amount</th>
                  <th className="px-6 py-4 font-bold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredData.map((b) => (
                  <tr key={b._id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-semibold text-slate-900">{b.guestId?.name || 'Unknown'}</span>
                        <span className="text-xs text-slate-500">{b.guestId?.email || '-'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-semibold text-slate-800">{b.listingId?.title || 'Unknown Workspace'}</span>
                        <span className="inline-flex items-center rounded-full bg-blue-50 text-blue-700 px-2 py-0.5 text-[11px] font-semibold capitalize border border-blue-100 mt-1 w-fit">
                          {b.listingId?.workspaceType || '-'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-medium text-slate-700">{b.hostId?.name || 'Unknown'}</span>
                        <span className="text-xs text-slate-500">{b.hostId?.email || '-'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-700 space-y-1">
                      <div><strong className="text-slate-500 font-bold">In:</strong> {new Date(b.checkInDate).toLocaleDateString()}</div>
                      <div><strong className="text-slate-500 font-bold">Out:</strong> {new Date(b.checkOutDate).toLocaleDateString()}</div>
                    </td>
                    <td className="px-6 py-4 font-bold text-slate-900">
                      ₹{b.totalAmount}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${
                        b.status === 'confirmed' ? 'bg-green-50 text-green-700 border border-green-100' :
                        b.status === 'cancelled' ? 'bg-red-50 text-red-700 border border-red-100' :
                        b.status === 'completed' ? 'bg-blue-50 text-blue-700 border border-blue-100' :
                        'bg-amber-50 text-amber-700 border border-amber-100'
                      }`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${
                          b.status === 'confirmed' ? 'bg-green-500' :
                          b.status === 'cancelled' ? 'bg-red-500' :
                          b.status === 'completed' ? 'bg-blue-500' :
                          'bg-amber-500'
                        }`} />
                        {b.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {/* TAB 4: PAYMENTS */}
          {activeTab === 'payments' && (
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-xs uppercase text-slate-700 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4 font-bold">Payment ID / Date</th>
                  <th className="px-6 py-4 font-bold">User / Guest</th>
                  <th className="px-6 py-4 font-bold">Listing Room</th>
                  <th className="px-6 py-4 font-bold">Amount</th>
                  <th className="px-6 py-4 font-bold">Method</th>
                  <th className="px-6 py-4 font-bold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredData.map((p) => (
                  <tr key={p._id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-mono text-xs text-slate-900">{p.razorpayPaymentId || p._id}</span>
                        <span className="text-[10px] text-slate-400">{new Date(p.createdAt).toLocaleString()}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-medium text-slate-800">{p.userId?.name || 'Unknown'}</span>
                        <span className="text-xs text-slate-500">{p.userId?.email || '-'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-800">
                      {p.bookingId?.listingId?.title || 'Unknown Room'}
                    </td>
                    <td className="px-6 py-4 font-bold text-slate-900">
                      ₹{(p.amount / 100).toFixed(2)}
                    </td>
                    <td className="px-6 py-4 capitalize text-xs font-semibold text-slate-500">
                      {p.paymentMethod || 'Razorpay'}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${
                        p.status === 'succeeded' ? 'bg-green-50 text-green-700 border border-green-100' :
                        p.status === 'failed' ? 'bg-red-50 text-red-700 border border-red-100' :
                        p.status === 'refunded' ? 'bg-blue-50 text-blue-700 border border-blue-100' :
                        'bg-amber-50 text-amber-700 border border-amber-100'
                      }`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${
                          p.status === 'succeeded' ? 'bg-green-500' :
                          p.status === 'failed' ? 'bg-red-500' :
                          p.status === 'refunded' ? 'bg-blue-500' :
                          'bg-amber-500'
                        }`} />
                        {p.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {/* TAB 5: REVIEWS */}
          {activeTab === 'reviews' && (
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-xs uppercase text-slate-700 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4 font-bold">Review Description</th>
                  <th className="px-6 py-4 font-bold">Listing Room</th>
                  <th className="px-6 py-4 font-bold">Reviewer</th>
                  <th className="px-6 py-4 font-bold">Host</th>
                  <th className="px-6 py-4 font-bold">Rating</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredData.map((r) => (
                  <tr key={r._id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-slate-800 font-medium italic">"{r.comment}"</span>
                        <span className="text-[10px] text-slate-400 mt-1">{new Date(r.createdAt || Date.now()).toLocaleDateString()}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-semibold text-slate-900">
                      {r.listingId?.title || 'Unknown Room'}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-medium text-slate-800">{r.reviewerId?.name || 'Unknown'}</span>
                        <span className="text-xs text-slate-500">{r.reviewerId?.email || '-'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-medium text-slate-800">{r.hostId?.name || 'Unknown'}</span>
                        <span className="text-xs text-slate-500">{r.hostId?.email || '-'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-bold text-amber-500">
                      {'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}
                      <span className="ml-1.5 text-xs text-slate-500 font-semibold">({r.rating}/5)</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {/* Empty state */}
          {filteredData.length === 0 && (
            <div className="p-12 text-center text-slate-400 bg-white w-full">
              <div className="flex flex-col items-center justify-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-slate-300">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.109A9.342 9.342 0 0012.458 10.22M12 7.757a3.89 3.89 0 100-7.78 3.89 3.89 0 000 7.78zM21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>No matching items found.</span>
              </div>
            </div>
          )}

        </div>
      )}
    </div>
  );
}
