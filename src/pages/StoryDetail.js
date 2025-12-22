import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeftIcon, CalendarIcon, ClockIcon, TagIcon, HeartIcon, ShareIcon } from '@heroicons/react/24/outline';
import { apiService, handleApiError } from '../services/api';
import { buildAbsoluteUrl } from '../utils/navigationUtils';

export default function StoryDetail() {
  const { id } = useParams();
  const [story, setStory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [relatedStories, setRelatedStories] = useState([]);

  useEffect(() => {
    const fetchStory = async () => {
      try {
        setLoading(true);
        const response = await apiService.stories.getById(id);
        setStory(response.data.story);
        
        // Fetch related stories
        const relatedResponse = await apiService.stories.getAll();
        const allStories = relatedResponse.data.data || relatedResponse.data || [];
        const related = allStories
          .filter(s => s._id !== id)
          .slice(0, 3);
        setRelatedStories(related);
        
      } catch (err) {
        console.error('Error fetching story:', err);
        const errorInfo = handleApiError(err);
        setError(errorInfo.message);
        
        // Fallback to mock data based on ID
        const mockStory = {
          _id: id,
          title: "Bella's Second Chance",
          slug: 'bellas-second-chance',
          content: `# A Story of Hope and Healing

When Bella first arrived at HALT Shelter, she was barely recognizable as the loving Golden Retriever she was meant to be. Found abandoned and severely neglected, she cowered in the corner of her kennel, afraid of human touch and too weak to stand for long periods.

## The Rescue

Our emergency rescue team received a call about a dog found tied to a tree in the countryside, with no food or water in sight. When we arrived, we found Bella - underweight, dehydrated, and suffering from several untreated medical conditions.

## The Journey

Bella's recovery wasn't easy. It took months of patient care from our veterinary team and volunteers. She needed:

- Immediate medical attention for malnutrition and infections
- Behavioral rehabilitation to overcome fear and anxiety
- Daily exercise and socialization with other dogs
- Lots of love and patience from our dedicated staff

## The Transformation

Today, Bella is a completely different dog. She greets visitors with a wagging tail, loves playing fetch, and has become one of our most beloved ambassadors for rescue dogs. Her gentle nature and resilient spirit inspire everyone who meets her.

## Happy Ending

After 8 months at HALT, Bella found her forever family. The Johnson family fell in love with her immediately, and she now has a large backyard to run in and two children who adore her. Bella's story reminds us why we do this work - every animal deserves a second chance.`,
          category: 'Success Story',
          author: 'HALT Team',
          readTime: 5,
          featuredImage: {
            url: '/images/stories/bella-success.jpg',
            altText: 'Bella the Golden Retriever playing in her new home'
          },
          tags: ['rescue', 'rehabilitation', 'success', 'golden-retriever'],
          publishedAt: new Date('2024-01-15')
        };
        
        setStory(mockStory);
        
        // Mock related stories
        const mockRelated = [
          {
            _id: 'mock-1',
            title: 'Max Finds His Voice',
            slug: 'max-finds-voice',
            excerpt: 'A shy shelter dog learns to trust again through music therapy.',
            category: 'Success Story',
            featuredImage: {
              url: '/images/stories/max-music.jpg',
              altText: 'Max the dog with music therapy volunteer'
            },
            readTime: 3,
            publishedAt: new Date('2024-01-10')
          },
          {
            _id: 'mock-2',
            title: 'Luna\'s Medical Miracle',
            slug: 'lunas-medical-miracle',
            excerpt: 'Advanced surgery saves a young puppy\'s life.',
            category: 'Medical Success',
            featuredImage: {
              url: '/images/stories/luna-surgery.jpg',
              altText: 'Luna recovering after surgery'
            },
            readTime: 4,
            publishedAt: new Date('2024-01-05')
          }
        ];
        setRelatedStories(mockRelated);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchStory();
    }
  }, [id]);

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getImageUrl = (imageObj) => {
    if (!imageObj) return null;
    
    const url = imageObj.url || imageObj;
    
    // If it's already a full URL, return it
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    
    // Relative paths work correctly in same-origin deployment
    return url;
  };

  const handleShare = () => {
    const shareUrl = buildAbsoluteUrl(`/stories/${story._id}`);
    if (navigator.share) {
      navigator.share({
        title: story.title,
        text: story.excerpt || 'Check out this inspiring rescue story from HALT Animal Shelter',
        url: shareUrl,
      });
    } else {
      // Fallback to copying URL to clipboard
      navigator.clipboard.writeText(shareUrl);
      alert('Story URL copied to clipboard!');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen overflow-x-hidden bg-gradient-to-br from-blue-50 via-white to-green-50">
        <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
            <div className="h-64 bg-gray-200 rounded-lg mb-8"></div>
            <div className="h-12 bg-gray-200 rounded w-3/4 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
            <div className="space-y-4">
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-5/6"></div>
              <div className="h-4 bg-gray-200 rounded w-4/6"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen overflow-x-hidden bg-gradient-to-br from-blue-50 via-white to-green-50">
        <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <Link
            to="/stories"
            className="inline-flex items-center text-blue-600 hover:text-blue-700 transition-colors duration-200 mb-8 group"
          >
            <ArrowLeftIcon className="h-5 w-5 mr-2 group-hover:-translate-x-1 transition-transform duration-200" />
            Back to Stories
          </Link>
          
          <div className="bg-red-50 border border-red-200 rounded-lg p-8 text-center">
            <div className="text-red-600 text-lg font-semibold mb-2">Story Not Found</div>
            <p className="text-red-600 mb-4">{error}</p>
            <Link
              to="/stories"
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
            >
              Browse All Stories
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!story) {
    return (
      <div className="min-h-screen overflow-x-hidden bg-gradient-to-br from-blue-50 via-white to-green-50">
        <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <div className="text-gray-600 text-lg">Story not found</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen overflow-x-hidden bg-gradient-to-br from-blue-50 via-white to-green-50">
      <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Back Navigation */}
        <Link
          to="/stories"
          className="inline-flex items-center text-blue-600 hover:text-blue-700 transition-colors duration-200 mb-8 group"
        >
          <ArrowLeftIcon className="h-5 w-5 mr-2 group-hover:-translate-x-1 transition-transform duration-200" />
          Back to Stories
        </Link>

        {/* Story Header */}
        <header className="mb-8">
          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-4">
            <span className="inline-flex items-center px-3 py-1 rounded-full bg-blue-100 text-blue-700 font-medium">
              <TagIcon className="h-4 w-4 mr-1" />
              {story.category}
            </span>
            <span className="inline-flex items-center">
              <CalendarIcon className="h-4 w-4 mr-1" />
              {formatDate(story.publishedAt)}
            </span>
            <span className="inline-flex items-center">
              <ClockIcon className="h-4 w-4 mr-1" />
              {story.readTime} min read
            </span>
            {story.author && (
              <span>By {typeof story.author === 'string' ? story.author : story.author.firstName + ' ' + story.author.lastName}</span>
            )}
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight">
            {story.title}
          </h1>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {story.tags && story.tags.map((tag, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                >
                  #{typeof tag === 'string' ? tag : tag.name || tag}
                </span>
              ))}
            </div>
            
            <button
              onClick={handleShare}
              className="inline-flex items-center px-4 py-2 text-blue-600 hover:text-blue-700 transition-colors duration-200"
            >
              <ShareIcon className="h-5 w-5 mr-2" />
              Share
            </button>
          </div>
        </header>

        {/* Featured Image */}
        {story.featuredImage && (
          <div className="mb-8">
            <img
              src={story.featuredImage.url || story.featuredImage}
              alt={story.featuredImage.altText || story.title}
              className="w-full h-64 md:h-96 object-cover rounded-xl shadow-lg"
              onError={(e) => {
                e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxOCIgZmlsbD0iIzZiNzI4MCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPlJlc2N1ZSBTdG9yeTwvdGV4dD48L3N2Zz4=';
              }}
            />
          </div>
        )}

        {/* Story Content */}
        <article className="prose prose-lg max-w-none mb-12">
          <div 
            className="text-gray-700 leading-relaxed"
            dangerouslySetInnerHTML={{ 
              __html: story.content?.replace(/\n/g, '<br />') || story.excerpt || ''
            }}
          />
        </article>

        {/* Call to Action */}
        <div className="bg-gradient-to-r from-blue-600 to-green-600 rounded-xl p-8 text-white text-center mb-12">
          <HeartIcon className="h-12 w-12 mx-auto mb-4 opacity-80" />
          <h3 className="text-2xl font-bold mb-4">Inspired by This Story?</h3>
          <p className="text-lg mb-6 opacity-90">
            You can help us save more animals like {story.title.split("'")[0] || 'this one'}. 
            Every donation, no matter the size, makes a difference in an animal's life.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/donate"
              className="px-8 py-3 bg-white text-blue-600 rounded-lg font-semibold hover:bg-gray-100 transition-colors duration-200"
            >
              Donate Now
            </Link>
            <Link
              to="/volunteer"
              className="px-8 py-3 border-2 border-white text-white rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors duration-200"
            >
              Volunteer with Us
            </Link>
          </div>
        </div>

        {/* Related Stories */}
        {relatedStories.length > 0 && (
          <section>
            <h2 className="text-3xl font-bold text-gray-900 mb-8">More Inspiring Stories</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {relatedStories.map((relatedStory) => (
                <Link
                  key={relatedStory._id}
                  to={`/stories/${relatedStory.slug || relatedStory._id}`}
                  className="group bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                >
                  <div className="aspect-video bg-gray-200 overflow-hidden">
                    <img
                      src={relatedStory.featuredImage?.url || relatedStory.featuredImage || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxOCIgZmlsbD0iIzZiNzI4MCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPlJlc2N1ZSBTdG9yeTwvdGV4dD48L3N2Zz4='}
                      alt={relatedStory.featuredImage?.altText || relatedStory.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxOCIgZmlsbD0iIzZiNzI4MCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPlJlc2N1ZSBTdG9yeTwvdGV4dD48L3N2Zz4=';
                      }}
                    />
                  </div>
                  <div className="p-6">
                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                      <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs">
                        {relatedStory.category}
                      </span>
                      <span className="flex items-center">
                        <ClockIcon className="h-3 w-3 mr-1" />
                        {relatedStory.readTime} min
                      </span>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors duration-200">
                      {relatedStory.title}
                    </h3>
                    <p className="text-gray-600 text-sm line-clamp-2">
                      {relatedStory.excerpt}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
