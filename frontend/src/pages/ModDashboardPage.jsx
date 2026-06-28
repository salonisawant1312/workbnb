import React, { useEffect, useState } from 'react';
import { api as axiosInstance } from '../api/client';
import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';

export default function ModDashboardPage() {
  const { user } = useSelector((s) => s.auth);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');

  // Verify role: only moderators and regulators can see this page
  if (!user || !['moderator', 'regulator'].includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  const fetchUsers = async () => {
    try {
      const { data } = await axiosInstance.get('/admin/users');
      setUsers(data.users);
      setLoading(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch users');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleToggleStatus = async (userId, currentStatus) => {
    const newStatus = currentStatus === 'active' ? 'suspended' : 'active';
    try {
      await axiosInstance.put(`/admin/users/${userId}/status`, { status: newStatus });
      setUsers(users.map(u => u._id === userId ? { ...u, status: newStatus } : u));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update user status');
    }
  };

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      (u.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (u.email || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === 'all' ? true : u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  if (loading) return <div className="p-8 text-center text-slate-600">Loading users to regulate...</div>;
  if (error) return <div className="p-8 text-center text-red-500">{error}</div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-brand-600">
            {user.role} workspace panel
          </p>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 capitalize">
            {user.role} Dashboard
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Monitor and regulate hosts and guests on the platform.
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-xl bg-indigo-50 px-3 py-1.5 text-xs font-semibold text-brand-700">
          <span className="h-2 w-2 rounded-full bg-brand-500 animate-pulse" />
          Live Regulator Mode
        </div>
      </div>

      {/* Filter and search control box */}
      <div className="glass rounded-2xl p-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-md">
          <input
            type="text"
            placeholder="Search by name or email..."
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

        <div className="flex items-center gap-2">
          <label className="text-xs font-bold uppercase text-slate-400 tracking-wider">Role Filter:</label>
          <select
            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold outline-none transition focus:border-brand-500"
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
          >
            <option value="all">All Roles</option>
            <option value="host">Hosts Only</option>
            <option value="guest">Guests Only</option>
          </select>
        </div>
      </div>

      {/* User listing table */}
      <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-soft">
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
            {filteredUsers.map((u) => (
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
            {filteredUsers.length === 0 && (
              <tr>
                <td colSpan="4" className="p-12 text-center text-slate-400">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-slate-300">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.109A9.342 9.342 0 0012.458 10.22M12 7.757a3.89 3.89 0 100-7.78 3.89 3.89 0 000 7.78zM21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>No hosts or guests match the search filters.</span>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
