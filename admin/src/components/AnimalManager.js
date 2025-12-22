import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../config';

const AnimalManager = () => {
  const [animals, setAnimals] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingAnimal, setEditingAnimal] = useState(null);
  const [loading, setLoading] = useState(true);

  const getAuthHeaders = React.useCallback(() => {
    const token = localStorage.getItem('adminToken');
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
  }, []);
  const [formData, setFormData] = useState({
    name: '',
    species: 'Dog',
    breed: '',
    age: '',
    gender: 'Male',
    size: 'Medium',
    color: '',
    status: 'Available',
    description: '',
    medicalNotes: '',
    behavioralNotes: '',
    isSpayedNeutered: false,
    isVaccinated: false,
    isMicrochipped: false,
    adoptionFee: '',
    location: '',
    photos: [],
    isUrgent: false,
    isAnimalOfTheWeek: false,
    isFosterEligible: false,
    isRecentlyAdopted: false
  });

  const fetchAnimals = React.useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/animals`, {
        headers: getAuthHeaders()
      });
      if (response.ok) {
        const data = await response.json();
        setAnimals(data);
      }
    } catch (error) {
      console.error('Error fetching animals:', error);
    } finally {
      setLoading(false);
    }
  }, [getAuthHeaders]);

  useEffect(() => {
    fetchAnimals();
  }, [fetchAnimals]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const url = editingAnimal 
        ? `${API_BASE_URL}/admin/animals/${editingAnimal._id}`
        : `${API_BASE_URL}/admin/animals`;
      
      const method = editingAnimal ? 'PUT' : 'POST';
      
      const submitData = {
        ...formData,
        images: formData.photos.map(url => ({ url, altText: `${formData.name} photo` }))
      };
      delete submitData.photos; // Remove photos field as it's now mapped to images
      
      const response = await fetch(url, {
        method,
        headers: getAuthHeaders(),
        body: JSON.stringify(submitData)
      });

      if (response.ok) {
        fetchAnimals();
        resetForm();
        alert(editingAnimal ? 'Animal updated successfully!' : 'Animal added successfully!');
      }
    } catch (error) {
      console.error('Error saving animal:', error);
      alert('Error saving animal');
    }
  };

  const handleEdit = (animal) => {
    setEditingAnimal(animal);
    setFormData({
      name: animal.name || '',
      species: animal.species || 'Dog',
      breed: animal.breed || '',
      age: animal.age || '',
      gender: animal.gender || 'Male',
      size: animal.size || 'Medium',
      color: animal.color || '',
      status: animal.status || 'Available',
      description: animal.description || '',
      medicalNotes: animal.medicalNotes || '',
      behavioralNotes: animal.behavioralNotes || '',
      isSpayedNeutered: animal.isSpayedNeutered || false,
      isVaccinated: animal.isVaccinated || false,
      isMicrochipped: animal.isMicrochipped || false,
      adoptionFee: animal.adoptionFee || '',
      location: animal.location || '',
      photos: animal.images ? animal.images.map(img => img.url) : [],
      isUrgent: animal.isUrgent || false,
      isAnimalOfTheWeek: animal.isAnimalOfTheWeek || false,
      isFosterEligible: animal.isFosterEligible || false,
      isRecentlyAdopted: animal.isRecentlyAdopted || false
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this animal?')) {
      try {
        const response = await fetch(`${API_BASE_URL}/admin/animals/${id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
          }
        });
        if (response.ok) {
          fetchAnimals();
          alert('Animal deleted successfully!');
        }
      } catch (error) {
        console.error('Error deleting animal:', error);
        alert('Error deleting animal');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      species: 'Dog',
      breed: '',
      age: '',
      gender: 'Male',
      size: 'Medium',
      color: '',
      status: 'Available',
      description: '',
      medicalNotes: '',
      behavioralNotes: '',
      isSpayedNeutered: false,
      isVaccinated: false,
      isMicrochipped: false,
      adoptionFee: '',
      location: '',
      photos: [],
      isUrgent: false,
      isAnimalOfTheWeek: false,
      isFosterEligible: false,
      isRecentlyAdopted: false
    });
    setEditingAnimal(null);
    setShowForm(false);
  };

  const handlePhotoUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    try {
      const uploadPromises = files.map(async (file) => {
        const formData = new FormData();
        formData.append('image', file);

        const response = await fetch(`${API_BASE_URL}/upload/image`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
          },
          body: formData
        });

        if (response.ok) {
          const data = await response.json();
          return data.imageUrl;
        }
        throw new Error('Upload failed');
      });

      const uploadedUrls = await Promise.all(uploadPromises);
      setFormData(prev => ({
        ...prev,
        photos: [...(prev.photos || []), ...uploadedUrls]
      }));
    } catch (error) {
      console.error('Error uploading photos:', error);
      alert('Error uploading photos. Please try again.');
    }
  };

  const removePhoto = (index) => {
    setFormData(prev => ({
      ...prev,
      photos: prev.photos.filter((_, i) => i !== index)
    }));
  };

  const getStatusColor = (status) => {
    const colors = {
      'Available': 'bg-green-100 text-green-800',
      'Adopted': 'bg-purple-100 text-purple-800',
      'Pending': 'bg-yellow-100 text-yellow-800',
      'Medical Hold': 'bg-red-100 text-red-800',
      'Foster': 'bg-blue-100 text-blue-800',
      'Not Available': 'bg-gray-100 text-gray-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }


  // CSV Export Functionality
  const exportAnimalsAsCSV = () => {
    if (!animals || animals.length === 0) {
      alert('No animals to export.');
      return;
    }
    // Define the fields to export
    const fields = [
      'name', 'species', 'breed', 'age', 'gender', 'size', 'color', 'status',
      'adoptionFee', 'location', 'isSpayedNeutered', 'isVaccinated', 'isMicrochipped',
      'description', 'medicalNotes', 'behavioralNotes', 'images'
    ];
    const csvRows = [];
    // Header
    csvRows.push(fields.join(','));
    // Data rows
    animals.forEach(animal => {
      const row = fields.map(field => {
        if (field === 'images') {
          // Join image URLs as semicolon-separated
          return '"' + (animal.images ? animal.images.map(img => img.url).join(';') : '') + '"';
        }
        let val = animal[field];
        if (typeof val === 'boolean') return val ? 'TRUE' : 'FALSE';
        if (val === undefined || val === null) return '';
        // Escape quotes and commas
        return '"' + String(val).replace(/"/g, '""') + '"';
      });
      csvRows.push(row.join(','));
    });
    const csvContent = csvRows.join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `animals_export_${new Date().toISOString().slice(0,10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Animal Management</h2>
        <div className="flex gap-2">
          <button
            onClick={exportAnimalsAsCSV}
            className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
          >
            Export Animals
          </button>
          <label className="bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded cursor-pointer flex items-center">
            Import Animals
            <input
              type="file"
              accept=".csv"
              style={{ display: 'none' }}
              onChange={async (e) => {
                const file = e.target.files[0];
                if (!file) return;
                const text = await file.text();
                // Simple CSV parse (assumes header row)
                const lines = text.split(/\r?\n/).filter(Boolean);
                if (lines.length < 2) {
                  alert('CSV must have a header and at least one data row.');
                  return;
                }
                const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
                const newAnimals = lines.slice(1).map(line => {
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
                    if (h === 'isSpayedNeutered' || h === 'isVaccinated' || h === 'isMicrochipped') {
                      obj[h] = v.toLowerCase() === 'true';
                    } else if (h === 'adoptionFee') {
                      obj[h] = v ? Number(v) : '';
                    } else if (h === 'images') {
                      obj['images'] = v ? v.split(';').map(url => ({ url: url.trim(), altText: obj.name + ' photo' })) : [];
                    } else {
                      obj[h] = v.replace(/^"|"$/g, '');
                    }
                  });
                  return obj;
                });
                let success = 0, fail = 0;
                for (const animal of newAnimals) {
                  try {
                    const res = await fetch(`${API_BASE_URL}/admin/animals`, {
                      method: 'POST',
                      headers: getAuthHeaders(),
                      body: JSON.stringify(animal)
                    });
                    if (res.ok) success++; else fail++;
                  } catch {
                    fail++;
                  }
                }
                fetchAnimals();
                alert(`Import complete. Success: ${success}, Failed: ${fail}`);
                e.target.value = '';
              }}
            />
          </label>
          <button
            onClick={() => setShowForm(true)}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            Add New Animal
          </button>
        </div>
      </div>

      {/* Animal Form */}
      {showForm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-4xl shadow-lg rounded-md bg-white">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold">
                {editingAnimal ? 'Edit Animal' : 'Add New Animal'}
              </h3>
              <button
                onClick={resetForm}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Basic Info */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Species</label>
                <select
                  value={formData.species}
                  onChange={(e) => setFormData({...formData, species: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="Dog">Dog</option>
                  <option value="Cat">Cat</option>
                  <option value="Rabbit">Rabbit</option>
                  <option value="Bird">Bird</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Breed</label>
                <input
                  type="text"
                  value={formData.breed}
                  onChange={(e) => setFormData({...formData, breed: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Age</label>
                <select
                  value={formData.age}
                  onChange={(e) => setFormData({...formData, age: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="">Select Age</option>
                  <option value="Puppy/Kitten">Puppy/Kitten</option>
                  <option value="Young">Young</option>
                  <option value="Adult">Adult</option>
                  <option value="Senior">Senior</option>
                  <option value="Unknown">Unknown</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                <select
                  value={formData.gender}
                  onChange={(e) => setFormData({...formData, gender: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Unknown">Unknown</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Size</label>
                <select
                  value={formData.size}
                  onChange={(e) => setFormData({...formData, size: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="Small">Small</option>
                  <option value="Medium">Medium</option>
                  <option value="Large">Large</option>
                  <option value="Extra Large">Extra Large</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Color</label>
                <input
                  type="text"
                  value={formData.color}
                  onChange={(e) => setFormData({...formData, color: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({...formData, status: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="Available">Available</option>
                  <option value="Pending">Pending Adoption</option>
                  <option value="Medical Hold">Medical Hold</option>
                  <option value="Foster">Foster</option>
                  <option value="Adopted">Adopted</option>
                  <option value="Not Available">Not Available</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Adoption Fee ($)</label>
                <input
                  type="number"
                  value={formData.adoptionFee}
                  onChange={(e) => setFormData({...formData, adoptionFee: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                <input
                  type="text"
                  placeholder="Kennel #, Foster Home, etc."
                  value={formData.location}
                  onChange={(e) => setFormData({...formData, location: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>

              {/* Medical Checkboxes */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Medical Status</label>
                <div className="flex gap-6">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.isSpayedNeutered}
                      onChange={(e) => setFormData({...formData, isSpayedNeutered: e.target.checked})}
                      className="mr-2"
                    />
                    Spayed/Neutered
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.isVaccinated}
                      onChange={(e) => setFormData({...formData, isVaccinated: e.target.checked})}
                      className="mr-2"
                    />
                    Vaccinated
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.isMicrochipped}
                      onChange={(e) => setFormData({...formData, isMicrochipped: e.target.checked})}
                      className="mr-2"
                    />
                    Microchipped
                  </label>
                </div>
              </div>

              {/* Description */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="Personality, behavior, special needs..."
                />
              </div>

              {/* Medical Notes */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Medical Notes</label>
                <textarea
                  value={formData.medicalNotes}
                  onChange={(e) => setFormData({...formData, medicalNotes: e.target.value})}
                  rows="2"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="Medical history, conditions, treatments..."
                />
              </div>

              {/* Behavioral Notes */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Behavioral Notes</label>
                <textarea
                  value={formData.behavioralNotes}
                  onChange={(e) => setFormData({...formData, behavioralNotes: e.target.value})}
                  rows="2"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="Training needs, behavior with other animals, children..."
                />
              </div>

              {/* Foster Eligible Checkbox */}
              <div className="md:col-span-2 flex items-center mt-2">
                <input
                  type="checkbox"
                  id="isFosterEligible"
                  checked={formData.isFosterEligible}
                  onChange={e => setFormData({...formData, isFosterEligible: e.target.checked})}
                  className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="isFosterEligible" className="text-sm font-medium text-gray-700">Foster Eligible</label>
              </div>

              {/* Photo Upload */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Photos</label>
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                  <div className="space-y-1 text-center">
                    <svg
                      className="mx-auto h-12 w-12 text-gray-400"
                      stroke="currentColor"
                      fill="none"
                      viewBox="0 0 48 48"
                      aria-hidden="true"
                    >
                      <path
                        d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                        strokeWidth={2}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    <div className="flex text-sm text-gray-600">
                      <label
                        htmlFor="animal-photos"
                        className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500"
                      >
                        <span>Upload photos</span>
                        <input
                          id="animal-photos"
                          name="animal-photos"
                          type="file"
                          multiple
                          accept="image/*"
                          className="sr-only"
                          onChange={handlePhotoUpload}
                        />
                      </label>
                      <p className="pl-1">or drag and drop</p>
                    </div>
                    <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB each</p>
                  </div>
                </div>
                
                {/* Photo Preview */}
                {formData.photos && formData.photos.length > 0 && (
                  <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                    {formData.photos.map((photo, index) => (
                      <div key={index} className="relative">
                        <img
                          src={photo}
                          alt={`Preview ${index + 1}`}
                          className="h-24 w-full object-cover rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={() => removePhoto(index)}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full h-6 w-6 flex items-center justify-center text-xs hover:bg-red-600"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Form Buttons */}
              <div className="md:col-span-2 flex gap-4 pt-4">
                <button
                  type="submit"
                  className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                >
                  {editingAnimal ? 'Update Animal' : 'Add Animal'}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Animals List */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {animals.map((animal) => (
            <li key={animal._id} className="px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="flex-shrink-0 h-16 w-16">
                    {animal.photos && animal.photos.length > 0 ? (
                      <img
                        className="h-16 w-16 rounded-full object-cover"
                        src={animal.photos[0]}
                        alt={animal.name}
                      />
                    ) : (
                      <div className="h-16 w-16 rounded-full bg-gray-300 flex items-center justify-center">
                        🐾
                      </div>
                    )}
                  </div>
                  <div className="ml-4">
                    <div className="flex items-center">
                      <div className="text-lg font-medium text-gray-900">
                        {animal.name}
                      </div>
                      <span className={`ml-2 px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(animal.status)}`}>
                        {animal.status}
                      </span>
                        {animal.isFosterEligible && (
                          <span className="ml-2 px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800 border border-blue-300">
                            Foster Eligible
                          </span>
                        )}
                    </div>
                    <div className="text-sm text-gray-500">
                      {animal.species} • {animal.breed} • {animal.age} • {animal.gender}
                    </div>
                    {animal.description && (
                      <div className="text-sm text-gray-600 mt-1">
                        {animal.description.substring(0, 100)}...
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleEdit(animal)}
                    className="bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-1 px-3 rounded text-sm"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(animal._id)}
                    className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-3 rounded text-sm"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
        {animals.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No animals found. Add your first animal to get started!
          </div>
        )}
      </div>
    </div>
  );
};

export default AnimalManager;