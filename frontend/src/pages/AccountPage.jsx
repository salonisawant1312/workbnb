import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { logout, updateUserProfile } from '../features/auth/authSlice';

export default function AccountPage() {
  const { user, loading } = useSelector((s) => s.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    bio: '',
    address: { street: '', city: '', state: '', zip: '', country: '' },
    bankDetails: { accountName: '', accountNumber: '', ifscCode: '' }
  });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        phone: user.phone || '',
        bio: user.bio || '',
        address: {
          street: user.address?.street || '',
          city: user.address?.city || '',
          state: user.address?.state || '',
          zip: user.address?.zip || '',
          country: user.address?.country || ''
        },
        bankDetails: {
          accountName: user.bankDetails?.accountName || '',
          accountNumber: user.bankDetails?.accountNumber || '',
          ifscCode: user.bankDetails?.ifscCode || ''
        }
      });
    }
  }, [user]);

  if (!user) return null;

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
  };

  const handleChange = (e, section) => {
    if (section) {
      setFormData({
        ...formData,
        [section]: { ...formData[section], [e.target.name]: e.target.value }
      });
    } else {
      setFormData({ ...formData, [e.target.name]: e.target.value });
    }
  };

  const handleSave = async () => {
    const res = await dispatch(updateUserProfile({ id: user._id, profileData: formData }));
    if (!res.error) {
      setIsEditing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-black uppercase tracking-tight text-slate-800">Account Settings</h1>
        <div className="flex gap-3">
          {isEditing ? (
            <>
              <button onClick={() => setIsEditing(false)} className="btn-ghost" disabled={loading}>Cancel</button>
              <button onClick={handleSave} className="btn-primary" disabled={loading}>
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </>
          ) : (
            <button onClick={() => setIsEditing(true)} className="btn-primary">Edit Profile</button>
          )}
          <button onClick={handleLogout} className="btn-primary bg-red-600 hover:bg-red-700 border-red-600 hover:border-red-700 text-white shadow-md">Logout</button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Profile Card */}
        <div className="glass rounded-2xl border border-white/50 p-6 shadow-float">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-slate-800">Profile Information</h2>
          </div>
          <div className="space-y-4">
            <div>
              <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Name</label>
              {isEditing ? (
                <input name="name" value={formData.name} onChange={(e) => handleChange(e)} className="input mt-1" />
              ) : (
                <p className="mt-1 text-slate-800 font-medium">{user.name}</p>
              )}
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Email Address <span className="text-[10px] lowercase text-slate-400 font-normal">(Cannot be changed)</span></label>
              <p className="mt-1 text-slate-800 font-medium">{user.email}</p>
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Phone</label>
              {isEditing ? (
                <input name="phone" value={formData.phone} onChange={(e) => handleChange(e)} className="input mt-1" />
              ) : (
                <p className="mt-1 text-slate-800 font-medium">{user.phone || 'Not provided'}</p>
              )}
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Role</label>
              <div>
                <span className="mt-1 inline-flex rounded-full bg-brand-50 px-2.5 py-0.5 text-xs font-semibold text-brand-700 uppercase tracking-wide">
                  {user.role}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Address Card */}
        <div className="glass rounded-2xl border border-white/50 p-6 shadow-float">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-slate-800">Address</h2>
          </div>
          <div className="space-y-4">
            <div>
              <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Street Address</label>
              {isEditing ? (
                <input name="street" value={formData.address.street} onChange={(e) => handleChange(e, 'address')} className="input mt-1" />
              ) : (
                <p className="mt-1 text-slate-800 font-medium">{user.address?.street || 'Not provided'}</p>
              )}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">City</label>
                {isEditing ? (
                  <input name="city" value={formData.address.city} onChange={(e) => handleChange(e, 'address')} className="input mt-1" />
                ) : (
                  <p className="mt-1 text-slate-800 font-medium">{user.address?.city || 'Not provided'}</p>
                )}
              </div>
              <div>
                <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">State</label>
                {isEditing ? (
                  <input name="state" value={formData.address.state} onChange={(e) => handleChange(e, 'address')} className="input mt-1" />
                ) : (
                  <p className="mt-1 text-slate-800 font-medium">{user.address?.state || 'Not provided'}</p>
                )}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Zip Code</label>
                {isEditing ? (
                  <input name="zip" value={formData.address.zip} onChange={(e) => handleChange(e, 'address')} className="input mt-1" />
                ) : (
                  <p className="mt-1 text-slate-800 font-medium">{user.address?.zip || 'Not provided'}</p>
                )}
              </div>
              <div>
                <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Country</label>
                {isEditing ? (
                  <input name="country" value={formData.address.country} onChange={(e) => handleChange(e, 'address')} className="input mt-1" />
                ) : (
                  <p className="mt-1 text-slate-800 font-medium">{user.address?.country || 'Not provided'}</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Billing Card */}
        <div className="glass rounded-2xl border border-white/50 p-6 shadow-float md:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-slate-800">Billing & Account Details</h2>
          </div>
          
          <div className="grid gap-6 md:grid-cols-2">
             <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-5">
               <h3 className="mb-4 text-sm font-bold text-slate-700">Bank Details</h3>
               <div className="space-y-4">
                 <div>
                    <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Account Name</label>
                    {isEditing ? (
                      <input name="accountName" value={formData.bankDetails.accountName} onChange={(e) => handleChange(e, 'bankDetails')} className="input mt-1" />
                    ) : (
                      <p className="mt-1 text-slate-800 font-medium">{user.bankDetails?.accountName || 'Not provided'}</p>
                    )}
                 </div>
                 <div>
                    <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Account Number</label>
                    {isEditing ? (
                      <input name="accountNumber" value={formData.bankDetails.accountNumber} onChange={(e) => handleChange(e, 'bankDetails')} className="input mt-1" />
                    ) : (
                      <p className="mt-1 text-slate-800 font-medium">{user.bankDetails?.accountNumber ? `••••${user.bankDetails.accountNumber.slice(-4)}` : 'Not provided'}</p>
                    )}
                 </div>
                 <div>
                    <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">IFSC Code</label>
                    {isEditing ? (
                      <input name="ifscCode" value={formData.bankDetails.ifscCode} onChange={(e) => handleChange(e, 'bankDetails')} className="input mt-1" />
                    ) : (
                      <p className="mt-1 text-slate-800 font-medium">{user.bankDetails?.ifscCode || 'Not provided'}</p>
                    )}
                 </div>
               </div>
             </div>

             <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-5">
               <h3 className="mb-4 text-sm font-bold text-slate-700">Payment Gateway Integration</h3>
               <div className="space-y-4">
                 <div>
                    <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Razorpay Status</label>
                    <div className="mt-2">
                      {user.isRazorpayLinked ? (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-600/20">
                           <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
                           Linked & Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600 ring-1 ring-slate-400/20">
                           <span className="h-1.5 w-1.5 rounded-full bg-slate-400"></span>
                           Not Linked
                        </span>
                      )}
                    </div>
                 </div>
                 <div>
                    <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Account ID</label>
                    <p className="mt-1 text-slate-800 font-medium">{user.razorpayAccountId || 'N/A'}</p>
                 </div>
               </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
