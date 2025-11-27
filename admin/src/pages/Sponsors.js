import React, { useEffect, useState } from 'react';
import { apiService, handleApiError } from '../services/api';

const Sponsors = () => {
  const [sponsors, setSponsors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: '', website: '', logoFile: null, featured: false });
  const [error, setError] = useState('');

  const fetchSponsors = async () => {
    setLoading(true);
    try {
      const res = await apiService.sponsors.getAll();
      setSponsors(res.data.sponsors || res.data || []);
    } catch (err) {
      console.error('Error fetching sponsors', err);
      setError(handleApiError(err).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSponsors();
  }, []);

  const handleFileChange = (e) => {
    setForm({ ...form, logoFile: e.target.files[0] });
  };

  const uploadLogo = async (file) => {
    const fd = new FormData();
    fd.append('image', file);
    // server expects multipart POST to /api/upload/image
    const resp = await apiService.upload.single(file, 'sponsor');
    // The admin apiService.upload.single previously used a different field name; to be robust,
    // fall back to a direct POST if the helper doesn't work.
    if (resp && resp.data && resp.data.imageUrl) return resp.data.imageUrl;

    // fallback manual upload
    const axios = (await import('axios')).default;
    const base = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
    const r = await axios.post(`${base}/upload/image`, fd, {
      headers: {
        'Content-Type': 'multipart/form-data',
        Authorization: `Bearer ${localStorage.getItem('adminToken')}`
      }
    });
    return r.data.imageUrl;
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setError('');
    try {
      let logoUrl = form.logoUrl || '';
      if (form.logoFile) {
        logoUrl = await uploadLogo(form.logoFile);
      }
      const payload = { name: form.name, website: form.website, logoUrl, featured: form.featured };
      const res = await apiService.sponsors.create(payload);
      setSponsors([res.data.sponsor, ...sponsors]);
      setForm({ name: '', website: '', logoFile: null, featured: false });
    } catch (err) {
      console.error('Create sponsor error', err);
      setError(handleApiError(err).message);
    }
  };

  const handleToggleFeatured = async (sponsor) => {
    try {
      const res = await apiService.sponsors.update(sponsor._id, { featured: !sponsor.featured });
      setSponsors(sponsors.map(s => s._id === sponsor._id ? res.data.sponsor : s));
    } catch (err) {
      console.error('Toggle featured error', err);
      setError(handleApiError(err).message);
    }
  };

  const handleDelete = async (sponsor) => {
    if (!window.confirm('Delete this sponsor?')) return;
    try {
      await apiService.sponsors.delete(sponsor._id);
      setSponsors(sponsors.filter(s => s._id !== sponsor._id));
    } catch (err) {
      console.error('Delete sponsor error', err);
      setError(handleApiError(err).message);
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Sponsors</h2>
      {error && <div className="mb-4 text-red-600">{error}</div>}

      <form onSubmit={handleCreate} className="mb-6 space-y-3">
        <div>
          <label className="block text-sm font-medium">Name</label>
          <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full border rounded p-2" />
        </div>
        <div>
          <label className="block text-sm font-medium">Website</label>
          <input value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })} className="w-full border rounded p-2" />
        </div>
        <div>
          <label className="block text-sm font-medium">Logo</label>
          <input type="file" accept="image/*" onChange={handleFileChange} />
        </div>
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={form.featured} onChange={(e) => setForm({ ...form, featured: e.target.checked })} />
            <span className="text-sm">Featured</span>
          </label>
          <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">Create Sponsor</button>
        </div>
      </form>

      <div>
        {loading ? <div>Loading...</div> : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {sponsors.map((s) => (
              <div key={s._id} className="border rounded p-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {s.logoUrl ? <img src={s.logoUrl} alt={s.name} className="w-20 h-20 object-contain"/> : <div className="w-20 h-20 bg-gray-100 flex items-center justify-center">No Logo</div>}
                  <div>
                    <div className="font-semibold">{s.name}</div>
                    <div className="text-sm text-gray-600">{s.website}</div>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <button onClick={() => handleToggleFeatured(s)} className={`px-3 py-1 rounded ${s.featured ? 'bg-yellow-300' : 'bg-gray-200'}`}>
                    {s.featured ? 'Featured' : 'Feature'}
                  </button>
                  <button onClick={() => handleDelete(s)} className="text-sm text-red-600">Delete</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Sponsors;
