import React, { useState, useEffect } from 'react';
import PetCompatibilityQuiz from '../components/PetCompatibilityQuiz';
import { FaMapMarkerAlt } from 'react-icons/fa';
import { Link } from 'react-router-dom';

// Lightweight count-up hook for animating stat changes
function useCountUp(target, duration = 600) {
  const [value, setValue] = useState(Number(target) || 0);
  const prevRef = React.useRef(value);
  useEffect(() => {
    const startVal = Number(prevRef.current) || 0;
    const endVal = Number(target) || 0;
    if (startVal === endVal) return;
    let raf;
    const start = performance.now();
    const step = (now) => {
      const p = Math.min((now - start) / duration, 1);
      const current = Math.round(startVal + (endVal - startVal) * p);
      setValue(current);
      if (p < 1) {
        raf = requestAnimationFrame(step);
      } else {
        prevRef.current = endVal;
      }
    };
    raf = requestAnimationFrame(step);
    return () => raf && cancelAnimationFrame(raf);
  }, [target, duration]);
  return value;
}

// Bold Urgent Needs/Alert Banner
const UrgentAlertBanner = () => (
  <div className="bg-red-700 text-white text-center py-4 px-2 font-bold text-lg shadow-lg mb-6 animate-pulse" role="alert" aria-live="assertive">
    🚨 URGENT: Several animals need immediate foster or medical support! <Link to="/donate" className="underline font-bold hover:text-yellow-200 ml-2">Help Now</Link>
  </div>
);

// Sticky Take Action Now Button (bottom right)
const StickyActionButton = () => (
  <div className="fixed bottom-6 right-6 z-50">
    <Link
      to="/donate"
      className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-full shadow-lg text-lg transition-colors focus:outline-none focus:ring-4 focus:ring-red-300 animate-bounce"
      aria-label="Take Action Now - Urgent Needs"
    >
      <span role="img" aria-label="alert">🚨</span> Take Action Now
    </Link>
  </div>
);

        
        <section className="bg-gray-100 py-12 border-t border-gray-200">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6 text-center">Frequently Asked Questions</h2>
            <div className="space-y-6">
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-blue-800 mb-2">How do I adopt an animal?</h3>
                <p className="text-gray-700">Browse available animals, click "I'm Interested" on a pet, and fill out the adoption inquiry form. Our team will contact you to guide you through the next steps.</p>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-blue-800 mb-2">What is the adoption process like?</h3>
                <p className="text-gray-700">After submitting your inquiry, we review your application, schedule a call or visit, and help you find the best match. We provide support and resources for a smooth transition.</p>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-blue-800 mb-2">Can I foster or volunteer?</h3>
                <p className="text-gray-700">Absolutely! Visit our Foster or Volunteer pages to learn more and sign up. Fosters and volunteers are vital to our mission and receive training and support.</p>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-blue-800 mb-2">How can I donate or help?</h3>
                <p className="text-gray-700">You can donate online, become a monthly supporter, or help by sharing our mission. Every contribution makes a difference for the animals in our care.</p>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-blue-800 mb-2">Where can I get more information?</h3>
                <p className="text-gray-700">If you have more questions, please contact us through our website or email. We're here to help you every step of the way!</p>
              </div>
            </div>
          </div>
        </section>

