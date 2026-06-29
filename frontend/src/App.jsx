import { useEffect, useRef, useState } from 'react';
import { Link, Navigate, NavLink, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { loadMe, logout } from './features/auth/authSlice';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ListingDetailsPage from './pages/ListingDetailsPage';
import HostDashboardPage from './pages/HostDashboardPage';
import BookingHistoryPage from './pages/BookingHistoryPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import ModDashboardPage from './pages/ModDashboardPage';
import AccountPage from './pages/AccountPage';
import PrivacyPage from './pages/PrivacyPage';
import TermsPage from './pages/TermsPage';
import SupportPage from './pages/SupportPage';

const PrivateRoute = ({ children }) => {
  const { token } = useSelector((s) => s.auth);
  return token ? children : <Navigate to="/login" replace />;
};

function Navbar() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, token } = useSelector((s) => s.auth);
  const [topSearch, setTopSearch] = useState({ city: '', date: '', professionals: '' });
  const [openPanel, setOpenPanel] = useState('');
  const panelRef = useRef(null);
  const suggestedPlaces = ['Bangalore', 'Mumbai', 'Pune', 'Hyderabad', 'Delhi', 'Gurgaon'];

  useEffect(() => {
    const onDocClick = (event) => {
      if (panelRef.current && !panelRef.current.contains(event.target)) {
        setOpenPanel('');
      }
    };
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, []);

  const handleTopSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (topSearch.city.trim()) params.set('city', topSearch.city.trim());
    if (topSearch.date) params.set('date', topSearch.date);
    if (topSearch.professionals) params.set('professionals', topSearch.professionals);
    navigate(`/${params.toString() ? `?${params.toString()}` : ''}`);
    setOpenPanel('');
  };

  return (
    <header className="sticky top-0 z-50 border-b border-white/70 bg-slate-50/80 backdrop-blur-xl">
      <div className="mx-auto flex w-[min(1200px,92vw)] items-center justify-between gap-4 py-3">
        <button onClick={() => navigate('/')} className="text-xl font-black tracking-wide">WORKBNB</button>

        <form ref={panelRef} onSubmit={handleTopSearch} className="glass relative hidden items-center gap-2 rounded-full px-3 py-2 lg:flex">
          <button
            type="button"
            onClick={() => setOpenPanel((prev) => (prev === 'anywhere' ? '' : 'anywhere'))}
            className="rounded-full px-2 py-1 text-xs font-medium text-slate-700 hover:bg-white/80"
          >
            {topSearch.city || 'Anywhere'}
          </button>
          <span className="text-xs text-slate-400">|</span>
          <button
            type="button"
            onClick={() => setOpenPanel((prev) => (prev === 'anytime' ? '' : 'anytime'))}
            className="rounded-full px-2 py-1 text-xs font-medium text-slate-700 hover:bg-white/80"
          >
            {topSearch.date || 'Anytime'}
          </button>
          <span className="text-xs text-slate-400">|</span>
          <button
            type="button"
            onClick={() => setOpenPanel((prev) => (prev === 'professionals' ? '' : 'professionals'))}
            className="rounded-full px-2 py-1 text-xs font-medium text-slate-700 hover:bg-white/80"
          >
            {topSearch.professionals ? `${topSearch.professionals} Professionals` : 'Professionals'}
          </button>
          <button type="submit" className="rounded-full bg-brand-500 px-3 py-1 text-xs font-semibold text-white">Search</button>

          {openPanel === 'anywhere' && (
            <div className="absolute left-0 top-14 z-50 w-64 rounded-2xl border border-slate-200 bg-white p-3 shadow-float">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Suggested Places</p>
              <div className="grid grid-cols-2 gap-2">
                {suggestedPlaces.map((place) => (
                  <button
                    key={place}
                    type="button"
                    className="rounded-xl border border-slate-200 px-2 py-2 text-left text-xs font-medium hover:bg-slate-50"
                    onClick={() => {
                      setTopSearch((prev) => ({ ...prev, city: place }));
                      setOpenPanel('');
                    }}
                  >
                    {place}
                  </button>
                ))}
              </div>
            </div>
          )}

          {openPanel === 'anytime' && (
            <div className="absolute left-16 top-14 z-50 w-64 rounded-2xl border border-slate-200 bg-white p-3 shadow-float">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Select Date</p>
              <input
                type="date"
                className="input mt-0"
                value={topSearch.date}
                onChange={(e) => setTopSearch((prev) => ({ ...prev, date: e.target.value }))}
              />
            </div>
          )}

          {openPanel === 'professionals' && (
            <div className="absolute right-16 top-14 z-50 w-56 rounded-2xl border border-slate-200 bg-white p-3 shadow-float">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Professionals</p>
              <input
                type="number"
                min="1"
                className="input mt-0"
                placeholder="How many?"
                value={topSearch.professionals}
                onChange={(e) => setTopSearch((prev) => ({ ...prev, professionals: e.target.value }))}
              />
            </div>
          )}
        </form>

        <nav className="flex items-center gap-2 text-sm">
          <NavLink className={({ isActive }) => isActive ? "btn-ghost text-blue-600 bg-blue-50 font-semibold" : "btn-ghost"} to="/">Explore</NavLink>
          {user?.role === 'admin' && <NavLink className={({ isActive }) => isActive ? "btn-ghost text-blue-600 bg-blue-50 font-semibold" : "btn-ghost"} to="/admin">Admin Dashboard</NavLink>}
          {['moderator', 'regulator'].includes(user?.role) && (
            <NavLink className={({ isActive }) => isActive ? "btn-ghost text-blue-600 bg-blue-50 font-semibold" : "btn-ghost"} to={`/${user.role}`}>
              {user.role === 'regulator' ? 'Regulator Dashboard' : 'Mod Dashboard'}
            </NavLink>
          )}
          {token && !['admin', 'moderator', 'regulator'].includes(user?.role) && (
            <>
              <NavLink className={({ isActive }) => isActive ? "btn-ghost text-blue-600 bg-blue-50 font-semibold" : "btn-ghost"} to="/host">Host Dashboard</NavLink>
              <NavLink className={({ isActive }) => isActive ? "btn-ghost text-blue-600 bg-blue-50 font-semibold" : "btn-ghost"} to="/bookings">Trips</NavLink>
            </>
          )}
          {!token && <NavLink className={({ isActive }) => isActive ? "btn-ghost text-blue-600 bg-blue-50 font-semibold" : "btn-ghost"} to="/bookings">Trips</NavLink>}
          {!token && <NavLink className={({ isActive }) => isActive ? "btn-ghost text-blue-600 bg-blue-50 font-semibold" : "btn-ghost"} to="/login">Login</NavLink>}
          {!token && <Link className="btn-primary" to="/register">Sign up</Link>}
          {token && (
            <NavLink
              to="/account"
              className={({ isActive }) => isActive ? "btn-primary ring-2 ring-blue-500 ring-offset-2" : "btn-primary"}
            >
              {user?.name}
            </NavLink>
          )}
        </nav>
      </div>
    </header>
  );
}

