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

const availableAmenities = [
  { key: 'WiFi', icon: '📶' },
  { key: 'AC', icon: '❄️' },
  { key: 'Parking', icon: '🅿️' },
  { key: 'Coffee', icon: '☕' }
];

export default function HomePage() {
  const dispatch = useDispatch();
  const { items, loading, error } = useSelector((s) => s.listings);
  const [searchParams, setSearchParams] = useSearchParams();
  
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [filters, setFilters] = useState({
    city: '',
    workspaceType: '',
    checkInDate: '',
    professionals: '',
    minPrice: '',
    maxPrice: '',
    selectedAmenities: []
  });

  useEffect(() => {
    dispatch(fetchListings());
  }, [dispatch]);

  useEffect(() => {
    const amenitiesParam = searchParams.get('amenities');
    setFilters((prev) => ({
      ...prev,
      city: searchParams.get('city') || '',
      workspaceType: searchParams.get('type') || '',
      checkInDate: searchParams.get('date') || '',
      professionals: searchParams.get('professionals') || searchParams.get('guests') || '',
      minPrice: searchParams.get('minPrice') || '',
      maxPrice: searchParams.get('maxPrice') || '',
      selectedAmenities: amenitiesParam ? amenitiesParam.split(',') : []
    }));
  }, [searchParams]);

  const visibleItems = useMemo(() => {
    return items.filter((listing) => {
      // 1. Location matches city or street or neighborhood
      let locationOk = true;
      if (filters.city.trim()) {
        const query = filters.city.toLowerCase();
        const city = (listing.address?.city || '').toLowerCase();
        const street = (listing.address?.street || '').toLowerCase();
        const state = (listing.address?.state || '').toLowerCase();
        locationOk = city.includes(query) || street.includes(query) || state.includes(query);
      }

      // 2. Type matches
      const typeOk = filters.workspaceType ? listing.workspaceType === filters.workspaceType : true;
      
      // 3. Capacity matches
      const guestCount = Number(filters.professionals || 0);
      const guestsOk = guestCount ? Number(listing.capacity || 0) >= guestCount : true;

      // 4. Price range per hour matches
      const price = Number(listing.pricePerHour || 0);
      const minPriceOk = filters.minPrice ? price >= Number(filters.minPrice) : true;
      const maxPriceOk = filters.maxPrice ? price <= Number(filters.maxPrice) : true;

      // 5. Selected amenities matches
      const amenitiesOk = filters.selectedAmenities.every((amenityKey) => {
        return (listing.amenities || []).some(
          (a) => a.toLowerCase() === amenityKey.toLowerCase()
        );
      });

      return locationOk && typeOk && guestsOk && minPriceOk && maxPriceOk && amenitiesOk;
    });
  }, [items, filters]);

  const handleHeroSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (filters.city.trim()) params.set('city', filters.city.trim());
    if (filters.workspaceType) params.set('type', filters.workspaceType);
    if (filters.checkInDate) params.set('date', filters.checkInDate);
    if (filters.professionals) params.set('professionals', filters.professionals);
    if (filters.minPrice) params.set('minPrice', filters.minPrice);
    if (filters.maxPrice) params.set('maxPrice', filters.maxPrice);
    if (filters.selectedAmenities.length > 0) params.set('amenities', filters.selectedAmenities.join(','));
    setSearchParams(params);
  };

  const handleToggleAmenity = (key) => {
    setFilters((prev) => {
      const selected = prev.selectedAmenities.includes(key)
        ? prev.selectedAmenities.filter((a) => a !== key)
        : [...prev.selectedAmenities, key];
      return { ...prev, selectedAmenities: selected };
    });
  };

  const handleClearFilters = () => {
    setFilters((prev) => ({
      ...prev,
      minPrice: '',
      maxPrice: '',
      selectedAmenities: []
    }));
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
              <input className="input" placeholder="City, street or neighborhood" value={filters.city} onChange={(e) => setFilters({ ...filters, city: e.target.value })} />
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

            {/* Advanced Filters Expand Toggle */}
            <div className="md:col-span-2 flex justify-between items-center mt-1">
              <button
                type="button"
                className="text-xs font-bold text-brand-600 hover:text-brand-700 flex items-center gap-1 transition"
                onClick={() => setShowAdvanced(!showAdvanced)}
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className={`w-4 h-4 transition-transform duration-200 ${showAdvanced ? 'rotate-180' : ''}`}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                </svg>
                {showAdvanced ? 'Hide Advanced Filters' : 'Show Advanced Filters'}
              </button>

              {(filters.minPrice || filters.maxPrice || filters.selectedAmenities.length > 0) && (
                <button
                  type="button"
                  onClick={handleClearFilters}
                  className="text-xs font-semibold text-slate-400 hover:text-slate-600 transition"
                >
                  Clear Filters
                </button>
              )}
            </div>

            {/* Expandable Advanced Filters Box */}
            {showAdvanced && (
              <div className="md:col-span-2 border-t border-slate-100 pt-4 mt-2 space-y-4">
                {/* Price Range */}
                <div>
                  <p className="text-xs font-bold uppercase text-slate-400 tracking-wider mb-2">Price per Hour (₹)</p>
                  <div className="flex items-center gap-3">
                    <input
                      type="number"
                      min="0"
                      placeholder="Min Price"
                      className="input py-2 px-3 text-xs w-full"
                      value={filters.minPrice}
                      onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })}
                    />
                    <span className="text-slate-400 text-xs">to</span>
                    <input
                      type="number"
                      min="0"
                      placeholder="Max Price"
                      className="input py-2 px-3 text-xs w-full"
                      value={filters.maxPrice}
                      onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })}
                    />
                  </div>
                </div>

                {/* Amenities */}
                <div>
                  <p className="text-xs font-bold uppercase text-slate-400 tracking-wider mb-2">Amenities</p>
                  <div className="flex flex-wrap gap-2">
                    {availableAmenities.map((amenity) => {
                      const isSelected = filters.selectedAmenities.includes(amenity.key);
                      return (
                        <button
                          key={amenity.key}
                          type="button"
                          onClick={() => handleToggleAmenity(amenity.key)}
                          className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold border transition ${
                            isSelected
                              ? 'bg-brand-500 text-white border-brand-500 shadow-sm'
                              : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                          }`}
                        >
                          <span>{amenity.icon}</span>
                          <span>{amenity.key}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

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