const Animals = () => {
  const [animals, setAnimals] = useState([]);
  const [statusBreakdown, setStatusBreakdown] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedSpecies, setSelectedSpecies] = useState('All');
  const [selectedAnimal, setSelectedAnimal] = useState(null);
  const [viewingAnimal, setViewingAnimal] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showQuiz, setShowQuiz] = useState(false);
  // Live stats state
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [isUpdating, setIsUpdating] = useState(false);
  const [statsJustUpdated, setStatsJustUpdated] = useState(false);
  // Quick filter state
  const [quickFilters, setQuickFilters] = useState({
    senior: false,
    specialNeeds: false,
    longTerm: false,
    urgent: false,
  });
  // const [quizRecommendations, setQuizRecommendations] = useState(null);

  // Get urgent animals for spotlight
  const urgentAnimals = animals.filter(animal => animal.isUrgent || animal.urgentStory);

  // Get Animal of the Week (first flagged, else first animal)
  const animalOfWeek = animals.find(animal => animal.isAnimalOfWeek) || animals[0];

  useEffect(() => {
    fetchAvailableAnimals();
    fetchAnimalStatsBreakdown();
    
    // Set up auto-refresh for live stats every 30 seconds
    const statsRefreshInterval = setInterval(() => {
      fetchAnimalStatsBreakdown(true); // true = background update
      fetchAvailableAnimals();
    }, 30000);

    return () => clearInterval(statsRefreshInterval);
  }, []);

  // Animated counters for live stats
  const availableCount = useCountUp(statusBreakdown?.['Available'] ?? 0);
  const fosterCount = useCountUp(statusBreakdown?.['Foster'] ?? 0);
  const medicalHoldCount = useCountUp(statusBreakdown?.['Medical Hold'] ?? 0);
  const adoptedCount = useCountUp(statusBreakdown?.['Adopted'] ?? 0);

  const fetchAvailableAnimals = async () => {
    try {
      const API_BASE = process.env.REACT_APP_API_URL || '/api';
      const response = await fetch(`${API_BASE}/animals`);
      if (response.ok) {
        const data = await response.json();
        setAnimals(data);
      }
    } catch (error) {
      console.error('Error fetching animals:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAnimalStatsBreakdown = async (isBackgroundUpdate = false) => {
    try {
      if (isBackgroundUpdate) {
        setIsUpdating(true);
      }
      const API_BASE = process.env.REACT_APP_API_URL || '/api';
      const url = `${API_BASE}/animals/stats/breakdown`;
      console.log('Fetching breakdown from:', url);
      const res = await fetch(url);
      console.log('Breakdown response status:', res.status);
      if (!res.ok) {
        console.error('Breakdown fetch failed with status:', res.status);
        return;
      }
      const data = await res.json();
      console.log('Breakdown data received:', data);
      if (data) {
        setStatusBreakdown(data);
        setLastUpdated(new Date());
        if (isBackgroundUpdate) {
          setStatsJustUpdated(true);
          setTimeout(() => setStatsJustUpdated(false), 3000);
        }
      }
    } catch (err) {
      console.error('Error fetching animal stats breakdown:', err);
    } finally {
      if (isBackgroundUpdate) {
        setIsUpdating(false);
      }
    }
  };

  // Quick filter logic
  const applyQuickFilters = (animal) => {
    // Senior: isSenior or age >= 8
    if (quickFilters.senior && !(animal.isSenior || (typeof animal.age === 'number' ? animal.age >= 8 : false) || (typeof animal.age === 'string' && parseInt(animal.age) >= 8))) {
      return false;
    }
    // Special Needs: specialNeeds true
    if (quickFilters.specialNeeds && !animal.specialNeeds) {
      return false;
    }
    // Long-Term Resident: isLongTermResident true
    if (quickFilters.longTerm && !animal.isLongTermResident) {
      return false;
    }
    // Urgent: isUrgent or urgentStory
    if (quickFilters.urgent && !(animal.isUrgent || animal.urgentStory)) {
      return false;
    }
    return true;
  };

  const filteredAnimals = animals.filter(animal => {
    // Filter by species
    const speciesMatch = selectedSpecies === 'All' || animal.species === selectedSpecies;
    // Filter by search term
    const searchMatch = searchTerm === '' || 
      animal.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      animal.breed?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      animal.description?.toLowerCase().includes(searchTerm.toLowerCase());
    // Quick filters
    const quickMatch = applyQuickFilters(animal);
    return speciesMatch && searchMatch && quickMatch;
  });

  const getSpeciesList = () => {
    const species = [...new Set(animals.map(animal => animal.species))];
    return ['All', ...species];
  };

  const handleQuizComplete = (recommendations, answers) => {
  // setQuizRecommendations(recommendations);
    // Filter animals based on quiz recommendations
    const recommendedSpecies = recommendations.flatMap(rec => 
      Array.isArray(rec.species) ? rec.species : [rec.species]
    );
    
    // Auto-filter to show recommended animals
    if (recommendedSpecies.length > 0) {
      setSelectedSpecies(recommendedSpecies[0]);
    }
    
    console.log('Quiz completed:', { recommendations, answers });
  };

  // Format the last updated time
  const getTimeAgo = (date) => {
    const seconds = Math.floor((new Date() - date) / 1000);
    if (seconds < 60) return 'just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return 'today';
  };

  const AdoptionModal = ({ animal, onClose }) => {
    const [formData, setFormData] = useState({
      name: '',
      email: '',
      phone: '',
      address: '',
      experience: '',
      message: ''
    });
    const [submitting, setSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState('');

    const handleSubmit = async (e) => {
      e.preventDefault();
      setSubmitting(true);
      setSubmitError('');

      // Frontend validation
      if (!formData.name || formData.name.trim().length < 2) {
        setSubmitError('Name must be at least 2 characters.');
        setSubmitting(false);
        return;
      }
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!formData.email || !emailRegex.test(formData.email)) {
        setSubmitError('Please enter a valid email address.');
        setSubmitting(false);
        return;
      }
      if (!formData.phone || formData.phone.trim().length < 10) {
        setSubmitError('Phone number must be at least 10 digits.');
        setSubmitting(false);
        return;
      }
      if (!formData.address || formData.address.trim().length < 5) {
        setSubmitError('Address must be at least 5 characters.');
        setSubmitting(false);
        return;
      }
      if (!formData.message || formData.message.trim().length < 10) {
        setSubmitError('Message must be at least 10 characters.');
        setSubmitting(false);
        return;
      }

      try {
        const API_BASE = process.env.REACT_APP_API_URL || '/api';
        const response = await fetch(`${API_BASE}/adoption-inquiries`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            animalId: animal._id,
            applicantName: formData.name,
            email: formData.email,
            phone: formData.phone,
            address: formData.address,
            experience: formData.experience,
            message: formData.message
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to submit inquiry');
        }

        const result = await response.json();
        console.log('Adoption inquiry submitted successfully:', result);
        alert('Thank you for your interest! We have received your adoption inquiry and will contact you soon.');
        onClose();
      } catch (error) {
        console.error('Error submitting adoption inquiry:', error);
        setSubmitError(error.message || 'Failed to submit inquiry. Please try again.');
      } finally {
        setSubmitting(false);
      }
    };

    return (
      <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
        <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-2xl shadow-lg rounded-md bg-white">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold">Adoption Inquiry - {animal.name}</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1"><span>City/State</span> <FaMapMarkerAlt className="inline-block text-red-500" /></label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({...formData, address: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Previous Pet Experience
              </label>
              <textarea
                value={formData.experience}
                onChange={(e) => setFormData({...formData, experience: e.target.value})}
                rows="2"
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="Tell us about your experience with pets..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Why do you want to adopt {animal.name}?
              </label>
              <textarea
                value={formData.message}
                onChange={(e) => setFormData({...formData, message: e.target.value})}
                rows="3"
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="Tell us why you're interested in this particular animal..."
                required
              />
            </div>

            {submitError && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                {submitError}
              </div>
            )}

            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                disabled={submitting}
                className={`font-bold py-2 px-4 rounded ${
                  submitting 
                    ? 'bg-gray-400 cursor-not-allowed text-white' 
                    : 'bg-blue-500 hover:bg-blue-700 text-white'
                }`}
              >
                {submitting ? 'Submitting...' : 'Submit Inquiry'}
              </button>
              <button
                type="button"
                onClick={onClose}
                disabled={submitting}
                className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  const AnimalDetailModal = ({ animal, onClose, onAdopt }) => {
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    if (!animal) return null;

    const nextImage = () => {
      if (animal.images && animal.images.length > 1) {
        setCurrentImageIndex((prev) => (prev + 1) % animal.images.length);
      }
    };

    const prevImage = () => {
      if (animal.images && animal.images.length > 1) {
        setCurrentImageIndex((prev) => (prev - 1 + animal.images.length) % animal.images.length);
      }
    };

    return (
      <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
        <div className="relative top-10 mx-auto p-5 border w-11/12 max-w-4xl shadow-lg rounded-md bg-white">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-900">Meet {animal.name}</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-xl"
            >
              ✕
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Image Gallery */}
            <div>
              <div className="relative">
                {animal.images && animal.images.length > 0 ? (
                  <>
                    <img
                      src={animal.images[currentImageIndex].url}
                      alt={animal.images[currentImageIndex].altText || animal.name}
                      className="w-full h-80 object-cover rounded-lg"
                    />
                    {animal.images.length > 1 && (
                      <>
                        <button
                          onClick={prevImage}
                          className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70"
                        >
                          ←
                        </button>
                        <button
                          onClick={nextImage}
                          className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70"
                        >
                          →
                        </button>
                        <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-1">
                          {animal.images.map((_, index) => (
                            <button
                              key={index}
                              onClick={() => setCurrentImageIndex(index)}
                              className={`w-2 h-2 rounded-full ${
                                index === currentImageIndex ? 'bg-white' : 'bg-white bg-opacity-50'
                              }`}
                            />
                          ))}
                        </div>
                      </>
                    )}
                  </>
                ) : (
                  <div className="w-full h-80 bg-gray-200 rounded-lg flex items-center justify-center text-6xl">
                    🐾
                  </div>
                )}
              </div>
            </div>

            {/* Animal Details */}
            <div className="space-y-4">
              {/* Basic Info */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-2">Basic Information</h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div><span className="font-medium">Species:</span> {animal.species}</div>
                  <div><span className="font-medium">Breed:</span> {animal.breed || 'Mixed'}</div>
                  <div><span className="font-medium">Age:</span> {animal.age || 'Unknown'}</div>
                  <div><span className="font-medium">Gender:</span> {animal.gender || 'Unknown'}</div>
                  <div><span className="font-medium">Size:</span> {animal.size || 'Unknown'}</div>
                  {animal.color && <div><span className="font-medium">Color:</span> {animal.color}</div>}
                </div>
              </div>

              {/* Medical Info */}
              <div className="bg-green-50 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-2">Medical Status</h3>
                <div className="flex flex-wrap gap-2">
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    animal.isSpayedNeutered 
                      ? 'bg-green-200 text-green-800' 
                      : 'bg-yellow-200 text-yellow-800'
                  }`}>
                    {animal.isSpayedNeutered ? '✓ Spayed/Neutered' : '○ Not Spayed/Neutered'}
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    animal.isVaccinated 
                      ? 'bg-green-200 text-green-800' 
                      : 'bg-yellow-200 text-yellow-800'
                  }`}>
                    {animal.isVaccinated ? '✓ Vaccinated' : '○ Needs Vaccination'}
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    animal.isMicrochipped 
                      ? 'bg-green-200 text-green-800' 
                      : 'bg-yellow-200 text-yellow-800'
                  }`}>
                    {animal.isMicrochipped ? '✓ Microchipped' : '○ Not Microchipped'}
                  </span>
                </div>
                {animal.specialNeeds && (
                  <div className="mt-2 p-2 bg-blue-100 rounded text-sm">
                    <span className="font-medium text-blue-800">Special Needs:</span>
                    <p className="text-blue-700">{animal.specialNeedsDescription}</p>
                  </div>
                )}
              </div>

              {/* Description */}
              {animal.description && (
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-gray-900 mb-2">About {animal.name}</h3>
                  <p className="text-gray-700">{animal.description}</p>
                </div>
              )}

              {/* Adoption Button */}
              <button
                onClick={() => onAdopt(animal)}
                className="w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition-colors text-lg"
              >
                Start Adoption Process for {animal.name}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <UrgentAlertBanner />
  {/* Enhanced Hero Section */}
  <StickyActionButton />
      {/* Adoption Stats Section - LIVE DATA */}
      <section className="bg-gradient-to-r from-blue-50 to-indigo-50 py-12 border-b-2 border-blue-300">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex-1 text-center md:text-left mb-6">
            <div className="flex items-center justify-center md:justify-start gap-3 mb-2">
              <h2 className="text-2xl font-bold text-blue-800">Our Impact</h2>
              {/* Live indicator badge */}
              <div className="flex items-center gap-2 bg-green-100 border border-green-400 px-3 py-1 rounded-full">
                <span className="relative flex h-3 w-3">
                  <span className={`${isUpdating ? 'animate-ping' : ''} absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75`}></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                </span>
                <span className="text-xs font-semibold text-green-800 uppercase tracking-wide">Live</span>
              </div>
              {statsJustUpdated && (
                <span className="text-xs text-green-600 font-medium animate-pulse">
                  ✓ Updated
                </span>
              )}
            </div>
            <p className="text-gray-700 mb-1">Transparency matters. Here's how your support changes lives:</p>
          </div>
          <div className="flex flex-wrap gap-6 justify-center md:justify-end" aria-live="polite">
            {statusBreakdown ? (
              <>
                <div className={`bg-blue-50 rounded-lg p-4 shadow text-center min-w-[110px] transition-all duration-300 ${statsJustUpdated ? 'ring-2 ring-blue-400 shadow-lg' : ''}`}>
                  <div className="text-3xl font-bold text-blue-700 mb-1">{availableCount}</div>
                  <div className="text-sm text-blue-900">Available</div>
                </div>
                <div className={`bg-green-50 rounded-lg p-4 shadow text-center min-w-[110px] transition-all duration-300 ${statsJustUpdated ? 'ring-2 ring-green-400 shadow-lg' : ''}`}>
                  <div className="text-3xl font-bold text-green-700 mb-1">{fosterCount}</div>
                  <div className="text-sm text-green-900">Foster</div>
                </div>
                <div className={`bg-orange-50 rounded-lg p-4 shadow text-center min-w-[110px] transition-all duration-300 ${statsJustUpdated ? 'ring-2 ring-orange-400 shadow-lg' : ''}`}>
                  <div className="text-3xl font-bold text-orange-700 mb-1">{medicalHoldCount}</div>
                  <div className="text-sm text-orange-900">Medical<br />Hold</div>
                </div>
                <div className={`bg-purple-50 rounded-lg p-4 shadow text-center min-w-[110px] transition-all duration-300 ${statsJustUpdated ? 'ring-2 ring-purple-400 shadow-lg' : ''}`}>
                  <div className="text-3xl font-bold text-purple-700 mb-1">{adoptedCount}</div>
                  <div className="text-sm text-purple-900">Adopted</div>
                </div>
              </>
            ) : (
              <div className="text-center text-gray-500 py-4">
                <div className="inline-flex items-center gap-2">
                  <svg className="animate-spin h-5 w-5 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Loading live data...
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
        <div className="bg-gradient-to-br from-blue-600 to-blue-800 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div className="text-center">
              <h1 className="text-5xl font-bold mb-6">Adopt a Pet. Change a Life.</h1>
              <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
                Before you adopt, make sure you're ready for the commitment. 
                Our animals are looking for loving forever homes where they can thrive.
              </p>

      {/* Animal of the Week Feature */}
      {animalOfWeek && (
        <section className="bg-yellow-50 py-12 border-t-4 border-yellow-400 mb-8">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-yellow-800 mb-6 text-center flex items-center justify-center gap-2">
              <span role="img" aria-label="star">🌟</span> Animal of the Week
            </h2>
            <div className="bg-white rounded-lg shadow-xl overflow-hidden flex flex-col md:flex-row items-center">
              <div className="md:w-1/2 w-full h-96 bg-gray-200 flex items-center justify-center">
                {animalOfWeek.images && animalOfWeek.images.length > 0 ? (
                  <img
                    src={animalOfWeek.images[0].url}
                    alt={animalOfWeek.images[0].altText || `${animalOfWeek.name} the ${animalOfWeek.species}`}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-8xl" aria-label="No animal photo available">
                    🐾
                  </div>
                )}
              </div>
              <div className="md:w-1/2 w-full p-8 flex flex-col justify-between">
                <h3 className="text-2xl font-bold text-yellow-700 mb-2">{animalOfWeek.name}</h3>
                <p className="text-sm text-gray-600 mb-2">{animalOfWeek.species} • {animalOfWeek.breed} • {animalOfWeek.age} • {animalOfWeek.size}</p>
                {animalOfWeek.featuredStory ? (
                  <blockquote className="italic text-yellow-700 mb-2">{animalOfWeek.featuredStory}</blockquote>
                ) : (
                  <p className="text-gray-700 mb-2">{animalOfWeek.description}</p>
                )}
                {animalOfWeek.specialNeeds && (
                  <div className="bg-blue-100 text-blue-800 px-3 py-2 rounded mb-2 text-sm">
                    <span className="font-semibold">Special Needs:</span> {animalOfWeek.specialNeedsDescription}
                  </div>
                )}
                <div className="mt-4 flex flex-col gap-2">
                  <button
                    onClick={() => setViewingAnimal(animalOfWeek)}
                    className="w-full bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded transition-colors"
                    aria-label={`View details for ${animalOfWeek.name}`}
                  >
                    View Details
                  </button>
                  <button
                    onClick={() => setSelectedAnimal(animalOfWeek)}
                    className="w-full bg-yellow-600 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded transition-colors"
                    aria-label={`Express interest in adopting ${animalOfWeek.name}`}
                  >
                    I'm Interested in {animalOfWeek.name}
                  </button>
                  <Link
                    to="/donate"
                    className="w-full bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-bold py-2 px-4 rounded transition-colors text-center"
                  >
                    Sponsor {animalOfWeek.name}
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Urgent Needs Spotlight Section */}
      {urgentAnimals.length > 0 && (
        <section className="bg-red-50 py-12 border-t-4 border-red-400 mb-8">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-red-800 mb-6 text-center flex items-center justify-center gap-2">
              <span role="img" aria-label="urgent">🚨</span> Urgent Needs Spotlight
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {urgentAnimals.map(animal => (
                <div key={animal._id} className="bg-white rounded-lg shadow-lg overflow-hidden flex flex-col">
                  <div className="h-80 bg-gray-200 relative">
                    {animal.images && animal.images.length > 0 ? (
                      <img
                        src={animal.images[0].url}
                        alt={animal.images[0].altText || `${animal.name} the ${animal.species}`}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-7xl" aria-label="No animal photo available">
                        🐾
                      </div>
                    )}
                  </div>
                  <div className="p-6 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="text-2xl font-bold text-red-700 mb-2">{animal.name}</h3>
                      <p className="text-sm text-gray-600 mb-2">{animal.species} • {animal.breed} • {animal.age} • {animal.size}</p>
                      {animal.urgentStory ? (
                        <blockquote className="italic text-red-700 mb-2">{animal.urgentStory}</blockquote>
                      ) : (
                        <p className="text-gray-700 mb-2">{animal.description}</p>
                      )}
                      {animal.specialNeeds && (
                        <div className="bg-blue-100 text-blue-800 px-3 py-2 rounded mb-2 text-sm">
                          <span className="font-semibold">Special Needs:</span> {animal.specialNeedsDescription}
                        </div>
                      )}
                    </div>
                    <div className="mt-4 flex flex-col gap-2">
                      <button
                        onClick={() => setViewingAnimal(animal)}
                        className="w-full bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded transition-colors"
                        aria-label={`View details for ${animal.name}`}
                      >
                        View Details
                      </button>
                      <button
                        onClick={() => setSelectedAnimal(animal)}
                        className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded transition-colors"
                        aria-label={`Express interest in adopting or fostering ${animal.name}`}
                      >
                        I'm Interested in {animal.name}
                      </button>
                      <Link
                        to="/donate"
                        className="w-full bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-bold py-2 px-4 rounded transition-colors text-center"
                      >
                        Donate for {animal.name}
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="text-center mt-8">
              <Link to="/foster" className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-8 rounded-lg shadow-lg text-lg inline-block">
                🏡 Become a Foster for Urgent Animals
              </Link>
            </div>
          </div>
        </section>
      )}

              {/* Call-to-Action Buttons */}
              <div className="flex flex-col sm:flex-row flex-wrap gap-4 justify-center items-center mb-4">
                <button
                  onClick={() => setShowQuiz(true)}
                  className="bg-white text-blue-600 hover:bg-blue-50 font-bold py-4 px-8 rounded-lg text-lg transition-colors shadow-lg"
                >
                  🧠 Find Your Perfect Pet Match
                </button>
                <button
                  onClick={() => {
                    document.getElementById('animals-section').scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="bg-blue-500 hover:bg-blue-400 text-white font-bold py-4 px-8 rounded-lg text-lg transition-colors border-2 border-blue-400"
                >
                  Browse Available Animals
                </button>
                <Link
                  to="/donate"
                  className="bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-bold py-4 px-8 rounded-lg text-lg transition-colors shadow-lg border-2 border-yellow-300"
                  style={{ minWidth: '200px' }}
                >
                  💝 Donate Now
                </Link>
                <Link
                  to="/foster"
                  className="bg-green-500 hover:bg-green-600 text-white font-bold py-4 px-8 rounded-lg text-lg transition-colors shadow-lg border-2 border-green-400"
                  style={{ minWidth: '200px' }}
                >
                  🏡 Become a Foster
                </Link>
                <Link
                  to="/volunteer"
                  className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-4 px-8 rounded-lg text-lg transition-colors shadow-lg border-2 border-purple-400"
                  style={{ minWidth: '200px' }}
                >
                  🤝 Volunteer With Us
                </Link>
                <button
                  onClick={() => document.getElementById('newsletter-signup')?.scrollIntoView({ behavior: 'smooth' })}
                  className="bg-red-500 hover:bg-red-600 text-white font-bold py-4 px-8 rounded-lg text-lg transition-colors shadow-lg border-2 border-red-400"
                  style={{ minWidth: '200px' }}
                >
                  📧 Sign Up for Updates
                </button>
              </div>

              {/* Success Stories Link */}
              <div className="mt-8">
                <p className="text-blue-200 text-sm">
                  📚 Learn about pet preparation and our adoption process below
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Urgent Needs / Featured Animals Banner */}
        <div className="bg-red-100 border-t-4 border-red-400 py-6 px-4 sm:px-0">
          <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <span className="text-3xl md:text-4xl">🚨</span>
              <div>
                <h2 className="text-xl md:text-2xl font-bold text-red-800 mb-1">Urgent: Animals Needing Immediate Homes</h2>
                <p className="text-red-700 text-sm md:text-base">Some of our animals need extra help finding a home due to medical needs, age, or long shelter stays. Adopting or fostering one of these pets saves lives!</p>
              </div>
            </div>
              <button
                onClick={() => document.getElementById('animals-section')?.scrollIntoView({ behavior: 'smooth' })}
                className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-lg transition-colors shadow-lg border-2 border-red-400 text-lg"
              >
                View Urgent Animals
              </button>
          </div>
        </div>

        {/* Pet Preparation Section */}
        <div className="bg-white py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Prepare for Your New Companion</h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Use the tools below to ensure you're ready for the commitment of pet ownership.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Quiz Card */}
              <div className="bg-blue-50 p-6 rounded-lg text-center">
                <div className="text-4xl mb-4">🧠</div>
                <h3 className="text-xl font-semibold text-blue-900 mb-3">Take Our Quiz</h3>
                <p className="text-blue-700 mb-4">
                  Find out which type of pet matches your lifestyle, living situation, and experience level.
                </p>
                <button
                  onClick={() => setShowQuiz(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                >
                  Start Quiz
                </button>
              </div>
              
              {/* Preparation Card */}
              <div className="bg-green-50 p-6 rounded-lg text-center">
                <div className="text-4xl mb-4">📋</div>
                <h3 className="text-xl font-semibold text-green-900 mb-3">Preparation Checklist</h3>
                <p className="text-green-700 mb-4">
                  Get ready for your new pet with our comprehensive preparation guide and checklist.
                </p>
                <button className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded">
                  View Checklist
                </button>
              </div>
              
              {/* Consultation Card */}
              <div className="bg-purple-50 p-6 rounded-lg text-center">
                <div className="text-4xl mb-4">💬</div>
                <h3 className="text-xl font-semibold text-purple-900 mb-3">Schedule Consultation</h3>
                <p className="text-purple-700 mb-4">
                  Speak with our adoption specialists to discuss your needs and learn about our animals.
                </p>
                <button className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded">
                  Book Consultation
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Emotional Impact Stories / Testimonials Section */}
        <section className="bg-yellow-50 py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-yellow-900 mb-4">Lives Changed Forever</h2>
              <p className="text-xl text-yellow-700 max-w-3xl mx-auto">
                Real stories from adopters and families whose lives were transformed by rescue. Every adoption is a new beginning—for pets and people alike.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Story 1 */}
              <div className="bg-white p-8 rounded-lg shadow-lg text-center flex flex-col items-center">
                <img src="https://bestfriends.org/sites/default/files/styles/large/public/2025-06/Jennifer-300x300.jpg?itok=L5wgSgQM" alt="Jennifer with Poppy Cakes the dog" className="w-32 h-32 rounded-full object-cover mb-4 border-4 border-yellow-200" />
                <blockquote className="italic text-yellow-800 mb-2 text-lg">“Poppy Cakes is my best friend because she is always excited to go hiking. She cuddles, listens, and is always in a good mood. She changed my life.”</blockquote>
                <span className="text-sm text-gray-500">— Jennifer A., Adopter</span>
              </div>
              {/* Story 2 */}
              <div className="bg-white p-8 rounded-lg shadow-lg text-center flex flex-col items-center">
                <img src="https://bestfriends.org/sites/default/files/styles/large/public/2025-06/Kevin-300x300.jpg?itok=9S-83KtK" alt="Kevin with Rocky the cat" className="w-32 h-32 rounded-full object-cover mb-4 border-4 border-yellow-200" />
                <blockquote className="italic text-yellow-800 mb-2 text-lg">“Rocky came to live with me when someone left him in the parking lot 10 years ago. Now, he’s the best kitty in the world and my daily companion.”</blockquote>
                <span className="text-sm text-gray-500">— Kevin M., Adopter</span>
              </div>
              {/* Story 3 */}
              <div className="bg-white p-8 rounded-lg shadow-lg text-center flex flex-col items-center">
                <img src="https://bestfriends.org/sites/default/files/styles/large/public/2025-06/Donna-300x300.jpg?itok=mYbH9-GD" alt="Donna with Casey the dog" className="w-32 h-32 rounded-full object-cover mb-4 border-4 border-yellow-200" />
                <blockquote className="italic text-yellow-800 mb-2 text-lg">“Casey pulled me out of the darkness after my husband died and gave me a reason to smile again. She’s my funny, spirited best friend.”</blockquote>
                <span className="text-sm text-gray-500">— Donna L., Adopter</span>
              </div>
            </div>
            <div className="mt-12 text-center">
              <h3 className="text-xl font-bold text-yellow-800 mb-2">Your Story Could Be Next</h3>
              <p className="text-yellow-700 mb-4">Adopting a rescue animal changes lives. Share your story with us and inspire others to open their hearts and homes.</p>
              <Link to="/adoption-stories" className="bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-bold py-3 px-8 rounded-lg shadow-lg text-lg inline-block">
                📚 Read More Stories
              </Link>
            </div>
          </div>
        </section>

        {/* Animals Section */}
        <div id="animals-section" className="bg-gray-50 py-8">

        {/* Recently Adopted Section */}
        {animals.filter(a => a.isRecentlyAdopted).length > 0 && (
          <section className="bg-green-50 border-t-4 border-green-400 py-10 mb-8">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
              <h2 className="text-2xl md:text-3xl font-bold text-green-800 mb-6 text-center flex items-center justify-center gap-2">
                <span role="img" aria-label="adopted">🎉</span> Recently Adopted
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {animals.filter(a => a.isRecentlyAdopted).map(animal => (
                  <div key={animal._id} className="bg-white rounded-lg shadow-lg overflow-hidden flex flex-col">
                    <div className="h-64 bg-gray-200 relative">
                      {animal.images && animal.images.length > 0 ? (
                        <img
                          src={animal.images[0].url}
                          alt={animal.images[0].altText || `${animal.name} the ${animal.species}`}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-6xl" aria-label="No animal photo available">
                          🐾
                        </div>
                      )}
                    </div>
                    <div className="p-6 flex-1 flex flex-col justify-between">
                      <div>
                        <h3 className="text-2xl font-bold text-green-700 mb-2">{animal.name}</h3>
                        <p className="text-sm text-gray-600 mb-2">{animal.species} • {animal.breed} • {animal.age} • {animal.size}</p>
                        {animal.recentlyAdoptedStory ? (
                          <blockquote className="italic text-green-700 mb-2">{animal.recentlyAdoptedStory}</blockquote>
                        ) : (
                          <p className="text-gray-700 mb-2">Adopted and thriving in a new home!</p>
                        )}
                      </div>
                      <div className="mt-4 flex flex-col gap-2">
                        <span className="w-full bg-green-400 text-white font-bold py-2 px-4 rounded text-center">Adopted!</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Search and Filter Section */}
          <div className="mb-8 space-y-4">
            {/* Search Bar */}
            <div className="max-w-md mx-auto">
              <input
                type="text"
                placeholder="Search by name, breed, or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            {/* Species Filter */}
            <div className="flex flex-wrap justify-center gap-2 mb-2">
              {getSpeciesList().map(species => (
                <button
                  key={species}
                  onClick={() => setSelectedSpecies(species)}
                  className={`px-4 py-2 rounded-full font-medium ${
                    selectedSpecies === species
                      ? 'bg-blue-500 text-white'
                      : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {species}
                </button>
              ))}
            </div>
            {/* Quick Filter Buttons */}
            <div className="flex flex-wrap justify-center gap-2 mb-2">
              <button
                onClick={() => setQuickFilters(f => ({ ...f, senior: !f.senior }))}
                className={`px-4 py-2 rounded-full font-medium border ${quickFilters.senior ? 'bg-yellow-300 text-yellow-900 border-yellow-400' : 'bg-white text-gray-700 border-gray-300 hover:bg-yellow-50'}`}
                aria-pressed={quickFilters.senior}
              >
                🧓 Senior
              </button>
              <button
                onClick={() => setQuickFilters(f => ({ ...f, specialNeeds: !f.specialNeeds }))}
                className={`px-4 py-2 rounded-full font-medium border ${quickFilters.specialNeeds ? 'bg-blue-200 text-blue-900 border-blue-400' : 'bg-white text-gray-700 border-gray-300 hover:bg-blue-50'}`}
                aria-pressed={quickFilters.specialNeeds}
              >
                ♿ Special Needs
              </button>
              <button
                onClick={() => setQuickFilters(f => ({ ...f, longTerm: !f.longTerm }))}
                className={`px-4 py-2 rounded-full font-medium border ${quickFilters.longTerm ? 'bg-purple-200 text-purple-900 border-purple-400' : 'bg-white text-gray-700 border-gray-300 hover:bg-purple-50'}`}
                aria-pressed={quickFilters.longTerm}
              >
                ⏳ Long-Term Resident
              </button>
              <button
                onClick={() => setQuickFilters(f => ({ ...f, urgent: !f.urgent }))}
                className={`px-4 py-2 rounded-full font-medium border ${quickFilters.urgent ? 'bg-red-200 text-red-900 border-red-400' : 'bg-white text-gray-700 border-gray-300 hover:bg-red-50'}`}
                aria-pressed={quickFilters.urgent}
              >
                🚨 Urgent
              </button>
            </div>
          </div>
          {/* Animals Grid */}
          {filteredAnimals.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🐾</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {searchTerm ? `No animals match your search "${searchTerm}"` :
                 selectedSpecies === 'All' 
                  ? 'No animals available for adoption at the moment'
                  : `No ${selectedSpecies.toLowerCase()}s available for adoption`
                }
              </h3>
              <p className="text-gray-500">
                {searchTerm ? 'Try adjusting your search terms' : 'Check back soon for new arrivals!'}
              </p>
            </div>
          ) : (
            <>
              {/* Results Counter */}
              <div className="mb-6 text-center">
                <p className="text-gray-600">
                  Showing {filteredAnimals.length} of {animals.length} animal{animals.length !== 1 ? 's' : ''}
                  {selectedSpecies !== 'All' && ` (${selectedSpecies})`}
                  {searchTerm && ` matching "${searchTerm}"`}
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredAnimals.map((animal) => (
                <div key={animal._id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                  {/* Animal Photo */}
                  <div className="h-64 bg-gray-200 relative">
                    {animal.images && animal.images.length > 0 ? (
                      <img
                        src={animal.images[0].url}
                        alt={animal.images[0].altText ? animal.images[0].altText : `${animal.name} the ${animal.species}`}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-6xl" aria-label="No animal photo available">
                        🐾
                      </div>
                    )}
                  </div>
                  {/* Animal Info */}
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-xl font-bold text-gray-900">{animal.name}</h3>
                      <span className="text-sm text-gray-500">{animal.gender}</span>
                    </div>
                    <div className="text-sm text-gray-600 mb-3">
                      <p>{animal.species} • {animal.breed}</p>
                      <p>{animal.age} • {animal.size}</p>
                      {animal.color && <p>Color: {animal.color}</p>}
                    </div>
                    {/* Medical Info */}
                    <div className="flex flex-wrap gap-1 mb-4">
                      {animal.isSpayedNeutered && (
                        <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                          Spayed/Neutered
                        </span>
                      )}
                      {animal.isVaccinated && (
                        <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                          Vaccinated
                        </span>
                      )}
                      {animal.isMicrochipped && (
                        <span className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded-full">
                          Microchipped
                        </span>
                      )}
                    </div>
                    {/* Description */}
                    {animal.description && (
                      <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                        {animal.description}
                      </p>
                    )}
                    {/* Action Buttons */}
                    <div className="space-y-2">
                      <button
                        onClick={() => setViewingAnimal(animal)}
                        className="w-full bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded transition-colors"
                        aria-label={`View details for ${animal.name}`}
                      >
                        View Details
                      </button>
                      <button
                        onClick={() => setSelectedAnimal(animal)}
                        className="w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition-colors"
                        aria-label={`Express interest in adopting ${animal.name}`}
                      >
                        I'm Interested in {animal.name}
                      </button>
                      <Link
                        to={`/donate?animal=${encodeURIComponent(animal.name)}`}
                        className="w-full bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-bold py-2 px-4 rounded transition-colors block text-center border-2 border-yellow-300"
                        aria-label={`Sponsor ${animal.name}`}
                      >
                        💝 Sponsor Me
                      </Link>
                      {animal.isFosterEligible && (
                        <Link
                          to={`/foster?animal=${encodeURIComponent(animal.name)}`}
                          className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded transition-colors block text-center border-2 border-green-400"
                          aria-label={`Foster ${animal.name}`}
                        >
                          🏡 Foster Me
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              </div>
            </>
          )}
        </div>
        </div>

        {/* Animal Detail Modal */}
        {viewingAnimal && (
          <AnimalDetailModal
            animal={viewingAnimal}
            onClose={() => setViewingAnimal(null)}
            onAdopt={(animal) => {
              setViewingAnimal(null);
              setSelectedAnimal(animal);
            }}
          />
        )}

        {/* Adoption Modal */}
        {selectedAnimal && (
          <AdoptionModal
            animal={selectedAnimal}
            onClose={() => setSelectedAnimal(null)}
          />
        )}



        {/* Newsletter Signup Section */}
        <section id="newsletter-signup" className="bg-red-600 text-white py-12 sm:py-16 mt-12">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4">
              📧 Stay Connected—Get Animal Updates
            </h2>
            <p className="text-base sm:text-lg md:text-xl mb-8 text-red-100">
              Get new arrivals, adoption stories, and ways to help delivered to your inbox.
            </p>
            <form
              action="https://your-newsletter-service.com/subscribe" // TODO: Replace with real endpoint
              method="POST"
              className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto"
            >
              <input
                type="email"
                name="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-3 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                required
              />
              <button
                type="submit"
                className="bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-bold px-6 py-3 rounded-lg transition-colors"
              >
                Subscribe
              </button>
            </form>
            <p className="text-sm text-red-200 mt-4">
              We respect your privacy. Unsubscribe at any time.
            </p>
          </div>
        </section>

        {/* Testimonial/Review Snippet for Trust */}
        <section className="bg-white py-12 border-t border-gray-100">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6">What Adopters Are Saying</h2>
            <div className="flex flex-col md:flex-row gap-8 justify-center items-center">
              <div className="bg-gray-50 p-6 rounded-lg shadow text-center flex flex-col items-center max-w-md mx-auto">
                <img src="https://bestfriends.org/sites/default/files/styles/large/public/2025-06/Jennifer-300x300.jpg?itok=L5wgSgQM" alt="Jennifer A. with her adopted dog" className="w-24 h-24 rounded-full object-cover mb-4" />
                <blockquote className="italic text-gray-700 mb-2">“Adopting from HALT was the best decision I ever made. The staff was so helpful, and my new best friend has brought so much joy to my life!”</blockquote>
                <span className="text-sm text-gray-500">— Jennifer A., Adopter</span>
              </div>
            </div>
          </div>
        </section>

        {/* Pet Compatibility Quiz */}
        {showQuiz && (
          <PetCompatibilityQuiz
            onQuizComplete={handleQuizComplete}
            onClose={() => setShowQuiz(false)}
          />
        )}
      </div>
  );
};

export default Animals;
