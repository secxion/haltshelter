import React, { useState, useEffect } from 'react';
import {
  DocumentTextIcon,
  PhotoIcon,
  UsersIcon,
  CurrencyDollarIcon,
  EyeIcon,
  HeartIcon
} from '@heroicons/react/24/outline';
import SystemStatus from '../components/SystemStatus';
import SponsorsManager from '../components/SponsorsManager/SponsorsManager';
import { API_BASE_URL } from '../config';

const Dashboard = () => {
  const [stats, setStats] = useState({
    stories: 0,
    animals: 0,
    volunteers: 0,
    donations: 0
  });
  const [animalBreakdown, setAnimalBreakdown] = useState({});
  const [recentStories, setRecentStories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      console.log('🔄 Fetching dashboard data...');
      
      // Fetch all counts in parallel using direct count endpoints
      const [storiesResponse, animalsResponse, volunteersResponse, donationsResponse] = await Promise.all([
        fetch(`${API_BASE_URL}/stories/count`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
            'Content-Type': 'application/json'
          }
        }),
        fetch(`${API_BASE_URL}/animals/count`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
            'Content-Type': 'application/json'
          }
        }),
        fetch(`${API_BASE_URL}/volunteers/count`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
            'Content-Type': 'application/json'
          }
        }),
        fetch(`${API_BASE_URL}/donations/count`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
            'Content-Type': 'application/json'
          }
        })
      ]);
      
      const [storiesData, animalsData, volunteersData, donationsData] = await Promise.all([
        storiesResponse.json(),
        animalsResponse.json(),
        volunteersResponse.json(),
        donationsResponse.json()
      ]);
      
      // Set stats with direct values from each API's count endpoint
      setStats({
        stories: storiesData.count || 0,
        animals: animalsData.count || 0,
        volunteers: volunteersData.count || 0,
        donations: donationsData.count || 0
      });
      console.log('✅ Stats state updated successfully');
      
      // Fetch animal breakdown stats
      const animalStatsResponse = await fetch(`${API_BASE_URL}/admin/animals/stats/breakdown`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (animalStatsResponse.ok) {
        const animalStatsData = await animalStatsResponse.json();
        console.log('🐾 Animal breakdown data:', animalStatsData);
        setAnimalBreakdown(animalStatsData);
      }

      // Get recent stories for the activity section
      const recentStoriesResponse = await fetch(`${API_BASE_URL}/stories`);
      const recentStoriesData = await recentStoriesResponse.json();
      setRecentStories((recentStoriesData.data || []).slice(0, 3));
      
    } catch (error) {
      console.error('❌ Error fetching dashboard data:', error);
      // Fallback to basic data
      setStats({
        stories: 0,
        animals: 0,
        volunteers: 0,
        donations: 0
      });
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      name: 'Total Stories',
      value: stats.stories,
      icon: DocumentTextIcon,
      color: 'bg-blue-500'
    },
    {
      name: 'Animals in Care',
      value: stats.animals,
      icon: PhotoIcon,
      color: 'bg-green-500'
    },
    {
      name: 'Active Volunteers',
      value: stats.volunteers,
      icon: UsersIcon,
      color: 'bg-purple-500'
    },
    {
      name: 'Total Donations',
      value: stats.donations,
      icon: CurrencyDollarIcon,
      color: 'bg-yellow-500'
    }
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-2 text-gray-600">
          Welcome to HALT Admin Panel. Here's what's happening with your animal shelter.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.name}
              className="relative bg-white pt-5 px-4 pb-12 sm:pt-6 sm:px-6 shadow rounded-lg overflow-hidden"
            >
              <div>
                <div className={`absolute ${card.color} rounded-md p-3`}>
                  <Icon className="h-6 w-6 text-white" />
                </div>
                <p className="ml-16 text-sm font-medium text-gray-500 truncate">
                  {card.name}
                </p>
              </div>
              <div className="ml-16 pb-6 flex items-baseline">
                <p className="text-2xl font-semibold text-gray-900">
                  {card.value}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Animal Status Breakdown */}
      <div className="bg-white shadow rounded-lg mb-6">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
            Animal Status Breakdown
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {Object.entries(animalBreakdown).map(([status, count]) => {
              const statusColors = {
                'Available': 'bg-green-100 text-green-800 border-green-200',
                'Adopted': 'bg-purple-100 text-purple-800 border-purple-200',
                'Pending': 'bg-yellow-100 text-yellow-800 border-yellow-200',
                'Medical Hold': 'bg-red-100 text-red-800 border-red-200',
                'Foster': 'bg-blue-100 text-blue-800 border-blue-200',
                'Not Available': 'bg-gray-100 text-gray-800 border-gray-200'
              };
              
              return (
                <div key={status} className={`p-3 rounded-lg border-2 ${statusColors[status] || 'bg-gray-100 text-gray-800 border-gray-200'}`}>
                  <div className="text-center">
                    <div className="text-2xl font-bold">{count}</div>
                    <div className="text-sm font-medium">{status}</div>
                  </div>
                </div>
              );
            })}
          </div>
          {Object.keys(animalBreakdown).length === 0 && (
            <div className="text-center text-gray-500 py-4">
              No animal data available
            </div>
          )}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Stories */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
              Recent Stories
            </h3>
            {recentStories.length === 0 ? (
              <p className="text-gray-500 text-sm">No stories available</p>
            ) : (
              <div className="space-y-3">
                {recentStories.map((story) => (
                  <div key={story._id} className="flex items-center space-x-3">
                    {story.image ? (
                      <img
                        className="h-10 w-10 rounded-lg object-cover"
                        src={story.image}
                        alt=""
                      />
                    ) : (
                      <div className="h-10 w-10 rounded-lg bg-gray-200 flex items-center justify-center">
                        <DocumentTextIcon className="h-5 w-5 text-gray-400" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {story.title}
                      </p>
                      <p className="text-sm text-gray-500">
                        {story.category} • {new Date(story.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <button
                      onClick={() => window.open(`http://localhost:3001/stories/${story.slug}`, '_blank')}
                      className="text-gray-400 hover:text-gray-500"
                    >
                      <EyeIcon className="h-5 w-5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
              Quick Actions
            </h3>
            <div className="space-y-3">
              <button
                onClick={() => window.location.href = '/stories'}
                className="w-full flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                <DocumentTextIcon className="h-5 w-5 mr-3 text-gray-400" />
                Manage Stories
              </button>
              <button
                onClick={() => window.location.href = '/animals'}
                className="w-full flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                <PhotoIcon className="h-5 w-5 mr-3 text-gray-400" />
                Manage Animals
              </button>
              <button
                onClick={() => window.location.href = '/volunteers'}
                className="w-full flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                <UsersIcon className="h-5 w-5 mr-3 text-gray-400" />
                Manage Volunteers
              </button>
              <button
                onClick={() => window.location.href = '/adoption-inquiries'}
                className="w-full flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                <HeartIcon className="h-5 w-5 mr-3 text-gray-400" />
                View Adoption Inquiries
              </button>
              <button
                onClick={() => window.location.href = '/animals?add=new'}
                className="w-full flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-primary-700 bg-primary-50 hover:bg-primary-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                <PhotoIcon className="h-5 w-5 mr-3 text-primary-400" />
                Add New Animal
              </button>
              <button
                onClick={() => window.location.href = '/stories?add=new'}
                className="w-full flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-primary-700 bg-primary-50 hover:bg-primary-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                <DocumentTextIcon className="h-5 w-5 mr-3 text-primary-400" />
                Add New Story
              </button>
              <button
                onClick={() => window.open('http://localhost:3001', '_blank')}
                className="w-full flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                <EyeIcon className="h-5 w-5 mr-3 text-gray-400" />
                View Main Website
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Real-time System Status */}
      {/* Sponsors management - Admin */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <SponsorsManager />
        </div>
      </div>

      <SystemStatus />
    </div>
  );
};

export default Dashboard;
