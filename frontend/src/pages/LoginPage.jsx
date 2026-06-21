import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { loginUser } from '../features/auth/authSlice';
import { useNavigate } from 'react-router-dom';

export default function LoginPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((s) => s.auth);
  const [formData, setFormData] = useState({ email: '', password: '' });

  const onSubmit = async (e) => {
    e.preventDefault();
    const result = await dispatch(loginUser(formData));
    if (!result.error) navigate('/');
  };

  return (
    <section className="mx-auto max-w-md">
      <form className="glass rounded-3xl p-6" onSubmit={onSubmit}>
        <h2 className="text-2xl font-bold">Welcome back</h2>
        <p className="mt-1 text-sm text-slate-500">Login to manage bookings and host spaces.</p>
        {error && <p className="mt-3 rounded-2xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}

        <label className="mt-4 block text-sm text-slate-600">Email
          <input className="input" type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} required />
        </label>
        <label className="mt-2 block text-sm text-slate-600">Password
          <input className="input" type="password" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} required />
        </label>
        <button className="btn-primary mt-4" disabled={loading}>{loading ? 'Signing in...' : 'Login'}</button>
      </form>
    </section>
  );
}
