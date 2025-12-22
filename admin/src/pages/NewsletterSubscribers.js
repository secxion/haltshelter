import React, { useEffect, useMemo, useState } from 'react';
import { apiService } from '../services/api';

const statusBadge = (status) => {
  const common = 'px-2 py-1 rounded-full text-xs font-semibold inline-flex items-center gap-1';
  switch (status) {
    case 'confirmed':
      return <span className={`${common} bg-green-100 text-green-800`}>● Confirmed</span>;
    case 'pending':
      return <span className={`${common} bg-yellow-100 text-yellow-800`}>● Pending</span>;
    case 'unsubscribed':
      return <span className={`${common} bg-gray-100 text-gray-700`}>● Unsubscribed</span>;
    case 'bounced':
      return <span className={`${common} bg-red-100 text-red-700`}>● Bounced</span>;
    default:
      return <span className={`${common} bg-slate-100 text-slate-700`}>● {status || 'Unknown'}</span>;
  }
};

const formatDate = (value) => {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleString();
};

const NewsletterSubscribers = () => {
  const [subscribers, setSubscribers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [total, setTotal] = useState(0);
  const [deleting, setDeleting] = useState(null);

  const pages = useMemo(() => (limit ? Math.ceil(total / limit) || 1 : 1), [total, limit]);

  const fetchSubscribers = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await apiService.newsletter.getSubscribers({
        page,
        limit,
        status: status || undefined,
        search: search || undefined,
      });
      setSubscribers(res.data?.subscribers || []);
      setTotal(res.data?.pagination?.total || 0);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load subscribers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscribers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, status]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchSubscribers();
  };

  const handleDelete = async (id, email) => {
    if (!window.confirm(`Are you sure you want to delete subscriber "${email}"?`)) {
      return;
    }
    
    setDeleting(id);
    setError('');
    try {
      console.log('Deleting subscriber:', id);
      const response = await apiService.newsletter.deleteSubscriber(id);
      console.log('Delete response:', response);
      setSubscribers(subscribers.filter(sub => sub._id !== id));
      setTotal(total - 1);
    } catch (err) {
      console.error('Delete error:', err);
      console.error('Error response:', err.response);
      const errorMsg = err.response?.data?.error || err.response?.data?.message || err.message || 'Failed to delete subscriber';
      setError(errorMsg);
    } finally {
      setDeleting(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Newsletter Subscribers</h1>
          <p className="text-sm text-gray-600">View and filter confirmed, pending, and unsubscribed emails.</p>
        </div>
      </div>

      <form onSubmit={handleSearch} className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-white p-4 rounded-lg shadow">
        <input
          type="text"
          placeholder="Search by email or name"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-md border-gray-300 focus:border-primary-500 focus:ring-primary-500"
        />
        <select
          value={status}
          onChange={(e) => {
            setStatus(e.target.value);
            setPage(1);
          }}
          className="w-full rounded-md border-gray-300 focus:border-primary-500 focus:ring-primary-500"
        >
          <option value="">All statuses</option>
          <option value="confirmed">Confirmed</option>
          <option value="pending">Pending</option>
          <option value="unsubscribed">Unsubscribed</option>
          <option value="bounced">Bounced</option>
        </select>
        <div className="flex gap-2">
          <button
            type="submit"
            className="inline-flex items-center justify-center px-4 py-2 rounded-md bg-primary-600 text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
            disabled={loading}
          >
            {loading ? 'Searching...' : 'Search'}
          </button>
          <button
            type="button"
            onClick={() => {
              setSearch('');
              setStatus('');
              setPage(1);
              fetchSubscribers();
            }}
            className="inline-flex items-center justify-center px-4 py-2 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50"
            disabled={loading}
          >
            Reset
          </button>
        </div>
      </form>

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Email</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Subscribed</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Confirmed</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">GDPR</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan="7" className="px-4 py-6 text-center text-gray-500">Loading subscribers...</td>
                </tr>
              ) : subscribers.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-4 py-6 text-center text-gray-500">No subscribers found</td>
                </tr>
              ) : (
                subscribers.map((sub) => (
                  <tr key={sub._id || sub.email}>
                    <td className="px-4 py-3 text-sm text-gray-900">{sub.email}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{sub.firstName || sub.lastName ? `${sub.firstName || ''} ${sub.lastName || ''}`.trim() : '—'}</td>
                    <td className="px-4 py-3 text-sm">{statusBadge(sub.status)}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{formatDate(sub.subscribedAt)}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{formatDate(sub.confirmedAt)}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{sub.gdprConsent ? 'Yes' : 'No'}</td>
                    <td className="px-4 py-3 text-sm">
                      <button
                        onClick={() => handleDelete(sub._id, sub.email)}
                        disabled={deleting === sub._id}
                        className="text-red-600 hover:text-red-800 disabled:opacity-50"
                        title="Delete subscriber"
                      >
                        {deleting === sub._id ? 'Deleting...' : '🗑️ Delete'}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-t border-gray-200">
          <div className="text-sm text-gray-600">
            Page {page} of {pages} • {total} total
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1 || loading}
              className="px-3 py-2 rounded-md border border-gray-300 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              Previous
            </button>
            <button
              type="button"
              onClick={() => setPage((p) => (p < pages ? p + 1 : p))}
              disabled={page >= pages || loading}
              className="px-3 py-2 rounded-md border border-gray-300 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded">
          {error}
        </div>
      )}
    </div>
  );
};

export default NewsletterSubscribers;
