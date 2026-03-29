import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { createListing } from '../features/listings/listingSlice';
import { useNavigate } from 'react-router-dom';

export default function CreateListingPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    workspaceType: 'desk',
    capacity: 1,
    pricePerDay: 0,
    amenities: '',
    city: ''
  });

  const onSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      title: formData.title,
      description: formData.description,
      workspaceType: formData.workspaceType,
      capacity: Number(formData.capacity),
      pricePerDay: Number(formData.pricePerDay),
      amenities: formData.amenities.split(',').map((s) => s.trim()).filter(Boolean),
      address: { city: formData.city }
    };

    const result = await dispatch(createListing(payload));
    if (!result.error) navigate('/');
  };

  return (
    <form className="card" onSubmit={onSubmit}>
      <h2>Host your workspace</h2>
      <label>Title</label>
      <input value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} required />
      <label>Description</label>
      <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} required />
      <label>City</label>
      <input value={formData.city} onChange={(e) => setFormData({ ...formData, city: e.target.value })} required />
      <label>Workspace type</label>
      <select value={formData.workspaceType} onChange={(e) => setFormData({ ...formData, workspaceType: e.target.value })}>
        <option value="desk">Desk</option>
        <option value="meeting-room">Meeting Room</option>
        <option value="studio">Studio</option>
        <option value="co-working">Co-working</option>
      </select>
      <label>Capacity</label>
      <input type="number" min="1" value={formData.capacity} onChange={(e) => setFormData({ ...formData, capacity: e.target.value })} required />
      <label>Price per day</label>
      <input type="number" min="0" value={formData.pricePerDay} onChange={(e) => setFormData({ ...formData, pricePerDay: e.target.value })} required />
      <label>Amenities (comma separated)</label>
      <input value={formData.amenities} onChange={(e) => setFormData({ ...formData, amenities: e.target.value })} />
      <button>Create listing</button>
    </form>
  );
}
