import { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchListings } from '../features/listings/listingSlice';
import { Link, useSearchParams } from 'react-router-dom';

const stockImages = [
  'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1593642532400-2682810df593?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1497215842964-222b430dc094?auto=format&fit=crop&w=1200&q=80'
];

export default function HomePage() {
  const dispatch = useDispatch();
  const { items, loading, error } = useSelector((s) => s.listings);
  const [searchParams, setSearchParams] = useSearchParams();
  const [filters, setFilters] = useState({ city: '', workspaceType: '', checkInDate: '', professionals: '' });

  useEffect(() => {
    dispatch(fetchListings());
  }, [dispatch]);

  useEffect(() => {
    setFilters((prev) => ({
      ...prev,
      city: searchParams.get('city') || '',
      checkInDate: searchParams.get('date') || '',
      professionals: searchParams.get('professionals') || searchParams.get('guests') || ''
    }));
  }, [searchParams]);

  const visibleItems = useMemo(() => {
    return items.filter((listing) => {
      const cityOk = filters.city ? (listing.address?.city || '').toLowerCase().includes(filters.city.toLowerCase()) : true;
      const typeOk = filters.workspaceType ? listing.workspaceType === filters.workspaceType : true;
      const guestCount = Number(filters.professionals || 0);
      const guestsOk = guestCount ? Number(listing.capacity || 0) >= guestCount : true;
      return cityOk && typeOk && guestsOk;
    });
  }, [items, filters]);

  const handleHeroSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (filters.city.trim()) params.set('city', filters.city.trim());
    if (filters.checkInDate) params.set('date', filters.checkInDate);
    if (filters.professionals) params.set('professionals', filters.professionals);
    setSearchParams(params);
  };

  return (
    <section className="space-y-6">
      <div className="glass rounded-3xl p-6 md:p-8">
        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-brand-600">Work better, anywhere</p>
            <h1 className="mt-2 text-3xl font-bold leading-tight md:text-5xl">Book inspiring workspaces for your next focus session.</h1>
            <p className="mt-3 text-slate-600">Private offices, meeting rooms, and co-working spaces across startup-friendly neighborhoods.</p>
          </div>

          <form className="grid grid-cols-1 gap-3 md:grid-cols-2" onSubmit={handleHeroSearch}>
            <label className="text-sm text-slate-600">Location
              <input className="input" placeholder="City or neighborhood" value={filters.city} onChange={(e) => setFilters({ ...filters, city: e.target.value })} />
            </label>
            <label className="text-sm text-slate-600">Date
              <input className="input" type="date" value={filters.checkInDate} onChange={(e) => setFilters({ ...filters, checkInDate: e.target.value })} />
            </label>
            <label className="text-sm text-slate-600">Professionals
              <input className="input" type="number" min="1" placeholder="No. of professionals" value={filters.professionals} onChange={(e) => setFilters({ ...filters, professionals: e.target.value })} />
            </label>
            <label className="text-sm text-slate-600">Workspace Type
              <select className="input" value={filters.workspaceType} onChange={(e) => setFilters({ ...filters, workspaceType: e.target.value })}>
                <option value="">Any type</option>
                <option value="desk">Desk</option>
                <option value="meeting-room">Meeting room</option>
                <option value="studio">Studio</option>
                <option value="co-working">Co-working</option>
              </select>
            </label>
            <button className="btn-primary md:col-span-2">Search workspaces</button>
          </form>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Popular spaces</h2>
      </div>

      {error && <p className="rounded-2xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {loading && Array.from({ length: 6 }).map((_, idx) => (
          <div key={idx} className="animate-pulse rounded-3xl border border-slate-200 bg-white p-3 shadow-soft">
            <div className="h-44 rounded-2xl bg-slate-200" />
            <div className="mt-3 h-4 w-3/4 rounded bg-slate-200" />
            <div className="mt-2 h-3 w-1/2 rounded bg-slate-200" />
          </div>
        ))}

        {!loading && visibleItems.map((listing, idx) => (
          <Link key={listing._id} to={`/listings/${listing._id}`} className="group overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-soft transition hover:-translate-y-1 hover:shadow-float">
            <img src={listing.images?.[0] || stockImages[idx % stockImages.length]} alt={listing.title} className="h-52 w-full object-cover transition duration-300 group-hover:scale-105" />
            <div className="space-y-2 p-4">
              <div className="flex items-center justify-between gap-2">
                <h3 className="line-clamp-1 text-base font-semibold">{listing.title}</h3>
                <p className="text-sm text-amber-500">★ {listing.rating || 4.8}</p>
              </div>
              <p className="text-sm text-slate-500">{listing.address?.city || 'Prime location'} • {listing.workspaceType}</p>
              <p className="text-sm"><span className="font-semibold">₹{listing.pricePerHour || 18}</span> / hour <span className="mx-2 text-slate-300">•</span> <span className="font-semibold">₹{listing.pricePerDay || 95}</span> / day</p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
