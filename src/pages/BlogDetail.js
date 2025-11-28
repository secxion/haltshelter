import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  CalendarIcon,
  UserIcon,
  ClockIcon,
  TagIcon,
  EyeIcon,
  ShareIcon,
  ArrowLeftIcon,
  HeartIcon
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';
import { apiService } from '../services/api';

export default function BlogDetail() {
  const { slug } = useParams();
  const [blog, setBlog] = useState(null);
  const [relatedBlogs, setRelatedBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [liked, setLiked] = useState(false);
  const [likes, setLikes] = useState(0);
  const [isLiking, setIsLiking] = useState(false);

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
    if (slug) {
      // fetchBlog and incrementViews are stable enough for this usage
      fetchBlog();
      incrementViews();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  useEffect(() => {
    if (blog) {
      // fetchRelatedBlogs depends on `blog` state; this is intentionally
      // omitted from exhaustive deps to avoid redefining the callback.
      fetchRelatedBlogs();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [blog]);

  const fetchBlog = async () => {
    try {
      setLoading(true);
      const { data } = await apiService.blog.getBySlug(slug);
      if (data && data.success) {
        setBlog(data.data);
        setLikes(data.data.likes || 0);

        // Check if user has liked this post (local cache)
        const likedPosts = JSON.parse(localStorage.getItem('likedPosts') || '[]');
        setLiked(likedPosts.includes(data.data._id));
      } else {
        console.error('Blog not found');
      }
    } catch (error) {
      console.error('Error fetching blog:', error);
    } finally {
      setLoading(false);
    }
  };

  const incrementViews = async () => {
    try {
      await apiService.blog.incrementView(slug);
    } catch (error) {
      console.error('Error incrementing views:', error);
    }
  };

  const fetchRelatedBlogs = async () => {
    try {
      const API_BASE = process.env.REACT_APP_API_URL || '/api';
      const response = await fetch(`${API_BASE}/blog?category=${blog.category}&limit=3`);
      const data = await response.json();

      if (data.success) {
        // Filter out the current blog from related blogs
        const filtered = data.data.filter(relatedBlog => relatedBlog._id !== blog._id);
        setRelatedBlogs(filtered.slice(0, 3));
      }
    } catch (error) {
      console.error('Error fetching related blogs:', error);
    }
  };

  const handleLike = async () => {
    if (!blog) return;

    // Keep previous state to support rollback on error
    const prevLiked = liked;
    const prevLikes = likes;

    // Optimistic UI update
    const newLiked = !liked;
    setLiked(newLiked);
    setLikes(prev => newLiked ? prev + 1 : Math.max(0, prev - 1));

    // Attempt to post to server; if there's an auth token apiService will include it
    try {
      setIsLiking(true);
      const res = await apiService.blog.like(blog._id);
      if (res.data && res.data.success) {
        // sync likes from server
        setLikes(res.data.likes);

        // Update local cache for anonymous users or to remember client-side
        const likedPosts = JSON.parse(localStorage.getItem('likedPosts') || '[]');
        if (res.data.added) {
          if (!likedPosts.includes(blog._id)) likedPosts.push(blog._id);
        } else if (res.data.removed) {
          const idx = likedPosts.indexOf(blog._id);
          if (idx > -1) likedPosts.splice(idx, 1);
        }
        localStorage.setItem('likedPosts', JSON.stringify(likedPosts));
      } else {
        // server indicated not-success; rollback optimistic
        setLiked(prevLiked);
        setLikes(prevLikes);
      }
    } catch (err) {
      // On error, rollback optimistic change
      setLiked(prevLiked);
      setLikes(prevLikes);
      console.error('Error liking post:', err);
    }
    finally {
      setIsLiking(false);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: blog.title,
          text: blog.excerpt,
          url: window.location.href,
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      // Fallback to copying URL to clipboard
      navigator.clipboard.writeText(window.location.href);
      alert('URL copied to clipboard!');
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
    const wordsPerMinute = 200;
    const wordCount = content.split(' ').length;
    return Math.ceil(wordCount / wordsPerMinute);
  };

  const formatContent = (content) => {
    // Simple content formatting - in a real app, you might want to use a proper markdown parser
    return content
      .split('\n\n')
      .map((paragraph, index) => (
        <p key={index} className="mb-4 text-gray-700 leading-relaxed">
          {paragraph}
        </p>
      ));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (!blog) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Blog Post Not Found</h1>
          <p className="text-gray-600 mb-8">The blog post you're looking for doesn't exist.</p>
          <Link
            to="/blog"
            className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            <ArrowLeftIcon className="w-4 h-4 mr-2" />
            Back to Blog
          </Link>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Back Navigation */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link
            to="/blog"
            className="inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeftIcon className="w-4 h-4 mr-2" />
            Back to Blog
          </Link>
        </div>
      </div>

      <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <header className="mb-8">
          <div className="mb-4">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
              {categoryLabels[blog.category] || blog.category}
            </span>
            {blog.isFeatured && (
              <span className="ml-2 inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
                <TagIcon className="w-3 h-3 mr-1" />
                Featured
              </span>
            )}
          </div>

          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight">
            {blog.title}
          </h1>

          <p className="text-xl text-gray-600 mb-6 leading-relaxed">
            {blog.excerpt}
          </p>

          <div className="flex flex-wrap items-center gap-6 text-sm text-gray-500 mb-6">
            <div className="flex items-center">
              <CalendarIcon className="w-4 h-4 mr-1" />
              <span>{formatDate(blog.publishedAt || blog.createdAt)}</span>
            </div>
            <div className="flex items-center">
              <UserIcon className="w-4 h-4 mr-1" />
              <span>{blog.author?.name || 'HALT Team'}</span>
            </div>
            <div className="flex items-center">
              <ClockIcon className="w-4 h-4 mr-1" />
              <span>{calculateReadTime(blog.content)} min read</span>
            </div>
            <div className="flex items-center">
              <EyeIcon className="w-4 h-4 mr-1" />
              <span>{blog.views || 0} views</span>
            </div>
          </div>

          {/* Social Actions */}
          <div className="flex items-center gap-4">
            <button
              onClick={handleLike}
              disabled={isLiking}
              aria-busy={isLiking}
              aria-pressed={liked}
              aria-label={liked ? 'Unlike post' : 'Like post'}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                liked 
                  ? 'bg-red-50 text-red-600 hover:bg-red-100' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              } ${isLiking ? 'opacity-60 cursor-not-allowed' : ''}`}
            >
              {liked ? (
                <HeartSolidIcon className="w-5 h-5" aria-hidden="true" />
              ) : (
                <HeartIcon className="w-5 h-5" aria-hidden="true" />
              )}
              <span aria-live="polite">{likes}</span>
            </button>
            <button
              onClick={handleShare}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <ShareIcon className="w-5 h-5" />
              <span>Share</span>
            </button>
          </div>
        </header>

        {/* Featured Image */}
        {blog.featuredImage?.url && (
          <div className="mb-8">
            <img
              src={blog.featuredImage.url}
              alt={blog.featuredImage.alt || blog.title}
              className="w-full h-64 md:h-96 object-cover rounded-xl shadow-lg"
            />
            {blog.featuredImage.caption && (
              <p className="text-sm text-gray-500 text-center mt-2 italic">
                {blog.featuredImage.caption}
              </p>
            )}
          </div>
        )}

        {/* Content */}
        <div className="prose prose-lg max-w-none mb-12">
          {formatContent(blog.content)}
        </div>

        {/* Tags */}
        {blog.tags && blog.tags.length > 0 && (
          <div className="mb-12">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Tags</h3>
            <div className="flex flex-wrap gap-2">
              {blog.tags.map((tag, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors cursor-pointer"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Author Info */}
        {blog.author && (
          <div className="bg-white rounded-xl p-6 mb-12 shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-12 w-12 bg-primary-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-lg">
                    {blog.author.name?.charAt(0) || 'A'}
                  </span>
                </div>
              </div>
              <div className="ml-4">
                <h4 className="text-lg font-semibold text-gray-900">{blog.author.name}</h4>
                <p className="text-gray-600">HALT Shelter Team</p>
              </div>
            </div>
          </div>
        )}

        {/* Related Posts */}
        {relatedBlogs.length > 0 && (
          <section className="border-t border-gray-200 pt-12">
            <h3 className="text-2xl font-bold text-gray-900 mb-8">Related Posts</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {relatedBlogs.map(relatedBlog => (
                <article key={relatedBlog._id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                  {relatedBlog.featuredImage?.url && (
                    <div className="h-48 overflow-hidden">
                      <img
                        src={relatedBlog.featuredImage.url}
                        alt={relatedBlog.featuredImage.alt || relatedBlog.title}
                        className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                      />
                    </div>
                  )}
                  <div className="p-6">
                    <div className="flex items-center text-sm text-gray-500 mb-3">
                      <CalendarIcon className="w-4 h-4 mr-1" />
                      <span>{formatDate(relatedBlog.publishedAt || relatedBlog.createdAt)}</span>
                    </div>
                    <h4 className="font-bold text-gray-900 mb-2 line-clamp-2">
                      <Link 
                        to={`/blog/${relatedBlog.slug}`}
                        className="hover:text-primary-600 transition-colors"
                      >
                        {relatedBlog.title}
                      </Link>
                    </h4>
                    <p className="text-gray-600 text-sm line-clamp-3">
                      {relatedBlog.excerpt}
                    </p>
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}
      </article>
    </main>
  );
}
