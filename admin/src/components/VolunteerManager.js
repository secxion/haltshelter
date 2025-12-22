import React, { useState, useEffect, useCallback } from 'react';
import {
  UserIcon,
  PhoneIcon,
  CalendarIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  EyeIcon,
  TrashIcon,
  MagnifyingGlassIcon,
  DocumentTextIcon,
  HeartIcon,
  AcademicCapIcon
} from '@heroicons/react/24/outline';
import { API_BASE_URL } from '../config';

export default function VolunteerManager() {
  const [volunteers, setVolunteers] = useState([]);
  const [filteredVolunteers, setFilteredVolunteers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedVolunteer, setSelectedVolunteer] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');

  const statusOptions = [
    { value: 'all', label: 'All Applications', color: 'text-gray-600' },
    { value: 'pending', label: 'Pending Review', color: 'text-yellow-600' },
    { value: 'approved', label: 'Approved', color: 'text-green-600' },
    { value: 'rejected', label: 'Rejected', color: 'text-red-600' },
    { value: 'contacted', label: 'Contacted', color: 'text-blue-600' }
  ];

  const sortOptions = [
    { value: 'newest', label: 'Newest First' },
    { value: 'oldest', label: 'Oldest First' },
    { value: 'name', label: 'Name A-Z' },
    { value: 'experience', label: 'Most Experience' }
  ];

  const filterAndSortVolunteers = useCallback(() => {
    if (!volunteers || volunteers.length === 0) {
      setFilteredVolunteers([]);
      return;
    }
    
    let filtered = [...volunteers];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(volunteer => {
        const fullName = volunteer.personalInfo?.fullName || 
                        `${volunteer.personalInfo?.firstName || ''} ${volunteer.personalInfo?.lastName || ''}`.trim();
        return fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
               volunteer.personalInfo?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
               volunteer.personalInfo?.phone?.includes(searchTerm);
      });
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(volunteer => 
        volunteer.applicationStatus === statusFilter || volunteer.status === statusFilter
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.createdAt) - new Date(a.createdAt);
        case 'oldest':
          return new Date(a.createdAt) - new Date(b.createdAt);
        case 'name':
          const nameA = a.personalInfo?.fullName || 
                       `${a.personalInfo?.firstName || ''} ${a.personalInfo?.lastName || ''}`.trim();
          const nameB = b.personalInfo?.fullName || 
                       `${b.personalInfo?.firstName || ''} ${b.personalInfo?.lastName || ''}`.trim();
          return nameA.localeCompare(nameB);
        case 'experience':
          return (b.experience?.yearsExperience || 0) - (a.experience?.yearsExperience || 0);
        default:
          return 0;
      }
    });

    setFilteredVolunteers(filtered);
  }, [volunteers, searchTerm, statusFilter, sortBy]);

  useEffect(() => {
    fetchVolunteers();
  }, []);

  useEffect(() => {
    filterAndSortVolunteers();
  }, [filterAndSortVolunteers]);

  const fetchVolunteers = async () => {
    try {
      setLoading(true);
      const adminToken = localStorage.getItem('adminToken');
      
      const response = await fetch(`${API_BASE_URL}/volunteers/applications`, {
        headers: {
          'Authorization': `Bearer ${adminToken}`
        }
      });

      const data = await response.json();
      
      if (data.success) {
        setVolunteers(data.applications || []);
      } else {
        console.error('Error fetching volunteers:', data.error);
        alert(`Error: ${data.error}`);
      }
    } catch (error) {
      console.error('Error fetching volunteers:', error);
      alert('Error fetching volunteer applications');
    } finally {
      setLoading(false);
    }
  };

  const updateVolunteerStatus = async (volunteerId, newStatus) => {
    try {
      const adminToken = localStorage.getItem('adminToken');
      
      const response = await fetch(`${API_BASE_URL}/volunteers/applications/${volunteerId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminToken}`
        },
        body: JSON.stringify({ status: newStatus })
      });

      const data = await response.json();
      
      if (data.success) {
        // Update local state with both status and applicationStatus for compatibility
        setVolunteers(volunteers.map(volunteer => 
          volunteer._id === volunteerId 
            ? { ...volunteer, status: newStatus, applicationStatus: newStatus }
            : volunteer
        ));
        
        // Update selected volunteer if it's the one being updated
        if (selectedVolunteer && selectedVolunteer._id === volunteerId) {
          setSelectedVolunteer({ ...selectedVolunteer, status: newStatus, applicationStatus: newStatus });
        }
        
        alert(`Volunteer status updated to ${newStatus}`);
      } else {
        console.error('Error updating volunteer:', data.error);
        alert(`Error: ${data.error}`);
      }
    } catch (error) {
      console.error('Error updating volunteer:', error);
      alert('Error updating volunteer status');
    }
  };

  const deleteVolunteer = async (volunteerId) => {
    const confirmed = window.confirm('Are you sure you want to delete this volunteer application?');
    if (!confirmed) {
      return;
    }

    try {
      const adminToken = localStorage.getItem('adminToken');
      
      const response = await fetch(`${API_BASE_URL}/volunteers/applications/${volunteerId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${adminToken}`
        }
      });

      const data = await response.json();
      
      if (data.success) {
        setVolunteers(volunteers.filter(volunteer => volunteer._id !== volunteerId));
        setShowDetailModal(false);
        alert('Volunteer application deleted successfully');
      } else {
        console.error('Error deleting volunteer:', data.error);
        alert(`Error: ${data.error}`);
      }
    } catch (error) {
      console.error('Error deleting volunteer:', error);
      alert('Error deleting volunteer application');
    }
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

  const getStatusIcon = (status) => {
    switch (status) {
      case 'approved':
        return <CheckCircleIcon className="w-5 h-5 text-green-500" />;
      case 'rejected':
        return <XCircleIcon className="w-5 h-5 text-red-500" />;
      case 'contacted':
        return <PhoneIcon className="w-5 h-5 text-blue-500" />;
      default:
        return <ClockIcon className="w-5 h-5 text-yellow-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'contacted':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  const VolunteerDetailModal = () => {
    if (!selectedVolunteer) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-xl p-6 max-w-4xl w-full mx-4 max-h-screen overflow-y-auto">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Volunteer Application Details</h2>
            <button
              onClick={() => setShowDetailModal(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <XCircleIcon className="w-6 h-6" />
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Personal Information */}
            <div className="space-y-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                  <UserIcon className="w-5 h-5 mr-2" />
                  Personal Information
                </h3>
                <div className="space-y-2">
                  <div>
                    <span className="font-medium text-gray-700">Name:</span>
                    <span className="ml-2 text-gray-900">
                      {selectedVolunteer.personalInfo?.fullName || 
                       `${selectedVolunteer.personalInfo?.firstName || ''} ${selectedVolunteer.personalInfo?.lastName || ''}`.trim() || 'N/A'}
                    </span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Email:</span>
                    <span className="ml-2 text-gray-900">{selectedVolunteer.personalInfo.email}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Phone:</span>
                    <span className="ml-2 text-gray-900">{selectedVolunteer.personalInfo.phone}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Age:</span>
                    <span className="ml-2 text-gray-900">{selectedVolunteer.personalInfo.age}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Address:</span>
                    <span className="ml-2 text-gray-900">
                      {selectedVolunteer.personalInfo?.address ? 
                        `${selectedVolunteer.personalInfo.address.street || ''}, ${selectedVolunteer.personalInfo.address.city || ''}, ${selectedVolunteer.personalInfo.address.state || ''} ${selectedVolunteer.personalInfo.address.zipCode || ''}`.replace(/,\s*,/g, ',').trim() 
                        : 'Not provided'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Availability */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                  <CalendarIcon className="w-5 h-5 mr-2" />
                  Availability
                </h3>
                <div className="space-y-2">
                  <div>
                    <span className="font-medium text-gray-700">Days:</span>
                    <span className="ml-2 text-gray-900">{(selectedVolunteer.availability?.days || []).join(', ') || 'Not specified'}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Times:</span>
                    <span className="ml-2 text-gray-900">{(selectedVolunteer.availability?.times || []).join(', ') || 'Not specified'}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Hours per week:</span>
                    <span className="ml-2 text-gray-900">{selectedVolunteer.availability?.hoursPerWeek || 'Not specified'}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Experience and Interests */}
            <div className="space-y-4">
              {/* Experience */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                  <AcademicCapIcon className="w-5 h-5 mr-2" />
                  Experience
                </h3>
                <div className="space-y-2">
                  <div>
                    <span className="font-medium text-gray-700">Years of experience:</span>
                    <span className="ml-2 text-gray-900">{selectedVolunteer.experience?.yearsExperience || 'Not specified'}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Previous experience:</span>
                    <p className="mt-1 text-gray-900">{selectedVolunteer.experience?.previousExperience || 'None specified'}</p>
                  </div>
                </div>
              </div>

              {/* Interests */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                  <HeartIcon className="w-5 h-5 mr-2" />
                  Volunteer Interests
                </h3>
                <div className="flex flex-wrap gap-2">
                  {(selectedVolunteer.interests || []).map((interest, index) => (
                    <span
                      key={index}
                      className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm font-medium"
                    >
                      {interest}
                    </span>
                  ))}
                </div>
              </div>

              {/* Background Questions */}
              {selectedVolunteer.backgroundQuestions && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                    <DocumentTextIcon className="w-5 h-5 mr-2" />
                    Background Information
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <span className="font-medium text-gray-700">Owns pets:</span>
                      <span className="ml-2 text-gray-900">{selectedVolunteer.backgroundQuestions.ownsPets ? 'Yes' : 'No'}</span>
                    </div>
                    {selectedVolunteer.backgroundQuestions.petDetails && (
                      <div>
                        <span className="font-medium text-gray-700">Pet details:</span>
                        <p className="mt-1 text-gray-900">{selectedVolunteer.backgroundQuestions.petDetails}</p>
                      </div>
                    )}
                    <div>
                      <span className="font-medium text-gray-700">Criminal background:</span>
                      <span className="ml-2 text-gray-900">{selectedVolunteer.backgroundQuestions.criminalBackground ? 'Yes' : 'No'}</span>
                    </div>
                    {selectedVolunteer.backgroundQuestions.criminalDetails && (
                      <div>
                        <span className="font-medium text-gray-700">Criminal background details:</span>
                        <p className="mt-1 text-gray-900">{selectedVolunteer.backgroundQuestions.criminalDetails}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Motivation */}
          {selectedVolunteer.motivation && (
            <div className="mt-6 bg-gray-50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Motivation</h3>
              <p className="text-gray-900">{selectedVolunteer.motivation}</p>
            </div>
          )}

          {/* Actions */}
          <div className="mt-6 flex flex-wrap gap-3">
            <button
              onClick={() => updateVolunteerStatus(selectedVolunteer._id, 'approved')}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center"
            >
              <CheckCircleIcon className="w-4 h-4 mr-2" />
              Approve
            </button>
            <button
              onClick={() => updateVolunteerStatus(selectedVolunteer._id, 'rejected')}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center"
            >
              <XCircleIcon className="w-4 h-4 mr-2" />
              Reject
            </button>
            <button
              onClick={() => updateVolunteerStatus(selectedVolunteer._id, 'contacted')}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
            >
              <PhoneIcon className="w-4 h-4 mr-2" />
              Mark as Contacted
            </button>
            <button
              onClick={() => deleteVolunteer(selectedVolunteer._id)}
              className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors flex items-center"
            >
              <TrashIcon className="w-4 h-4 mr-2" />
              Delete
            </button>
          </div>

          {/* Application Details */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="flex items-center justify-between text-sm text-gray-500">
              <span>Applied: {formatDate(selectedVolunteer.createdAt)}</span>
              <span>Status: 
                <span className={`ml-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedVolunteer.applicationStatus || selectedVolunteer.status || 'pending')}`}>
                  {selectedVolunteer.applicationStatus || selectedVolunteer.status || 'pending'}
                </span>
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  };


  // CSV Export Functionality
  const exportVolunteersAsCSV = () => {
    if (!volunteers || volunteers.length === 0) {
      alert('No volunteers to export.');
      return;
    }
    const fields = [
      'fullName','firstName','lastName','email','phone','age','address','status','applicationStatus','createdAt','yearsExperience','previousExperience','interests','availabilityDays','availabilityTimes','hoursPerWeek','motivation','ownsPets','petDetails','criminalBackground','criminalDetails'
    ];
    const csvRows = [];
    csvRows.push(fields.join(','));
    volunteers.forEach(v => {
      const row = fields.map(field => {
        if (field === 'fullName') return '"' + (v.personalInfo?.fullName || '') + '"';
        if (field === 'firstName') return '"' + (v.personalInfo?.firstName || '') + '"';
        if (field === 'lastName') return '"' + (v.personalInfo?.lastName || '') + '"';
        if (field === 'email') return '"' + (v.personalInfo?.email || '') + '"';
        if (field === 'phone') return '"' + (v.personalInfo?.phone || '') + '"';
        if (field === 'age') return '"' + (v.personalInfo?.age || '') + '"';
        if (field === 'address') {
          const addr = v.personalInfo?.address;
          return '"' + (addr ? `${addr.street || ''}, ${addr.city || ''}, ${addr.state || ''} ${addr.zipCode || ''}`.replace(/,\s*,/g, ',').trim() : '') + '"';
        }
        if (field === 'status') return '"' + (v.status || '') + '"';
        if (field === 'applicationStatus') return '"' + (v.applicationStatus || '') + '"';
        if (field === 'createdAt') return '"' + (v.createdAt || '') + '"';
        if (field === 'yearsExperience') return '"' + (v.experience?.yearsExperience || '') + '"';
        if (field === 'previousExperience') return '"' + (v.experience?.previousExperience || '') + '"';
        if (field === 'interests') return '"' + (v.interests ? v.interests.join(';') : '') + '"';
        if (field === 'availabilityDays') return '"' + (v.availability?.days ? v.availability.days.join(';') : '') + '"';
        if (field === 'availabilityTimes') return '"' + (v.availability?.times ? v.availability.times.join(';') : '') + '"';
        if (field === 'hoursPerWeek') return '"' + (v.availability?.hoursPerWeek || '') + '"';
        if (field === 'motivation') return '"' + (v.motivation || '') + '"';
        if (field === 'ownsPets') return v.backgroundQuestions?.ownsPets ? 'TRUE' : 'FALSE';
        if (field === 'petDetails') return '"' + (v.backgroundQuestions?.petDetails || '') + '"';
        if (field === 'criminalBackground') return v.backgroundQuestions?.criminalBackground ? 'TRUE' : 'FALSE';
        if (field === 'criminalDetails') return '"' + (v.backgroundQuestions?.criminalDetails || '') + '"';
        return '';
      });
      csvRows.push(row.join(','));
    });
    const csvContent = csvRows.join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `volunteers_export_${new Date().toISOString().slice(0,10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // CSV Import Functionality
  const importVolunteersFromCSV = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const text = await file.text();
    const lines = text.split(/\r?\n/).filter(Boolean);
    if (lines.length < 2) {
      alert('CSV must have a header and at least one data row.');
      return;
    }
    const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
    const newVolunteers = lines.slice(1).map(line => {
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
        if (h === 'interests' || h === 'availabilityDays' || h === 'availabilityTimes') {
          obj[h] = v ? v.split(';').map(s => s.trim()) : [];
        } else if (h === 'ownsPets' || h === 'criminalBackground') {
          obj[h] = v.toLowerCase() === 'true';
        } else if (h === 'yearsExperience' || h === 'hoursPerWeek') {
          obj[h] = v ? Number(v) : '';
        } else {
          obj[h] = v.replace(/^"|"$/g, '');
        }
      });
      // Map flat CSV fields to nested structure expected by backend
      return {
        personalInfo: {
          fullName: obj.fullName,
          firstName: obj.firstName,
          lastName: obj.lastName,
          email: obj.email,
          phone: obj.phone,
          age: obj.age,
          address: obj.address
        },
        status: obj.status,
        applicationStatus: obj.applicationStatus,
        createdAt: obj.createdAt,
        experience: {
          yearsExperience: obj.yearsExperience,
          previousExperience: obj.previousExperience
        },
        interests: obj.interests,
        availability: {
          days: obj.availabilityDays,
          times: obj.availabilityTimes,
          hoursPerWeek: obj.hoursPerWeek
        },
        motivation: obj.motivation,
        backgroundQuestions: {
          ownsPets: obj.ownsPets,
          petDetails: obj.petDetails,
          criminalBackground: obj.criminalBackground,
          criminalDetails: obj.criminalDetails
        }
      };
    });
    // Send each volunteer to backend
    let success = 0, fail = 0;
    const adminToken = localStorage.getItem('adminToken');
    for (const volunteer of newVolunteers) {
      try {
        const res = await fetch(`${API_BASE_URL}/volunteers/applications`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${adminToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(volunteer)
        });
        if (res.ok) success++; else fail++;
      } catch {
        fail++;
      }
    }
    fetchVolunteers();
    alert(`Import complete. Success: ${success}, Failed: ${fail}`);
    e.target.value = '';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Volunteer Applications</h1>
          <p className="text-gray-600">Manage and review volunteer applications</p>
        </div>
        <div className="flex gap-2 items-center">
          <button
            onClick={exportVolunteersAsCSV}
            className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
          >
            Export Volunteers
          </button>
          <label className="bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded cursor-pointer flex items-center">
            Import Volunteers
            <input
              type="file"
              accept=".csv"
              style={{ display: 'none' }}
              onChange={importVolunteersFromCSV}
            />
          </label>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="relative">
            <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              placeholder="Search volunteers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {statusOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          {/* Sort */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {sortOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          {/* Results Count */}
          <div className="flex items-center text-sm text-gray-600">
            Showing {filteredVolunteers?.length || 0} of {volunteers?.length || 0} applications
          </div>
        </div>
      </div>

      {/* Volunteer List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        ) : filteredVolunteers.length === 0 ? (
          <div className="text-center py-16">
            <UserIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No volunteer applications found</h3>
            <p className="text-gray-500">
              {volunteers.length === 0 ? 'No applications have been submitted yet.' : 'Try adjusting your search or filters.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Volunteer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Interests
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Availability
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Applied
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredVolunteers.map((volunteer) => (
                  <tr key={volunteer._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                            <UserIcon className="h-6 w-6 text-blue-600" />
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {volunteer.personalInfo?.fullName || 
                             `${volunteer.personalInfo?.firstName || ''} ${volunteer.personalInfo?.lastName || ''}`.trim() || 'N/A'}
                          </div>
                          <div className="text-sm text-gray-500">
                            Age: {volunteer.personalInfo?.age || 'N/A'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{volunteer.personalInfo?.email || 'N/A'}</div>
                      <div className="text-sm text-gray-500">{volunteer.personalInfo?.phone || 'N/A'}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {(volunteer.interests || []).slice(0, 2).map((interest, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800"
                          >
                            {interest}
                          </span>
                        ))}
                        {(volunteer.interests || []).length > 2 && (
                          <span className="text-xs text-gray-500">
                            +{(volunteer.interests || []).length - 2} more
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {volunteer.availability?.hoursPerWeek || 0}h/week
                      </div>
                      <div className="text-sm text-gray-500">
                        {(volunteer.availability?.days || []).slice(0, 2).join(', ')}
                        {(volunteer.availability?.days || []).length > 2 && ` +${(volunteer.availability?.days || []).length - 2}`}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {getStatusIcon(volunteer.applicationStatus || volunteer.status || 'pending')}
                        <span className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(volunteer.applicationStatus || volunteer.status || 'pending')}`}>
                          {volunteer.applicationStatus || volunteer.status || 'pending'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(volunteer.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => {
                          setSelectedVolunteer(volunteer);
                          setShowDetailModal(true);
                        }}
                        className="text-blue-600 hover:text-blue-900 mr-3"
                      >
                        <EyeIcon className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => deleteVolunteer(volunteer._id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {showDetailModal && <VolunteerDetailModal />}
    </div>
  );
}