function Footer() {
  return (
    <footer className="mt-auto border-t border-slate-200 bg-white/80">
      <div className="mx-auto flex w-[min(1200px,92vw)] flex-col gap-3 py-6 text-sm text-slate-600 md:flex-row md:items-center md:justify-between">
        <p>© {new Date().getFullYear()} WORKBNB</p>
        <div className="flex gap-4">
          <Link to="/privacy" className="hover:text-brand-600">Privacy</Link>
          <Link to="/terms" className="hover:text-brand-600">Terms</Link>
          <Link to="/support" className="hover:text-brand-600">Support</Link>
        </div>
      </div>
    </footer>
  );
}

export default function App() {
  const dispatch = useDispatch();
  const { token } = useSelector((s) => s.auth);

  useEffect(() => {
    if (token) dispatch(loadMe());
  }, [dispatch, token]);

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="mx-auto w-[min(1200px,92vw)] flex-1 py-6">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/listings/:id" element={<ListingDetailsPage />} />
          <Route path="/host" element={<PrivateRoute><HostDashboardPage /></PrivateRoute>} />
          <Route path="/admin" element={<PrivateRoute><AdminDashboardPage /></PrivateRoute>} />
          <Route path="/moderator" element={<PrivateRoute><ModDashboardPage /></PrivateRoute>} />
          <Route path="/regulator" element={<PrivateRoute><ModDashboardPage /></PrivateRoute>} />
          <Route path="/bookings" element={<PrivateRoute><BookingHistoryPage /></PrivateRoute>} />
          <Route path="/account" element={<PrivateRoute><AccountPage /></PrivateRoute>} />
          <Route path="/privacy" element={<PrivacyPage />} />
          <Route path="/terms" element={<TermsPage />} />
          <Route path="/support" element={<SupportPage />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}
