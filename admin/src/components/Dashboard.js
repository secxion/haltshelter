import React, { useState, useEffect } from 'react';
import {
  DocumentTextIcon,
  PhotoIcon,
  UsersIcon,
  CurrencyDollarIcon,
  TrendingUpIcon,
  EyeIcon
} from '@heroicons/react/24/outline';
import { API_BASE_URL } from '../config';

const Dashboard = () => {
  const [stats, setStats] = useState({
    stories: 0,
    blogs: 0,
    animals: 0,
    volunteers: 0,
    donations: 0,
    revenue: 0
  });
  const [changes, setChanges] = useState({
    stories: 0,
    blogs: 0,
    animals: 0,
    volunteers: 0,
    donations: 0
  });
  const [recentActivity, setRecentActivity] = useState({
    recentStories: [],
    recentBlogs: [],
    recentVolunteers: [],
    recentDonations: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      console.log('🔄 Fetching dashboard data...');
      
      const statsResponse = await fetch(`${API_BASE_URL}/stats/dashboard`);
      
      console.log('📊 Stats response status:', statsResponse.status);
      const statsData = await statsResponse.json();
      console.log('📊 Raw stats data received:', statsData);
      console.log('📊 Stats from response:', statsData.stats);
      console.log('📊 Volunteer count from API:', statsData.stats?.volunteers);
      
      if (statsData.success) {
        console.log('✅ Setting stats with:', statsData.stats);
        console.log('✅ About to set volunteer count to:', statsData.stats.volunteers);
        setStats(statsData.stats);
        setChanges(statsData.changes);
        console.log('✅ Stats state updated successfully');
        console.log('✅ New stats state should be:', statsData.stats);
      } else {
        console.error('❌ Stats API error:', statsData.error);
      }
      
      const activityResponse = await fetch(`${API_BASE_URL}/stats/recent-activity`);
      
      console.log('📈 Activity response status:', activityResponse.status);
      const activityData = await activityResponse.json();
      console.log('📈 Activity data:', activityData);
      
      if (activityData.success) {
        setRecentActivity(activityData.activity);
        console.log('✅ Activity updated');
      } else {
        console.error('❌ Activity API error:', activityData.error);
      }
      
    } catch (error) {
      console.error('❌ Error fetching dashboard data:', error);
      setStats({
        stories: 0,
        blogs: 0,
        animals: 0,
        volunteers: 0,
        donations: 0,
        revenue: 0
      });
      setChanges({
        stories: 0,
        blogs: 0,
        animals: 0,
        volunteers: 0,
        donations: 0
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRefreshData = () => {
    console.log('🔄 Force refreshing dashboard data...');
    setLoading(true);
    fetchDashboardData();
  };

  console.log('🎯 Rendering Dashboard with stats:', stats);
  console.log('🎯 Current volunteer count:', stats.volunteers);

  const statCards = [
    {
      name: 'Total Stories',
      value: stats.stories,
      icon: DocumentTextIcon,
      color: 'bg-blue-500',
      change: `+${changes.stories}%`,
      changeType: 'positive'
    },
    {
      name: 'Published Blogs',
      value: stats.blogs,
      icon: DocumentTextIcon,
      color: 'bg-indigo-500',
      change: `+${changes.blogs}%`,
      changeType: 'positive'
    },
    {
      name: 'Animals in Care',
      value: stats.animals,
      icon: PhotoIcon,
      color: 'bg-green-500',
      change: `+${changes.animals} this week`,
      changeType: 'positive'
    },
    {
      name: 'Active Volunteers',
      value: stats.volunteers,
      icon: UsersIcon,
      color: 'bg-purple-500',
      change: `+${changes.volunteers} this month`,
      changeType: 'positive'
    },
      {
        name: 'Adoptions This Year',
        value: stats.adoptionsThisMonth || 0,
        icon: TrendingUpIcon,
        color: 'bg-pink-500',
        change: '',
        changeType: 'positive'
      },
    {
      name: 'Total Donations',
      value: stats.donations,
      icon: CurrencyDollarIcon,
      color: 'bg-yellow-500',
      change: `+${changes.donations}%`,
      changeType: 'positive'
    },
    {
      name: 'Total Revenue',
      value: `$${stats.revenue}`,
      icon: CurrencyDollarIcon,
      color: 'bg-emerald-500',
      change: `+${Math.floor(changes.donations / 2)}%`,
      changeType: 'positive'
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
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="mt-2 text-gray-600">
            Welcome to HALT Admin Panel. Here's what's happening with your animal shelter.
          </p>
        </div>
        <button
          onClick={handleRefreshData}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          🔄 Refresh Data
        </button>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
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
                <p className={`ml-2 flex items-baseline text-sm font-semibold ${
                  card.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
                }`}>
                  <TrendingUpIcon className="self-center flex-shrink-0 h-4 w-4 text-green-500" />
                  <span className="sr-only">
                    {card.changeType === 'positive' ? 'Increased' : 'Decreased'} by
                  </span>
                  {card.change}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Stories */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
              Recent Stories
            </h3>
            {recentActivity.recentStories.length === 0 ? (
              <p className="text-gray-500 text-sm">No stories available</p>
            ) : (
              <div className="space-y-3">
                {recentActivity.recentStories.map((story) => (
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

        {/* Recent Volunteers */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
              Recent Volunteers
            </h3>
            {recentActivity.recentVolunteers.length === 0 ? (
              <p className="text-gray-500 text-sm">No volunteer applications</p>
            ) : (
              <div className="space-y-3">
                {recentActivity.recentVolunteers.map((volunteer) => (
                  <div key={volunteer._id} className="flex items-center space-x-3">
                    <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center">
                      <UsersIcon className="h-5 w-5 text-purple-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {volunteer.personalInfo?.firstName} {volunteer.personalInfo?.lastName}
                      </p>
                      <p className="text-sm text-gray-500">
                        {volunteer.personalInfo?.email} • {new Date(volunteer.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      volunteer.applicationStatus === 'approved' ? 'bg-green-100 text-green-800' :
                      volunteer.applicationStatus === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      volunteer.applicationStatus === 'rejected' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {volunteer.applicationStatus || 'pending'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recent Donations & Blogs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Donations */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
              Recent Donations
            </h3>
            {recentActivity.recentDonations.length === 0 ? (
              <p className="text-gray-500 text-sm">No recent donations</p>
            ) : (
              <div className="space-y-3">
                {recentActivity.recentDonations.map((donation) => (
                  <div key={donation._id} className="flex items-center space-x-3">
                    <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                      <CurrencyDollarIcon className="h-5 w-5 text-green-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">
                        ${donation.amount} donation
                      </p>
                      <p className="text-sm text-gray-500 truncate">
                        {donation.donorEmail} • {donation.donationType} • {new Date(donation.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Recent Blogs */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
              Recent Blogs
            </h3>
            {recentActivity.recentBlogs.length === 0 ? (
              <p className="text-gray-500 text-sm">No recent blogs</p>
            ) : (
              <div className="space-y-3">
                {recentActivity.recentBlogs.map((blog) => (
                  <div key={blog._id} className="flex items-center space-x-3">
                    {blog.image ? (
                      <img
                        className="h-10 w-10 rounded-lg object-cover"
                        src={blog.image}
                        alt=""
                      />
                    ) : (
                      <div className="h-10 w-10 rounded-lg bg-gray-200 flex items-center justify-center">
                        <DocumentTextIcon className="h-5 w-5 text-gray-400" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {blog.title}
                      </p>
                      <p className="text-sm text-gray-500">
                        {blog.category} • {new Date(blog.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <button
                      onClick={() => window.open(`http://localhost:3001/blog/${blog.slug}`, '_blank')}
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
      </div>

      {/* Quick Actions & System Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Stories */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
              Recent Stories
            </h3>
            {recentActivity.recentStories.length === 0 ? (
              <p className="text-gray-500 text-sm">No stories available</p>
            ) : (
              <div className="space-y-3">
                {recentActivity.recentStories.map((story) => (
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
                onClick={() => window.open('http://localhost:3001', '_blank')}
                className="w-full flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                <EyeIcon className="h-5 w-5 mr-3 text-gray-400" />
                View Main Website
              </button>
              <button
                disabled
                className="w-full flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-400 bg-gray-50 cursor-not-allowed"
              >
                <PhotoIcon className="h-5 w-5 mr-3 text-gray-400" />
                Manage Animals (Coming Soon)
              </button>
              <button
                onClick={() => window.location.href = '/volunteers'}
                className="w-full flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                <UsersIcon className="h-5 w-5 mr-3 text-gray-400" />
                Manage Volunteers
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* System Status */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
            System Status
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-2 w-2 bg-green-400 rounded-full"></div>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-900">Main Website</p>
                <p className="text-sm text-gray-500">Online</p>
              </div>
            </div>
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-2 w-2 bg-green-400 rounded-full"></div>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-900">Database</p>
                <p className="text-sm text-gray-500">Connected</p>
              </div>
            </div>
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-2 w-2 bg-green-400 rounded-full"></div>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-900">Admin Panel</p>
                <p className="text-sm text-gray-500">Active</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
