import React, { useState, useEffect } from 'react';
import { API_BASE_URL, SERVER_BASE_URL } from '../config';

const AdoptionInquiryManager = () => {
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedInquiry, setSelectedInquiry] = useState(null);
  const [filters, setFilters] = useState({
    status: 'All',
    page: 1
  });
  const [pagination, setPagination] = useState({
    current: 1,
    total: 1,
    count: 0,
    totalItems: 0
  });
  const [showDetailModal, setShowDetailModal] = useState(false);

  const statusOptions = ['All', 'Pending', 'Under Review', 'Approved', 'Rejected', 'Completed'];
  const statusColors = {
    'Pending': 'bg-yellow-100 text-yellow-800',
    'Under Review': 'bg-blue-100 text-blue-800', 
    'Approved': 'bg-green-100 text-green-800',
    'Rejected': 'bg-red-100 text-red-800',
    'Completed': 'bg-purple-100 text-purple-800'
  };

  const fetchInquiries = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams({
        status: filters.status,
        page: filters.page,
        limit: 20
      });

      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${API_BASE_URL}/admin/adoption-inquiries?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch adoption inquiries');
      }

      const data = await response.json();
      setInquiries(data.inquiries);
      setPagination(data.pagination);
      setError('');
    } catch (err) {
      console.error('Error fetching inquiries:', err);
      setError('Failed to load adoption inquiries');
    } finally {
      setLoading(false);
    }
  };

  const updateInquiryStatus = async (inquiryId, newStatus, adminNotes = '') => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${API_BASE_URL}/admin/adoption-inquiries/${inquiryId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          status: newStatus,
          adminNotes: adminNotes
        })
      });

      if (!response.ok) {
        throw new Error('Failed to update inquiry status');
      }

      // Refresh the inquiries list
      fetchInquiries();
      
      // Update selected inquiry if it's open
      if (selectedInquiry && selectedInquiry._id === inquiryId) {
        const updatedResponse = await response.json();
        setSelectedInquiry(updatedResponse.inquiry);
      }

    } catch (err) {
      console.error('Error updating inquiry:', err);
      setError('Failed to update inquiry status');
    }
  };

  const viewInquiryDetails = async (inquiryId) => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${API_BASE_URL}/admin/adoption-inquiries/${inquiryId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch inquiry details');
      }

      const inquiry = await response.json();
      setSelectedInquiry(inquiry);
      setShowDetailModal(true);
    } catch (err) {
      console.error('Error fetching inquiry details:', err);
      setError('Failed to load inquiry details');
    }
  };

  useEffect(() => {
    fetchInquiries();
  }, [filters]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleStatusFilter = (status) => {
    setFilters(prev => ({ ...prev, status, page: 1 }));
  };

  const handlePageChange = (page) => {
    setFilters(prev => ({ ...prev, page }));
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const InquiryDetailModal = () => {
    const [statusUpdate, setStatusUpdate] = useState({
      status: selectedInquiry?.status || 'Pending',
      notes: ''
    });

    if (!selectedInquiry) return null;

    const handleStatusUpdate = () => {
      updateInquiryStatus(selectedInquiry._id, statusUpdate.status, statusUpdate.notes);
      setShowDetailModal(false);
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6 border-b">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Adoption Inquiry Details</h2>
                <p className="text-gray-600 mt-1">
                  Submitted {formatDate(selectedInquiry.createdAt)}
                </p>
              </div>
              <button
                onClick={() => setShowDetailModal(false)}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ×
              </button>
            </div>
          </div>

          <div className="p-6 space-y-6">
            {/* Animal Information */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-lg mb-2">Animal Information</h3>
              <div className="flex items-start space-x-4">
                {selectedInquiry.animal?.images?.[0] && (
                  <img
                    src={selectedInquiry.animal.images[0].url || `${SERVER_BASE_URL}/uploads/images/${selectedInquiry.animal.images[0]}`}
                    alt={selectedInquiry.animal.images[0].altText || selectedInquiry.animal.name}
                    className="w-20 h-20 object-cover rounded-lg"
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/80x80/f3f4f6/6b7280?text=Pet';
                    }}
                  />
                )}
                <div>
                  <p className="font-medium text-lg">{selectedInquiry.animal?.name}</p>
                  <p className="text-gray-600">{selectedInquiry.animal?.species} • {selectedInquiry.animal?.breed}</p>
                  <p className="text-sm text-gray-500">Status: {selectedInquiry.animal?.status}</p>
                </div>
              </div>
            </div>

            {/* Applicant Information */}
            <div>
              <h3 className="font-semibold text-lg mb-3">Applicant Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-600">Name</label>
                  <p className="text-gray-900">{selectedInquiry.applicantName}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600">Email</label>
                  <p className="text-gray-900">{selectedInquiry.applicantEmail}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600">Phone</label>
                  <p className="text-gray-900">{selectedInquiry.applicantPhone}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600">Address</label>
                  <p className="text-gray-900">{selectedInquiry.applicantAddress}</p>
                </div>
              </div>
            </div>

            {/* Experience & Message */}
            <div>
              <h3 className="font-semibold text-lg mb-3">Experience & Message</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-600">Pet Experience</label>
                  <p className="text-gray-900 bg-gray-50 p-3 rounded">{selectedInquiry.petExperience}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600">Message</label>
                  <p className="text-gray-900 bg-gray-50 p-3 rounded">{selectedInquiry.message}</p>
                </div>
              </div>
            </div>

            {/* Current Status & History */}
            <div>
              <h3 className="font-semibold text-lg mb-3">Status Information</h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-600">Current Status</label>
                  <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${statusColors[selectedInquiry.status]}`}>
                    {selectedInquiry.status}
                  </span>
                </div>
                
                {selectedInquiry.adminNotes && (
                  <div>
                    <label className="block text-sm font-medium text-gray-600">Admin Notes</label>
                    <p className="text-gray-900 bg-gray-50 p-3 rounded">{selectedInquiry.adminNotes}</p>
                  </div>
                )}

                {selectedInquiry.statusHistory && selectedInquiry.statusHistory.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-600">Status History</label>
                    <div className="bg-gray-50 p-3 rounded space-y-2">
                      {selectedInquiry.statusHistory.map((history, index) => (
                        <div key={index} className="text-sm">
                          <span className="font-medium">{history.status}</span> 
                          <span className="text-gray-600"> by {history.changedBy}</span>
                          <span className="text-gray-500"> on {formatDate(history.timestamp)}</span>
                          {history.notes && <p className="text-gray-700 ml-2">"{history.notes}"</p>}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Update Status */}
            <div className="border-t pt-4">
              <h3 className="font-semibold text-lg mb-3">Update Status</h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">New Status</label>
                  <select
                    value={statusUpdate.status}
                    onChange={(e) => setStatusUpdate(prev => ({ ...prev, status: e.target.value }))}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    {statusOptions.filter(s => s !== 'All').map(status => (
                      <option key={status} value={status}>{status}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Admin Notes</label>
                  <textarea
                    value={statusUpdate.notes}
                    onChange={(e) => setStatusUpdate(prev => ({ ...prev, notes: e.target.value }))}
                    placeholder="Add notes about this status change..."
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    rows="3"
                  />
                </div>
                <button
                  onClick={handleStatusUpdate}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                >
                  Update Status
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="p-6">

      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Adoption Inquiries</h1>
          <p className="text-gray-600 mt-1">
            Manage adoption inquiries from potential adopters
          </p>
        </div>
        <div className="flex gap-2 items-center">
          <span className="text-sm text-gray-500">{pagination.totalItems} total inquiries</span>
          <button
            onClick={() => {
              if (!inquiries || inquiries.length === 0) {
                alert('No inquiries to export.');
                return;
              }
              // Define fields to export
              const fields = [
                'applicantName','applicantEmail','applicantPhone','applicantAddress','petExperience','message','status','adminNotes','createdAt','animalName','animalId','animalSpecies','animalBreed'
              ];
              const csvRows = [];
              csvRows.push(fields.join(','));
              inquiries.forEach(inq => {
                const row = fields.map(field => {
                  if (field === 'animalName') return '"' + (inq.animal?.name || '') + '"';
                  if (field === 'animalId') return '"' + (inq.animal?._id || '') + '"';
                  if (field === 'animalSpecies') return '"' + (inq.animal?.species || '') + '"';
                  if (field === 'animalBreed') return '"' + (inq.animal?.breed || '') + '"';
                  let val = inq[field];
                  if (val === undefined || val === null) return '';
                  return '"' + String(val).replace(/"/g, '""') + '"';
                });
                csvRows.push(row.join(','));
              });
              const csvContent = csvRows.join('\r\n');
              const blob = new Blob([csvContent], { type: 'text/csv' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `adoption_inquiries_export_${new Date().toISOString().slice(0,10)}.csv`;
              document.body.appendChild(a);
              a.click();
              document.body.removeChild(a);
              URL.revokeObjectURL(url);
            }}
            className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
          >
            Export Inquiries
          </button>
          <label className="bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded cursor-pointer flex items-center">
            Import Inquiries
            <input
              type="file"
              accept=".csv"
              style={{ display: 'none' }}
              onChange={async (e) => {
                const file = e.target.files[0];
                if (!file) return;
                const text = await file.text();
                const lines = text.split(/\r?\n/).filter(Boolean);
                if (lines.length < 2) {
                  alert('CSV must have a header and at least one data row.');
                  return;
                }
                const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
                const newInquiries = lines.slice(1).map(line => {
                  // Split CSV line, handling quoted commas
                  const values = [];
                  let val = '', inQuotes = false;
                  for (let i = 0; i < line.length; i++) {
                    const char = line[i];
                    if (char === '"') {
                      if (inQuotes && line[i+1] === '"') { val += '"'; i++; }
                      else inQuotes = !inQuotes;
                    } else if (char === ',' && !inQuotes) {
                      values.push(val); val = '';
                    } else {
                      val += char;
                    }
                  }
                  values.push(val);
                  const obj = {};
                  headers.forEach((h, idx) => {
                    let v = values[idx] || '';
                    if (h === 'animalId') {
                      obj['animal'] = v.replace(/^"|"$/g, '');
                    } else {
                      obj[h] = v.replace(/^"|"$/g, '');
                    }
                  });
                  return obj;
                });
                // Send each inquiry to backend
                let success = 0, fail = 0;
                const token = localStorage.getItem('adminToken');
                for (const inquiry of newInquiries) {
                  try {
                    const res = await fetch(`${API_BASE_URL}/admin/adoption-inquiries`, {
                      method: 'POST',
                      headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                      },
                      body: JSON.stringify(inquiry)
                    });
                    if (res.ok) success++; else fail++;
                  } catch {
                    fail++;
                  }
                }
                fetchInquiries();
                alert(`Import complete. Success: ${success}, Failed: ${fail}`);
                e.target.value = '';
              }}
            />
          </label>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* Filters */}
      <div className="mb-6">
        <div className="flex flex-wrap gap-2">
          {statusOptions.map(status => (
            <button
              key={status}
              onClick={() => handleStatusFilter(status)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                filters.status === status
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Inquiries List */}
      {loading ? (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-gray-600">Loading inquiries...</p>
        </div>
      ) : inquiries.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500">No adoption inquiries found for the selected filter.</p>
        </div>
      ) : (
        <div className="bg-white shadow-sm rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Applicant
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Animal
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Submitted
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {inquiries.map((inquiry) => (
                  <tr key={inquiry._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {inquiry.applicantName}
                        </div>
                        <div className="text-sm text-gray-500">
                          {inquiry.applicantEmail}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {inquiry.animal?.images?.[0] && (
                          <img
                            src={inquiry.animal.images[0].url || `${SERVER_BASE_URL}/uploads/images/${inquiry.animal.images[0]}`}
                            alt={inquiry.animal.images[0].altText || inquiry.animal.name}
                            className="w-10 h-10 object-cover rounded-full mr-3"
                            onError={(e) => {
                              e.target.src = 'https://via.placeholder.com/40x40/f3f4f6/6b7280?text=Pet';
                            }}
                          />
                        )}
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {inquiry.animal?.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {inquiry.animal?.species}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${statusColors[inquiry.status]}`}>
                        {inquiry.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(inquiry.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <button
                        onClick={() => viewInquiryDetails(inquiry._id)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        View Details
                      </button>
                      <select
                        value={inquiry.status}
                        onChange={(e) => updateInquiryStatus(inquiry._id, e.target.value)}
                        className="ml-2 text-sm border border-gray-300 rounded px-2 py-1 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        {statusOptions.filter(s => s !== 'All').map(status => (
                          <option key={status} value={status}>{status}</option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination.total > 1 && (
            <div className="bg-white px-4 py-3 border-t border-gray-200 sm:px-6">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  Showing <span className="font-medium">{((pagination.current - 1) * 20) + 1}</span> to{' '}
                  <span className="font-medium">
                    {Math.min(pagination.current * 20, pagination.totalItems)}
                  </span> of{' '}
                  <span className="font-medium">{pagination.totalItems}</span> results
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handlePageChange(pagination.current - 1)}
                    disabled={pagination.current === 1}
                    className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => handlePageChange(pagination.current + 1)}
                    disabled={pagination.current === pagination.total}
                    className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Detail Modal */}
      {showDetailModal && <InquiryDetailModal />}
    </div>
  );
};

export default AdoptionInquiryManager;
