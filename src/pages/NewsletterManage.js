import React, { useState } from 'react';
import { apiService } from '../services/api';
import { FaEnvelope, FaCheck, FaTimes } from 'react-icons/fa';

const NewsletterManage = () => {
  const [email, setEmail] = useState('');
  const [subscriber, setSubscriber] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [unsubscribeReason, setUnsubscribeReason] = useState('');

  const handleCheckEmail = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    try {
      const response = await apiService.newsletter.getSubscriber(email);
      setSubscriber(response.data.subscriber);
    } catch (err) {
      setError(err.response?.data?.error || 'Email not found in our newsletter list');
      setSubscriber(null);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePreferences = async (updatedPrefs) => {
    setLoading(true);
    try {
      await apiService.newsletter.updatePreferences(email, updatedPrefs);
      setSubscriber({ ...subscriber, preferences: updatedPrefs });
      setMessage('✅ Preferences updated successfully');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update preferences');
    } finally {
      setLoading(false);
    }
  };

  const handleUnsubscribe = async () => {
    if (!window.confirm('Are you sure you want to unsubscribe from our newsletter?')) return;

    setLoading(true);
    try {
      await apiService.newsletter.unsubscribe(email, unsubscribeReason);
      setMessage('✅ You have been unsubscribed');
      setSubscriber(null);
      setEmail('');
      setTimeout(() => {
        setMessage('');
        window.location.href = '/';
      }, 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to unsubscribe');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-2 mb-4">
            <FaEnvelope className="text-red-600 text-3xl" />
            <h1 className="text-4xl font-black text-gray-900">Newsletter Preferences</h1>
          </div>
          <p className="text-xl text-gray-600">
            Manage your subscription and communication preferences
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-8">
          {/* Find Subscription */}
          {!subscriber && (
            <form onSubmit={handleCheckEmail} className="mb-8">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Enter your email to manage preferences
              </label>
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your.email@example.com"
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600"
                  required
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-red-600 hover:bg-red-700 text-white font-bold px-6 py-2 rounded-lg transition-colors disabled:opacity-50"
                >
                  {loading ? 'Searching...' : 'Find'}
                </button>
              </div>
            </form>
          )}

          {/* Messages */}
          {message && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6 animate-slideDown">
              {message}
            </div>
          )}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 animate-slideDown">
              {error}
            </div>
          )}

          {/* Subscriber Details */}
          {subscriber && (
            <div className="space-y-6">
              {/* Status Badge */}
              <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-sm text-gray-600">Subscription Status</p>
                  <p className="text-lg font-bold">
                    {subscriber.status === 'confirmed' ? (
                      <span className="text-green-600 flex items-center gap-2">
                        <FaCheck /> Active
                      </span>
                    ) : subscriber.status === 'pending' ? (
                      <span className="text-yellow-600">Pending Confirmation</span>
                    ) : (
                      <span className="text-gray-600 flex items-center gap-2">
                        <FaTimes /> Unsubscribed
                      </span>
                    )}
                  </p>
                </div>
              </div>

              {/* Preferences */}
              {subscriber.status === 'confirmed' && (
                <>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Email Preferences</h3>
                    <div className="space-y-3">
                      {[
                        { key: 'generalNews', label: 'General News & Updates' },
                        { key: 'animalUpdates', label: 'Animal Rescue Stories' },
                        { key: 'events', label: 'Events & Volunteer Opportunities' },
                        { key: 'fundraising', label: 'Fundraising Campaigns' },
                        { key: 'volunteerOpportunities', label: 'Volunteer Opportunities' }
                                            ].map((pref) => (
                                              <label key={pref.key} className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded cursor-pointer">
                                                <input
                                                  type="checkbox"
                                                  checked={subscriber.preferences?.[pref.key] || false}
                                                  onChange={(e) => {
                                                    const updated = {
                                                      ...subscriber.preferences,
                                                      [pref.key]: e.target.checked
                                                    };
                                                    setSubscriber({ ...subscriber, preferences: updated });
                                                  }}
                                                  className="w-5 h-5 accent-red-600 rounded"
                                                />
                                                <span className="text-gray-700 font-medium">{pref.label}</span>
                                              </label>
                                            ))}
                                          </div>
                                        </div>
                      
                                        {/* Save Preferences Button */}
                                        <button
                                          onClick={() => handleUpdatePreferences(subscriber.preferences)}
                                          disabled={loading}
                                          className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-lg transition-colors disabled:opacity-50 transform hover:scale-105"
                                        >
                                          {loading ? 'Saving...' : 'Save Preferences'}
                                        </button>
                                      </>
                                    )}
                      
                                    {/* Unsubscribe Section */}
                                    <div className="border-t pt-6">
                                      <h3 className="text-lg font-bold text-gray-900 mb-4">Unsubscribe</h3>
                                      <p className="text-gray-600 mb-4">
                                        We'd love to keep you connected, but if you'd like to go, help us improve:
                                      </p>
                                      <textarea
                                        value={unsubscribeReason}
                                        onChange={(e) => setUnsubscribeReason(e.target.value)}
                                        placeholder="Why are you unsubscribing? (optional)"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 mb-4"
                                        rows="3"
                                      />
                                      <button
                                        onClick={handleUnsubscribe}
                                        disabled={loading}
                                        className="w-full bg-red-100 hover:bg-red-200 text-red-600 font-bold py-2 rounded-lg transition-colors disabled:opacity-50"
                                      >
                                        {loading ? 'Unsubscribing...' : 'Unsubscribe from All Emails'}
                                      </button>
                                    </div>
                      
                                    {/* Info Text */}
                                    <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
                                      <p className="text-sm text-blue-700">
                                        <strong>Note:</strong> Even if unsubscribed, you may still receive transactional emails (receipts, confirmations) if applicable.
                                      </p>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      };
                      
                      export default NewsletterManage;