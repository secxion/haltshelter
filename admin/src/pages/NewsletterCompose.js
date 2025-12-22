import React, { useState, useEffect } from 'react';
import { apiService } from '../services/api';

const NewsletterCompose = () => {
  const [subject, setSubject] = useState('');
  const [content, setContent] = useState('');
  const [testEmail, setTestEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [testLoading, setTestLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [subscriberCount, setSubscriberCount] = useState(0);
  const [showPreview, setShowPreview] = useState(false);

  // Fetch confirmed subscriber count
  useEffect(() => {
    const fetchCount = async () => {
      try {
        const res = await apiService.newsletter.getSubscribers({ status: 'confirmed', limit: 1 });
        setSubscriberCount(res.data?.pagination?.total || 0);
      } catch (err) {
        console.error('Error fetching subscriber count:', err);
      }
    };
    fetchCount();
  }, []);

  const handleSendTest = async () => {
    if (!testEmail) {
      setMessage({ type: 'error', text: 'Please enter a test email address' });
      return;
    }
    if (!subject || !content) {
      setMessage({ type: 'error', text: 'Please fill in subject and content' });
      return;
    }

    setTestLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const res = await apiService.newsletter.sendBroadcast({ subject, content, testEmail });
      setMessage({ type: 'success', text: `Test email sent to ${testEmail}` });
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.error || 'Failed to send test email' });
    } finally {
      setTestLoading(false);
    }
  };

  const handleSendBroadcast = async () => {
    if (!subject || !content) {
      setMessage({ type: 'error', text: 'Please fill in subject and content' });
      return;
    }

    if (subscriberCount === 0) {
      setMessage({ type: 'error', text: 'No confirmed subscribers to send to' });
      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to send this newsletter to ${subscriberCount} confirmed subscribers?\n\nSubject: ${subject}`
    );

    if (!confirmed) return;

    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const res = await apiService.newsletter.sendBroadcast({ subject, content });
      setMessage({ 
        type: 'success', 
        text: `Newsletter sent to ${res.data.sentCount} subscribers!${res.data.failedCount > 0 ? ` (${res.data.failedCount} failed)` : ''}`
      });
      // Clear form on success
      setSubject('');
      setContent('');
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.error || 'Failed to send newsletter' });
    } finally {
      setLoading(false);
    }
  };

  // Simple HTML preview
  const PreviewModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-hidden">
        <div className="flex justify-between items-center p-4 border-b">
          <h3 className="text-lg font-semibold">Email Preview</h3>
          <button
            onClick={() => setShowPreview(false)}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ×
          </button>
        </div>
        <div className="p-6 overflow-y-auto max-h-[70vh]">
          {/* Simulated email preview */}
          <div className="border rounded-lg overflow-hidden">
            {/* Header */}
            <div className="bg-red-600 p-4 text-center">
              <h1 className="text-white text-2xl font-bold">🐾 HALT Shelter</h1>
              <p className="text-red-200 text-sm">Help Animals Live & Thrive</p>
            </div>
            {/* Content */}
            <div className="bg-gray-50 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">{subject || 'Your Subject Here'}</h2>
              <div 
                className="text-gray-700 prose prose-sm"
                dangerouslySetInnerHTML={{ __html: content.replace(/\n/g, '<br/>') || '<p>Your content here...</p>' }}
              />
              <div className="text-center mt-8">
                <span className="inline-block bg-red-600 text-white px-6 py-3 rounded-lg font-semibold">
                  ❤️ Support Our Mission
                </span>
              </div>
            </div>
            {/* Footer */}
            <div className="bg-gray-900 text-gray-400 p-4 text-center text-xs">
              <p className="text-white font-semibold">HALT Shelter</p>
              <p>haltshelter.org | contact@haltshelter.org</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Compose Newsletter</h1>
          <p className="text-sm text-gray-600">
            Send newsletters to your {subscriberCount} confirmed subscriber{subscriberCount !== 1 ? 's' : ''}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
            ✅ {subscriberCount} confirmed
          </span>
        </div>
      </div>

      {/* Message Alert */}
      {message.text && (
        <div className={`p-4 rounded-lg ${message.type === 'error' ? 'bg-red-50 text-red-800 border border-red-200' : 'bg-green-50 text-green-800 border border-green-200'}`}>
          {message.text}
        </div>
      )}

      {/* Compose Form */}
      <div className="bg-white shadow rounded-lg p-6 space-y-6">
        {/* Subject */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Subject Line *
          </label>
          <input
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="e.g., December Update: New Rescues & Success Stories"
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-red-500 focus:border-red-500"
          />
        </div>

        {/* Content */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email Content *
          </label>
          <p className="text-xs text-gray-500 mb-2">
            You can use basic HTML tags: &lt;b&gt;bold&lt;/b&gt;, &lt;i&gt;italic&lt;/i&gt;, &lt;a href="..."&gt;links&lt;/a&gt;, &lt;br&gt; for line breaks
          </p>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={12}
            placeholder="Dear HALT Family,

We're excited to share some wonderful updates from our shelter this month!

<b>New Rescues:</b>
We welcomed 5 new animals this month who are now safe and receiving care.

<b>Success Stories:</b>
Luna found her forever home! She's now living happily with the Johnson family.

Thank you for your continued support!

Warm regards,
The HALT Team"
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-red-500 focus:border-red-500 font-mono text-sm"
          />
        </div>

        {/* Preview Button */}
        <div>
          <button
            type="button"
            onClick={() => setShowPreview(true)}
            className="text-red-600 hover:text-red-700 font-medium text-sm"
          >
            👁️ Preview Email
          </button>
        </div>

        {/* Divider */}
        <hr className="border-gray-200" />

        {/* Test Send Section */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h3 className="font-medium text-yellow-800 mb-3">📧 Send Test Email First</h3>
          <div className="flex gap-3">
            <input
              type="email"
              value={testEmail}
              onChange={(e) => setTestEmail(e.target.value)}
              placeholder="your@email.com"
              className="flex-1 px-4 py-2 rounded-lg border border-yellow-300 focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
            />
            <button
              type="button"
              onClick={handleSendTest}
              disabled={testLoading}
              className="px-6 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 disabled:opacity-50 font-medium"
            >
              {testLoading ? 'Sending...' : 'Send Test'}
            </button>
          </div>
          <p className="text-xs text-yellow-700 mt-2">
            Always send a test email to yourself before broadcasting to all subscribers
          </p>
        </div>

        {/* Send Broadcast Button */}
        <div className="flex justify-end pt-4">
          <button
            type="button"
            onClick={handleSendBroadcast}
            disabled={loading || subscriberCount === 0}
            className="px-8 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 font-semibold text-lg"
          >
            {loading ? (
              <>
                <span className="animate-pulse">Sending to {subscriberCount} subscribers...</span>
              </>
            ) : (
              <>
                📬 Send to All {subscriberCount} Subscribers
              </>
            )}
          </button>
        </div>
      </div>

      {/* Tips */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-medium text-blue-800 mb-2">💡 Tips for Great Newsletters</h3>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• Keep subject lines under 50 characters for better open rates</li>
          <li>• Include a personal greeting and sign off</li>
          <li>• Share success stories - people love hearing about happy endings!</li>
          <li>• Include a call to action (donate, volunteer, adopt)</li>
          <li>• Always send a test email first to check formatting</li>
        </ul>
      </div>

      {/* Preview Modal */}
      {showPreview && <PreviewModal />}
    </div>
  );
};

export default NewsletterCompose;
