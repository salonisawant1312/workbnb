import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { registerUser } from '../features/auth/authSlice';
import { useNavigate } from 'react-router-dom';

export default function RegisterPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((s) => s.auth);

  const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'guest' });

  const onSubmit = async (e) => {
    e.preventDefault();
    const result = await dispatch(registerUser(formData));
    if (!result.error) navigate('/');
  };

  return (
    <section className="mx-auto max-w-md">
      <form className="glass rounded-3xl p-6" onSubmit={onSubmit}>
        <h2 className="text-2xl font-bold">Create account</h2>
        <p className="mt-1 text-sm text-slate-500">Start booking or listing workspaces in minutes.</p>
        {error && <p className="mt-3 rounded-2xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}

        <label className="mt-4 block text-sm text-slate-600">Name
          <input className="input" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
        </label>
        <label className="mt-2 block text-sm text-slate-600">Email
          <input className="input" type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} required />
        </label>
        <label className="mt-2 block text-sm text-slate-600">Password
          <input className="input" type="password" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} required />
        </label>
        <label className="mt-2 block text-sm text-slate-600">Role
          <select className="input" value={formData.role} onChange={(e) => setFormData({ ...formData, role: e.target.value })}>
            <option value="guest">Guest</option>
            <option value="host">Host</option>
          </select>
        </label>

        <button className="btn-primary mt-4" disabled={loading}>{loading ? 'Creating...' : 'Register'}</button>
      </form>
    </section>
  );
}
