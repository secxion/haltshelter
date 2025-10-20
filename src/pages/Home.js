import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { HeartIcon, UsersIcon, HomeIcon, SparklesIcon } from '@heroicons/react/24/outline';
import { FaEnvelope } from 'react-icons/fa';
import { FaFacebook, FaInstagram, FaTwitter, FaTiktok, FaYoutube } from 'react-icons/fa';
import { apiService, handleApiError } from '../services/api';

      <div className="fixed bottom-6 right-6 z-50">
        <Link
          to="/donate"
          className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-full shadow-lg text-lg transition-colors focus:outline-none focus:ring-4 focus:ring-red-300 animate-bounce"
          aria-label="Take Action Now - Urgent Needs"
        >
          <span role="img" aria-label="alert">🚨</span> Take Action Now
        </Link>
      </div>


const Home = () => {
  const [featuredStories, setFeaturedStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterStatus, setNewsletterStatus] = useState('');

  const [stats, setStats] = useState([
    { label: 'Animals Rescued', value: 107, icon: HeartIcon },
    { label: 'Adoptions This Month', value: '—', icon: HomeIcon },
    { label: 'Active Volunteers', value: '—', icon: UsersIcon },
    { label: 'Lives Transformed', value: '—', icon: SparklesIcon },
  ]);


  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await apiService.stats.getDashboard();
        const payload = response.data || {};
        const s = payload.stats || payload;

        // Prefer the server-provided animalsRescued. Use MIN_DISPLAY as a safe floor.
        const MIN_DISPLAY = 107;
        let backendAnimals = Number(s.animalsRescued ?? s.animals);
        if (!Number.isFinite(backendAnimals)) backendAnimals = NaN;
        const chosenAnimals = Number.isFinite(backendAnimals) ? backendAnimals : MIN_DISPLAY;

        setStats([
          { label: 'Animals Rescued', value: chosenAnimals, icon: HeartIcon },
          { label: 'Adoptions This Month', value: s.adoptionsThisMonth ?? s.adoptionsThisYear ?? '—', icon: HomeIcon },
          { label: 'Active Volunteers', value: s.volunteers ?? s.activeVolunteers ?? '—', icon: UsersIcon },
          { label: 'Lives Transformed', value: s.livesTransformed ?? (s.adoptionsTotal ?? s.revenue ?? '—'), icon: SparklesIcon },
        ]);
      } catch (err) {
        // fallback: keep default stats
        console.error('Error fetching dashboard stats:', err);
      }
    };
    fetchStats();
  }, []);

  // Fetch featured stories from backend
  useEffect(() => {
    const fetchFeaturedStories = async () => {
      try {
        setLoading(true);
        const response = await apiService.stories.getFeatured();
        setFeaturedStories(response.data.stories || response.data || []);
      } catch (err) {
        console.error('Error fetching featured stories:', err);
        const errorInfo = handleApiError(err);
        setError(errorInfo.message);
        
        // Fallback to mock data if API fails
        setFeaturedStories([
          {
            _id: '1',
            title: "Bella's Second Chance",
            excerpt: "Rescued from neglect, Bella found her forever family and now helps other rescue dogs as a therapy companion.",
            featuredImage: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxOCIgZmlsbD0iIzZiNzI4MCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPlJlc2N1ZSBTdG9yeTwvdGV4dD48L3N2Zz4=",
            category: "Success Story",
            slug: "bellas-second-chance"
          },
          {
            _id: '2',
            title: "Emergency Kitten Rescue",
            excerpt: "Five orphaned kittens found shelter during the storm and are now thriving in their new homes.",
            featuredImage: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1zbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxOCIgZmlsbD0iIzZiNzI4MCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPlJlc2N1ZSBTdG9yeTwvdGV4dD48L3N2Zz4=",
            category: "Recent Rescue",
            slug: "emergency-kitten-rescue"
          },
          {
            _id: '3',
            title: "Max's Medical Miracle",
            excerpt: "Thanks to donor support, Max received life-saving surgery and is now running free with his adopted family.",
            featuredImage: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1zbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxOCIgZmlsbD0iIzZiNzI4MCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPlJlc2N1ZSBTdG9yeTwvdGV4dD48L3N2Zz4=",
            category: "Medical Success",
            slug: "maxs-medical-miracle"
          }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedStories();
  }, []);

  // Remove client-side mutation of Animals Rescued.
  // Frontend will display the server-provided `stats.animalsRescued` when available.
  // This avoids per-browser increments. Keep a light fallback value of 107.

  // Handle newsletter subscription
  const handleNewsletterSubmit = async (e) => {
    e.preventDefault();
    if (!newsletterEmail) return;

    try {
      setNewsletterStatus('loading');
      await apiService.newsletter.subscribe(newsletterEmail);
      setNewsletterStatus('success');
      setNewsletterEmail('');
      setTimeout(() => setNewsletterStatus(''), 3000);
    } catch (err) {
      console.error('Newsletter subscription error:', err);
      setNewsletterStatus('error');
      setTimeout(() => setNewsletterStatus(''), 3000);
    }
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-red-600 to-red-800 text-white overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
          <div className="text-center">
            {/* HALT Brand Identity */}
            <div className="mb-8">
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black mb-6 tracking-tight">
                <span className="text-yellow-300">H</span>ALT
                <span className="text-yellow-300">SHELTER</span>
              </h1>
              
              {/* HALT Meaning - Mobile Optimized */}
              <div className="text-base sm:text-lg md:text-xl lg:text-2xl font-semibold text-yellow-100 mb-8 space-y-2">
                <div className="bg-yellow-400/20 backdrop-blur-sm rounded-lg p-4 sm:p-6 max-w-2xl mx-auto">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <div className="flex items-center justify-center gap-3">
                      <span className="bg-yellow-400 text-gray-900 px-3 py-2 rounded-full font-bold text-lg">H</span>
                      <span className="font-bold">elping</span>
                    </div>
                    <div className="flex items-center justify-center gap-3">
                      <span className="bg-yellow-400 text-gray-900 px-3 py-2 rounded-full font-bold text-lg">A</span>
                      <span className="font-bold">nimals</span>
                    </div>
                    <div className="flex items-center justify-center gap-3">
                      <span className="bg-yellow-400 text-gray-900 px-3 py-2 rounded-full font-bold text-lg">L</span>
                      <span className="font-bold">ive &</span>
                    </div>
                    <div className="flex items-center justify-center gap-3">
                      <span className="bg-yellow-400 text-gray-900 px-3 py-2 rounded-full font-bold text-lg">T</span>
                      <span className="font-bold">hrive</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold mb-6">
              Every Animal Deserves a
              <span className="block text-yellow-300">Second Chance at Life</span>
            </h2>
            <p className="text-base sm:text-lg md:text-xl lg:text-2xl mb-8 max-w-4xl mx-auto leading-relaxed">
              We rescue, rehabilitate, and rehome animals in need across our community. 
              Your support saves lives and creates forever families where animals can truly thrive.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center max-w-lg mx-auto">
              <Link 
                to="/donate?recurrence=monthly" 
                className="w-full sm:w-auto bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-bold py-4 px-6 sm:px-8 rounded-lg text-lg transition-all transform hover:scale-105 shadow-lg hover:shadow-xl"
              >
                💝 Donate Now - Save a Life
              </Link>
              <Link 
                to="/stories" 
                className="w-full sm:w-auto border-2 border-white hover:bg-white hover:text-red-600 font-bold py-4 px-6 sm:px-8 rounded-lg text-lg transition-all shadow-lg"
              >
                📖 See Success Stories
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Impact Stats */}
      <section className="py-12 sm:py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              🏆 Our Impact This Year
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-3xl mx-auto">
              Every number represents a life saved, a family made whole, and hope restored through community support
            </p>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center bg-white p-4 sm:p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow">
                <div className="mx-auto w-12 h-12 sm:w-16 sm:h-16 bg-red-100 rounded-full flex items-center justify-center mb-3 sm:mb-4">
                  <stat.icon className="w-6 h-6 sm:w-8 sm:h-8 text-red-600" />
                </div>
                <div className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-1 sm:mb-2">{stat.value}</div>
                <div className="text-xs sm:text-sm md:text-base text-gray-600 leading-tight">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Emergency Banner */}
      <section className="bg-red-600 text-white py-6 sm:py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-center md:text-left">
              <h3 className="text-xl sm:text-2xl font-bold mb-2">🚨 Emergency Rescue Fund</h3>
              <p className="text-red-100 text-sm sm:text-base">
                Critical cases need immediate medical attention. Your emergency donation can save a life today.
              </p>
            </div>
            <Link 
              to="/donate?emergency=true" 
              className="w-full md:w-auto bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-bold py-3 px-6 rounded-lg transition-colors whitespace-nowrap text-center"
            >
              Emergency Donate
            </Link>
          </div>
        </div>
      </section>

      {/* In Action / Recent Rescues & Victories */}
      <section className="py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              � In Action: Recent Rescues & Victories
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-gray-600">
              See how your support powers real-life rescues, medical miracles, and happy endings every week. These are the moments that define our mission.
            </p>
          </div>
          {/* Wrap all conditional blocks in a fragment to fix adjacent JSX error */}
          <>
            {/* Loading State */}
            {loading && (
              <div className="text-center py-8" aria-live="polite">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-red-600" role="status"></div>
                <p className="mt-2 text-gray-600">Loading inspiring stories...</p>
              </div>
            )}
            {/* Error State */}
            {error && !loading && (
              <div className="text-center py-8">
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 max-w-md mx-auto">
                  <p className="text-yellow-800">
                    📶 Having trouble loading stories. Showing our latest updates instead!
                  </p>
                </div>
              </div>
            )}
            {/* Stories Grid */}
            {!loading && (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                {featuredStories.map((story) => (
                  <div key={story._id || story.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow" tabIndex={0} aria-label={`Rescue story: ${story.title}`}>
                    <img 
                      src={story.featuredImage?.url || story.featuredImage || story.image || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1zbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxOCIgZmlsbD0iIzZiNzI4MCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPlJlc2N1ZSBTdG9yeTwvdGV4dD48L3N2Zz4='}
                      alt={story.title}
                      className="w-full h-48 object-cover"
                      onError={(e) => {
                        e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1zbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxOCIgZmlsbD0iIzZiNzI4MCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPlJlc2N1ZSBTdG9yeTwvdGV4dD48L3N2Zz4=';
                      }}
                    />
                  </div>
                ))}
              </div>
            )}
            <div className="flex-1 flex justify-center md:justify-end">
              <img src="https://www.peta.org/wp-content/uploads/2025/08/Charli-August-2025-Group.jpg" alt="Volunteers in action" className="w-40 h-40 rounded-full object-cover shadow-lg border-4 border-yellow-200" />
            </div>
          </>
        </div>
      </section>

      {/* Resources Section */}
      <section className="bg-white py-12 border-t border-gray-100">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6">📚 Resources for Pet Lovers</h2>
          <p className="text-lg text-gray-700 mb-8">Learn more about animal care, adoption, and advocacy. Explore our guides and tips to help you and your pet thrive.</p>
          <div className="flex flex-wrap justify-center gap-6 text-lg">
            <Link to="/blog?category=pet-care" className="bg-blue-50 hover:bg-blue-100 text-blue-800 font-semibold py-3 px-6 rounded-lg border border-blue-200 transition-colors">Pet Care Guides</Link>
            <Link to="/blog?category=adoption-tips" className="bg-green-50 hover:bg-green-100 text-green-800 font-semibold py-3 px-6 rounded-lg border border-green-200 transition-colors">Adoption Tips</Link>
            <Link to="/blog?category=animal-health" className="bg-purple-50 hover:bg-purple-100 text-purple-800 font-semibold py-3 px-6 rounded-lg border border-purple-200 transition-colors">Animal Health</Link>
            <Link to="/blog?category=community-outreach" className="bg-yellow-50 hover:bg-yellow-100 text-yellow-800 font-semibold py-3 px-6 rounded-lg border border-yellow-200 transition-colors">Community Outreach</Link>
            <Link to="/blog" className="bg-gray-50 hover:bg-gray-100 text-gray-800 font-semibold py-3 px-6 rounded-lg border border-gray-200 transition-colors">All Articles</Link>
          </div>
        </div>
      </section>

      {/* Foster & Volunteer Banner */}
      <section className="bg-blue-50 py-10 border-t border-blue-100">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex-1 text-center md:text-left">
            <h2 className="text-2xl sm:text-3xl font-bold text-blue-900 mb-2">🐾 Foster or Volunteer—Change a Life!</h2>
            <p className="text-blue-700 mb-4 max-w-xl">Not ready to adopt? Fostering gives animals a safe, loving home while they wait for adoption. Or, join our amazing team of volunteers and make a difference every day!</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
              <Link to="/foster" className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-colors">Become a Foster</Link>
              <Link to="/volunteer" className="bg-white border border-blue-600 text-blue-700 hover:bg-blue-100 font-bold py-3 px-6 rounded-lg transition-colors">Volunteer With Us</Link>
            </div>
          </div>
          <div className="flex-1 flex justify-center md:justify-end">
            <img src="https://bestfriends.org/sites/default/files/styles/large/public/2025-06/Jennifer-300x300.jpg?itok=L5wgSgQM" alt="Happy foster pet" className="w-40 h-40 rounded-full object-cover shadow-lg border-4 border-blue-200" />
          </div>
        </div>
      </section>

      {/* Support Us & Shop Section */}
      <section className="bg-gray-50 py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              🤝 Support Us & Shop
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-gray-600">
              Every contribution, big or small, helps us save more lives. Show your support or shop for a cause!
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md text-center hover:shadow-lg transition-shadow" tabIndex={0} aria-label="One-Time Donation">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <HeartIcon className="w-6 h-6 sm:w-8 sm:h-8 text-red-600" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">One-Time Donation</h3>
              <p className="text-gray-600 mb-4 text-sm sm:text-base">Make an immediate impact with a one-time gift</p>
              <Link to="/donate?recurrence=monthly" className="text-red-600 hover:text-red-800 font-semibold">
                Donate Now →
              </Link>
            </div>
            <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md text-center hover:shadow-lg transition-shadow" tabIndex={0} aria-label="Monthly Giving">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <UsersIcon className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">Monthly Giving</h3>
              <p className="text-gray-600 mb-4 text-sm sm:text-base">Support our work each month with a recurring donation</p>
              <Link to="/donate?recurrence=monthly" className="text-blue-600 hover:text-blue-800 font-semibold">
                Donate Monthly →
              </Link>
            </div>
            <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md text-center hover:shadow-lg transition-shadow" tabIndex={0} aria-label="Volunteer">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <HomeIcon className="w-6 h-6 sm:w-8 sm:h-8 text-green-600" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">Volunteer</h3>
              <p className="text-gray-600 mb-4 text-sm sm:text-base">Give your time and skills to help animals directly</p>
              <Link to="/volunteer" className="text-green-600 hover:text-green-800 font-semibold">
                Get Involved →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter Signup */}
  <section className="bg-red-600 text-white py-12 sm:py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 flex items-center justify-center gap-2">
            <FaEnvelope className="inline-block mb-1" /> Stay Connected with Our Mission
          </h2>
          <p className="text-base sm:text-lg md:text-xl mb-8 text-red-100">
            Get rescue stories, adoption updates, and ways to help delivered to your inbox
          </p>
          {/* Newsletter Status Messages */}
          {newsletterStatus === 'success' && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg mb-6 max-w-md mx-auto">
              🎉 Thank you for subscribing! You'll hear from us soon.
            </div>
          )}
          {newsletterStatus === 'error' && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-6 max-w-md mx-auto">
              ❌ Something went wrong. Please try again.
            </div>
          )}
          <form onSubmit={handleNewsletterSubmit} className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
            <div className="relative w-full flex-1">
              <FaEnvelope className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input 
                type="email" 
                placeholder="Enter your email"
                value={newsletterEmail}
                onChange={(e) => setNewsletterEmail(e.target.value)}
                className="w-full pl-10 px-4 py-3 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                required
                disabled={newsletterStatus === 'loading'}
              />
            </div>
            <button 
              type="submit"
              disabled={newsletterStatus === 'loading'}
              className="bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-bold px-6 py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {newsletterStatus === 'loading' ? 'Subscribing...' : 'Subscribe'}
            </button>
          </form>
          <p className="text-sm text-red-200 mt-4">
            We respect your privacy. Unsubscribe at any time.
          </p>
        </div>
      </section>

      {/* Social Proof & Community */}
      <section className="bg-white py-12 border-t border-gray-100">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6">Trusted & Celebrated</h2>
          <h3 className="text-lg font-semibold text-gray-700 mb-4">Join Our Community</h3>
          <div className="flex flex-wrap justify-center gap-6 text-2xl">
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="hover:text-blue-600 flex items-center gap-2" aria-label="Facebook">
              <FaFacebook /> Facebook
            </a>
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="hover:text-pink-500 flex items-center gap-2" aria-label="Instagram">
              <FaInstagram /> Instagram
            </a>
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="hover:text-blue-400 flex items-center gap-2" aria-label="Twitter">
              <FaTwitter /> Twitter
            </a>
            <a href="https://tiktok.com" target="_blank" rel="noopener noreferrer" className="hover:text-black flex items-center gap-2" aria-label="TikTok">
              <FaTiktok /> TikTok
            </a>
            <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="hover:text-red-600 flex items-center gap-2" aria-label="YouTube">
              <FaYoutube /> YouTube
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Home;
