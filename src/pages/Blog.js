import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  CalendarIcon,
  UserIcon,
  ClockIcon,
  TagIcon,
  EyeIcon,
  ChevronLeftIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline';
import { getPageData } from '../utils/navigationUtils';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
const SERVER_BASE_URL = process.env.REACT_APP_SERVER_URL || 'http://localhost:5000';

export default function Blog() {
  const [blogs, setBlogs] = useState([]);
  const [featuredBlogs, setFeaturedBlogs] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 9,
    total: 0,
    pages: 0
  });

  const categoryLabels = {
    'pet-care': 'Pet Care',
    'adoption-tips': 'Adoption Tips',
    'animal-health': 'Animal Health',
    'success-stories': 'Success Stories',
    'shelter-updates': 'Shelter Updates',
    'volunteer-spotlights': 'Volunteer Spotlights',
    'fundraising-events': 'Fundraising Events',
    'community-outreach': 'Community Outreach',
    'educational': 'Educational',
    'announcements': 'Announcements'
  };

  useEffect(() => {
    // Check if category was passed via navigationUtils
    const pageData = getPageData('/blog');
    if (pageData && pageData.category) {
      setSelectedCategory(pageData.category);
    }
    
    // Also check URL params for backwards compatibility
    const urlParams = new URLSearchParams(window.location.search);
    const urlCategory = urlParams.get('category');
    if (urlCategory) {
      setSelectedCategory(urlCategory);
    }
    
    fetchBlogs();
    fetchFeaturedBlogs();
    fetchCategories();
  }, [selectedCategory, searchTerm, pagination.page]);

  const fetchBlogs = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        status: 'published'
      });

      if (selectedCategory) params.append('category', selectedCategory);
      if (searchTerm) params.append('search', searchTerm);

      const response = await fetch(`${API_BASE_URL}/blog?${params}`);
      const data = await response.json();

      if (data.success) {
        setBlogs(data.data);
        setPagination(prev => ({
          ...prev,
          total: data.pagination.total,
          pages: data.pagination.pages
        }));
      }
    } catch (error) {
      console.error('Error fetching blogs:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchFeaturedBlogs = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/blog/featured`);
      const data = await response.json();

      if (data.success) {
        setFeaturedBlogs(data.data);
      }
    } catch (error) {
      console.error('Error fetching featured blogs:', error);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/blog/categories`);
      const data = await response.json();

      if (data.success) {
        // Extract just the category names from the response
        const categoryNames = data.data.map(item => item.category);
        setCategories(categoryNames);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const calculateReadTime = (content) => {
    if (!content || typeof content !== 'string') {
      return 1; // Default to 1 minute if content is undefined/null
    }
    const wordsPerMinute = 200;
    const wordCount = content.split(' ').length;
    return Math.ceil(wordCount / wordsPerMinute);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPagination(prev => ({ ...prev, page: 1 }));
    fetchBlogs();
  };

  const BlogCard = ({ blog, featured = false }) => (
    <article className={`bg-white rounded-xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${featured ? 'md:col-span-2' : ''}`}>
      {blog.featuredImage?.url && (
        <div className={`relative ${featured ? 'h-64' : 'h-48'} overflow-hidden`}>
          <img
            src={`${SERVER_BASE_URL}${blog.featuredImage.url}`}
            alt={blog.featuredImage.alt || blog.title}
            className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
          />
          {blog.isFeatured && (
            <div className="absolute top-4 left-4">
              <span className="bg-yellow-500 text-white px-3 py-1 rounded-full text-xs font-medium flex items-center">
                <TagIcon className="w-3 h-3 mr-1" />
                Featured
              </span>
            </div>
          )}
          <div className="absolute top-4 right-4">
            <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-medium">
              {categoryLabels[blog.category] || blog.category}
            </span>
          </div>
        </div>
      )}
      
      <div className="p-6">
        <div className="flex items-center text-sm text-gray-500 mb-3">
          <CalendarIcon className="w-4 h-4 mr-1" />
          <span className="mr-4">{formatDate(blog.publishedAt || blog.createdAt)}</span>
          <UserIcon className="w-4 h-4 mr-1" />
          <span className="mr-4">{blog.author?.name || 'HALT Team'}</span>
          <ClockIcon className="w-4 h-4 mr-1" />
          <span>{calculateReadTime(blog.content)} min read</span>
          {blog.views > 0 && (
            <>
              <EyeIcon className="w-4 h-4 mr-1 ml-4" />
              <span>{blog.views} views</span>
            </>
          )}
        </div>

        <h2 className={`font-bold text-gray-900 mb-3 line-clamp-2 ${featured ? 'text-2xl' : 'text-xl'}`}>
          <Link 
            to={`/blog/${blog.slug}`}
            className="hover:text-primary-600 transition-colors duration-200"
          >
            {blog.title}
          </Link>
        </h2>

        <p className="text-gray-600 mb-4 line-clamp-3">
          {blog.excerpt}
        </p>

        {blog.tags && blog.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {blog.tags.slice(0, 3).map((tag, index) => (
              <span
                key={index}
                className="bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-xs font-medium"
              >
                {tag}
              </span>
            ))}
            {blog.tags.length > 3 && (
              <span className="text-gray-500 text-xs">+{blog.tags.length - 3} more</span>
            )}
          </div>
        )}

        <Link
          to={`/blog/${blog.slug}`}
          className="inline-flex items-center text-primary-600 hover:text-primary-700 font-medium transition-colors duration-200"
        >
          Read More
          <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      </div>
    </article>
  );

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary-600 to-primary-800 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              HALT Shelter Blog
            </h1>
            <p className="text-xl text-primary-100 max-w-3xl mx-auto">
              Stories, tips, and insights from our animal rescue community. 
              Learn about pet care, adoption, and how you can make a difference.
            </p>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Search and Filters */}
        <div className="mb-12">
          <div className="flex flex-col md:flex-row gap-6 items-center justify-between">
            {/* Search */}
            <form onSubmit={handleSearch} className="flex-1 max-w-md">
              <div className="relative">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search blog posts..."
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>
            </form>

            {/* Category Filter */}
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => {
                  setSelectedCategory('');
                  setPagination(prev => ({ ...prev, page: 1 }));
                }}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  selectedCategory === '' 
                    ? 'bg-primary-600 text-white' 
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                All Categories
              </button>
              {categories.map(category => (
                <button
                  key={category}
                  onClick={() => {
                    setSelectedCategory(category);
                    setPagination(prev => ({ ...prev, page: 1 }));
                  }}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    selectedCategory === category 
                      ? 'bg-primary-600 text-white' 
                      : 'bg-white text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {categoryLabels[category] || category}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Featured Posts */}
        {featuredBlogs.length > 0 && !selectedCategory && !searchTerm && (
          <section className="mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">Featured Stories</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {featuredBlogs.slice(0, 3).map(blog => (
                <BlogCard key={blog._id} blog={blog} featured={featuredBlogs.indexOf(blog) === 0} />
              ))}
            </div>
          </section>
        )}

        {/* Main Blog Grid */}
        <section>
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-gray-900">
              {selectedCategory ? `${categoryLabels[selectedCategory]} Posts` : 'Latest Posts'}
            </h2>
            <div className="text-sm text-gray-500">
              {pagination.total} {pagination.total === 1 ? 'post' : 'posts'} found
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
            </div>
          ) : blogs.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-gray-400 mb-4">
                <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No blog posts found</h3>
              <p className="text-gray-500">
                {selectedCategory || searchTerm 
                  ? 'Try adjusting your filters or search terms.' 
                  : 'Check back soon for new content!'
                }
              </p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {blogs.map(blog => (
                  <BlogCard key={blog._id} blog={blog} />
                ))}
              </div>

              {/* Pagination */}
              {pagination.pages > 1 && (
                <div className="mt-12 flex items-center justify-center">
                  <nav className="flex items-center space-x-2">
                    <button
                      onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                      disabled={pagination.page === 1}
                      className="p-2 rounded-lg border border-gray-300 text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronLeftIcon className="w-5 h-5" />
                    </button>
                    
                    {Array.from({ length: pagination.pages }, (_, i) => i + 1).map(page => (
                      <button
                        key={page}
                        onClick={() => setPagination(prev => ({ ...prev, page }))}
                        className={`px-4 py-2 rounded-lg ${
                          page === pagination.page
                            ? 'bg-primary-600 text-white'
                            : 'text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        {page}
                      </button>
                    ))}
                    
                    <button
                      onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                      disabled={pagination.page === pagination.pages}
                      className="p-2 rounded-lg border border-gray-300 text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronRightIcon className="w-5 h-5" />
                    </button>
                  </nav>
                </div>
              )}
            </>
          )}
        </section>
      </div>
    </main>
  );
}
