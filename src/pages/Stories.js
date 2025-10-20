import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BookOpenIcon, HeartIcon, ClockIcon, TagIcon } from '@heroicons/react/24/outline';
import { apiService, handleApiError } from '../services/api';

export default function Stories() {
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const categories = [
    { id: 'all', name: 'All Stories', icon: BookOpenIcon },
    { id: 'Success Story', name: 'Success Stories', icon: HeartIcon },
    { id: 'Recent Rescue', name: 'Recent Rescues', icon: ClockIcon },
    { id: 'Medical Success', name: 'Medical Miracles', icon: TagIcon },
    { id: 'News', name: 'News & Updates', icon: BookOpenIcon },
    { id: 'Foster Story', name: 'Foster Stories', icon: HeartIcon },
    { id: 'Volunteer Spotlight', name: 'Volunteer Spotlight', icon: TagIcon }
  ];

  // Fetch stories from backend
  useEffect(() => {
    const fetchStories = async () => {
      try {
        setLoading(true);
        // Always request all stories (set a high limit)
        const response = await apiService.stories.getAll({ limit: 100 });
        console.log('API Response:', response.data); // Debug log
        console.log('Stories data:', response.data.data); // Debug log
        setStories(response.data.data || []);
      } catch (err) {
        console.error('Error fetching stories:', err);
        const errorInfo = handleApiError(err);
        setError(errorInfo.message);
        // Fallback to mock data if API fails
        setStories([
          {
            _id: '1',
            title: "Bella's Second Chance",
            slug: 'bellas-second-chance',
            excerpt: "Rescued from neglect, Bella found her forever family and now helps other rescue dogs as a therapy companion.",
            featuredImage: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxOCIgZmlsbD0iIzZiNzI4MCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPlJlc2N1ZSBTdG9yeTwvdGV4dD48L3N2Zz4=",
            category: 'Success Story',
            publishedAt: '2024-01-15',
            readTime: 5,
            tags: ['rescue', 'therapy', 'success']
          },
          {
            _id: '2',
            title: "Emergency Kitten Rescue",
            slug: 'emergency-kitten-rescue',
            excerpt: "Five orphaned kittens found shelter during the storm and are now thriving in their new homes.",
            featuredImage: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxOCIgZmlsbD0iIzZiNzI4MCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPlJlc2N1ZSBTdG9yeTwvdGV4dD48L3N2Zz4=",
            category: 'Recent Rescue',
            publishedAt: '2024-01-10',
            readTime: 3,
            tags: ['kittens', 'emergency', 'storm']
          },
          {
            _id: '3',
            title: "Max's Medical Miracle",
            slug: 'maxs-medical-miracle',
            excerpt: "Thanks to donor support, Max received life-saving surgery and is now running free with his adopted family.",
            featuredImage: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxOCIgZmlsbD0iIzZiNzI4MCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPlJlc2N1ZSBTdG9yeTwvdGV4dD48L3N2Zz4=",
            category: 'Medical Success',
            publishedAt: '2024-01-05',
            readTime: 7,
            tags: ['surgery', 'medical', 'donation']
          },
          {
            _id: '4',
            title: "Luna's Journey Home",
            slug: 'lunas-journey-home',
            excerpt: "After months of rehabilitation, Luna overcame her fear of humans and found a patient, loving family.",
            featuredImage: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxOCIgZmlsbD0iIzZiNzI4MCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPlJlc2N1ZSBTdG9yeTwvdGV4dD48L3N2Zz4=",
            category: 'Foster Story',
            publishedAt: '2024-01-01',
            readTime: 6,
            tags: ['rehabilitation', 'fear', 'patience']
          },
          {
            _id: '5',
            title: "Rescue Operation: Highway Heroes",
            slug: 'highway-heroes',
            excerpt: "A coordinated rescue effort saved 12 animals from an abandoned property along the interstate.",
            featuredImage: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxOCIgZmlsbD0iIzZiNzI4MCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPlJlc2N1ZSBTdG9yeTwvdGV4dD48L3N2Zz4=",
            category: 'News',
            publishedAt: '2023-12-28',
            readTime: 8,
            tags: ['large-rescue', 'coordination', 'interstate']
          },
          {
            _id: '6',
            title: "Charlie's Cancer Battle",
            slug: 'charlies-cancer-battle',
            excerpt: "With cutting-edge treatment and community support, Charlie beat cancer and inspired our medical program.",
            featuredImage: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxOCIgZmlsbD0iIzZiNzI4MCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPlJlc2N1ZSBTdG9yeTwvdGV4dD48L3N2Zz4=",
            category: 'medical',
            publishedAt: '2023-12-20',
            readTime: 10,
            tags: ['cancer', 'treatment', 'medical-program']
          }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchStories();
  }, []);

  // Filter stories based on category and search
  const filteredStories = stories.filter(story => {
    const matchesCategory = selectedCategory === 'all' || story.category === selectedCategory;
    const matchesSearch = story.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         story.excerpt.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (story.tags && story.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())));
    
    // Debug logging
    if (selectedCategory !== 'all') {
      console.log(`Story: ${story.title}, Category: "${story.category}", Selected: "${selectedCategory}", Matches: ${matchesCategory}`);
    }
    
    return matchesCategory && matchesSearch;
  });

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const getCategoryColor = (category) => {
    switch (category) {
      case 'Success Story': return 'bg-green-100 text-green-800';
      case 'Recent Rescue': return 'bg-blue-100 text-blue-800';
      case 'Medical Success': return 'bg-purple-100 text-purple-800';
      case 'Foster Story': return 'bg-yellow-100 text-yellow-800';
      case 'Volunteer Spotlight': return 'bg-pink-100 text-pink-800';
      case 'News': return 'bg-indigo-100 text-indigo-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-red-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              📚 Stories of Hope & Healing
            </h1>
            <p className="text-xl md:text-2xl text-red-100 max-w-3xl mx-auto">
              Every rescue tells a story of transformation. Discover how your support creates miracles and changes lives forever.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Filters and Search */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            {/* Category Filters */}
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => {
                const Icon = category.icon;
                return (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`flex items-center px-4 py-2 rounded-full font-semibold transition-colors ${
                      selectedCategory === category.id
                        ? 'bg-red-600 text-white'
                        : 'bg-white text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <Icon className="w-4 h-4 mr-2" />
                    {category.name}
                  </button>
                );
              })}
            </div>

            {/* Search */}
            <div className="lg:w-64">
              <input
                type="text"
                placeholder="Search stories..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
            <p className="mt-2 text-gray-600">Loading inspiring stories...</p>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="text-center py-12">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 max-w-md mx-auto">
              <p className="text-yellow-800">
                📶 Having trouble loading stories from our database. Showing some of our favorite rescue stories instead!
              </p>
            </div>
          </div>
        )}

        {/* Stories Grid */}
        {!loading && (
          <>
            {filteredStories.length === 0 ? (
              <div className="text-center py-12">
                <BookOpenIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No Stories Found</h3>
                <p className="text-gray-600">
                  {searchTerm ? `No stories match "${searchTerm}"` : 'No stories in this category yet.'}
                </p>
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="mt-4 text-red-600 hover:text-red-800 font-semibold"
                  >
                    Clear search
                  </button>
                )}
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {filteredStories.map((story) => (
                    <article key={story._id} className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
                      <div className="aspect-w-16 aspect-h-10">
                        <img 
                          src={story.featuredImage?.url || story.featuredImage || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxOCIgZmlsbD0iIzZiNzI4MCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPlJlc2N1ZSBTdG9yeTwvdGV4dD48L3N2Zz4='} 
                          alt={story.featuredImage?.altText || story.title}
                          className="w-full h-48 object-cover"
                          onError={(e) => {
                            e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxOCIgZmlsbD0iIzZiNzI4MCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPlJlc2N1ZSBTdG9yeTwvdGV4dD48L3N2Zz4=';
                          }}
                        />
                      </div>
                      
                      <div className="p-6">
                        <div className="flex items-center justify-between mb-3">
                          <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getCategoryColor(story.category)}`}>
                            {story.category.charAt(0).toUpperCase() + story.category.slice(1)}
                          </span>
                          {story.readTime && (
                            <span className="text-xs text-gray-500 flex items-center">
                              <ClockIcon className="w-3 h-3 mr-1" />
                              {story.readTime} min read
                            </span>
                          )}
                        </div>
                        
                        <h2 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2">
                          {story.title}
                        </h2>
                        
                        <p className="text-gray-600 mb-4 line-clamp-3">
                          {story.excerpt}
                        </p>
                        
                        {story.tags && story.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mb-4">
                            {story.tags.slice(0, 3).map((tag, index) => (
                              <span 
                                key={index}
                                className="inline-block bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded"
                              >
                                #{tag}
                              </span>
                            ))}
                          </div>
                        )}
                        
                        <div className="flex items-center justify-between">
                          <Link 
                            to={`/stories/${story.slug || story._id}`}
                            className="inline-block bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
                          >
                            Read Story →
                          </Link>
                          
                          {story.publishedAt && (
                            <span className="text-xs text-gray-500">
                              {formatDate(story.publishedAt)}
                            </span>
                          )}
                        </div>
                      </div>
                    </article>
                  ))}
                </div>

                {/* Results Count */}
                <div className="mt-8 text-center text-gray-600">
                  Showing {filteredStories.length} of {stories.length} stories
                  {selectedCategory !== 'all' && ` in ${categories.find(c => c.id === selectedCategory)?.name}`}
                  {searchTerm && ` matching "${searchTerm}"`}
                </div>
              </>
            )}
          </>
        )}

        {/* Call to Action */}
        <div className="mt-16 bg-red-600 text-white rounded-lg p-8 text-center">
          <h3 className="text-2xl font-bold mb-4">Help Us Write More Happy Endings</h3>
          <p className="text-red-100 mb-6 text-lg">
            Every donation helps us rescue more animals and create more success stories like these.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/donate"
              className="bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-bold py-3 px-6 rounded-lg transition-colors"
            >
              💝 Donate Now
            </Link>
            <Link
              to="/volunteer"
              className="border-2 border-white hover:bg-white hover:text-red-600 font-bold py-3 px-6 rounded-lg transition-colors"
            >
              🤝 Volunteer
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
