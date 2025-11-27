import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircleIcon, HeartIcon, ShareIcon, EnvelopeIcon } from '@heroicons/react/24/outline';

const DonateSuccess = () => {
  const [donationDetails, setDonationDetails] = useState({
    amount: '0',
    type: 'one-time',
    emergency: 'false'
  });

  useEffect(() => {
    // Get donation details from URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    setDonationDetails({
      amount: urlParams.get('amount') || '0',
      type: urlParams.get('type') || 'one-time',
      emergency: urlParams.get('emergency') === 'true'
    });
  }, []);

  const getImpactMessage = (amount) => {
    const amt = parseFloat(amount);
    if (amt >= 1000) return "Your generous gift will fund a complete rescue operation and help multiple animals find their forever homes!";
    if (amt >= 500) return "Your donation will sponsor an animal's complete shelter stay from rescue to adoption!";
    if (amt >= 250) return "Your gift will provide emergency medical treatment that could save an animal's life!";
    if (amt >= 100) return "Your donation will sponsor an animal's shelter stay and help them find a loving home!";
    if (amt >= 50) return "Your gift will provide basic veterinary care to help an animal recover!";
    return "Your donation will help feed and care for animals in need!";
  };

  const shareUrl = `${window.location.origin}/donate`;
  const shareText = `I just donated $${donationDetails.amount} to HALT Shelter to help rescue animals! Join me in making a difference: ${shareUrl}`;

  const handleShare = (platform) => {
    const encodedText = encodeURIComponent(shareText);
    const encodedUrl = encodeURIComponent(shareUrl);
    
    let shareLink = '';
    switch (platform) {
      case 'facebook':
        shareLink = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}&quote=${encodedText}`;
        break;
      case 'twitter':
        shareLink = `https://twitter.com/intent/tweet?text=${encodedText}`;
        break;
      case 'email':
        shareLink = `mailto:?subject=Help HALT Shelter Save Animals&body=${encodedText}`;
        break;
      default:
        return;
    }
    
    window.open(shareLink, '_blank', 'width=600,height=400');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Success Header */}
        <div className="text-center mb-12">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircleIcon className="w-12 h-12 text-green-600" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Thank You! 🎉
          </h1>
          <p className="text-xl text-gray-600">
            Your ${donationDetails.amount} {donationDetails.emergency ? 'emergency ' : ''}
            {donationDetails.type === 'monthly' ? 'monthly ' : ''}donation has been processed successfully.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Impact Message */}
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="flex items-center mb-6">
              <HeartIcon className="w-8 h-8 text-red-600 mr-3" />
              <h2 className="text-2xl font-bold text-gray-900">Your Impact</h2>
            </div>
            
            <div className="bg-red-50 border-l-4 border-red-500 p-6 mb-6">
              <p className="text-gray-800 text-lg leading-relaxed">
                {getImpactMessage(donationDetails.amount)}
              </p>
            </div>

            {donationDetails.emergency && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                <p className="text-yellow-800 font-semibold">
                  🚨 Emergency Fund Contribution
                </p>
                <p className="text-yellow-700 mt-1">
                  Your emergency donation will be used immediately for critical cases requiring urgent medical attention.
                </p>
              </div>
            )}

            {donationDetails.type === 'monthly' && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <p className="text-blue-800 font-semibold">
                  🏆 Thank you for becoming a monthly supporter!
                </p>
                <p className="text-blue-700 mt-1">
                  As a monthly donor, you'll receive exclusive updates about the animals you're helping and priority access to special events.
                </p>
              </div>
            )}

            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">What happens next?</h3>
              <ul className="space-y-2 text-gray-600">
                <li className="flex items-start">
                  <span className="text-green-600 mr-2">✓</span>
                  You'll receive an email receipt for tax purposes within 24 hours (EIN: 41-2531054)
                </li>
                <li className="flex items-start">
                  <span className="text-green-600 mr-2">✓</span>
                  Your donation is immediately put to work helping animals in need
                </li>
                <li className="flex items-start">
                  <span className="text-green-600 mr-2">✓</span>
                  You'll get updates about the impact of your contribution
                </li>
                {donationDetails.type === 'monthly' && (
                  <li className="flex items-start">
                    <span className="text-green-600 mr-2">✓</span>
                    Your monthly donation will automatically process on this same date each month
                  </li>
                )}
              </ul>
            </div>
          </div>

          {/* Share and Next Steps */}
          <div className="space-y-6">
            {/* Share Your Impact */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex items-center mb-4">
                <ShareIcon className="w-6 h-6 text-gray-600 mr-2" />
                <h3 className="text-xl font-bold text-gray-900">Share Your Impact</h3>
              </div>
              <p className="text-gray-600 mb-4">
                Help us spread the word and inspire others to join our mission!
              </p>
              <div className="flex space-x-3">
                <button
                  onClick={() => handleShare('facebook')}
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors text-sm font-semibold"
                >
                  Facebook
                </button>
                <button
                  onClick={() => handleShare('twitter')}
                  className="flex-1 bg-blue-400 text-white py-2 px-4 rounded-lg hover:bg-blue-500 transition-colors text-sm font-semibold"
                >
                  Twitter
                </button>
                <button
                  onClick={() => handleShare('email')}
                  className="flex-1 bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700 transition-colors text-sm font-semibold"
                >
                  Email
                </button>
              </div>
            </div>

            {/* Newsletter Signup */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex items-center mb-4">
                <EnvelopeIcon className="w-6 h-6 text-gray-600 mr-2" />
                <h3 className="text-xl font-bold text-gray-900">Stay Connected</h3>
              </div>
              <p className="text-gray-600 mb-4">
                Get rescue stories, adoption updates, and volunteer opportunities delivered to your inbox.
              </p>
              <Link
                to="/?newsletter=true"
                className="w-full bg-red-600 text-white py-3 px-4 rounded-lg hover:bg-red-700 transition-colors font-semibold text-center block"
              >
                Subscribe to Newsletter
              </Link>
            </div>

            {/* Other Ways to Help */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Other Ways to Help</h3>
              <div className="space-y-3">
                <Link
                  to="/volunteer"
                  className="block w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition-colors font-semibold text-center"
                >
                  Volunteer Your Time
                </Link>
                <Link
                  to="/stories"
                  className="block w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors font-semibold text-center"
                >
                  Read Success Stories
                </Link>
              </div>
            </div>

            {/* Return to Site */}
            <div className="text-center">
              <Link
                to="/"
                className="inline-block bg-gray-600 text-white py-3 px-6 rounded-lg hover:bg-gray-700 transition-colors font-semibold"
              >
                Return to Homepage
              </Link>
            </div>
          </div>
        </div>

        {/* Emergency CTA */}
        {!donationDetails.emergency && (
          <div className="mt-12 bg-red-600 text-white rounded-lg p-8 text-center">
            <h3 className="text-2xl font-bold mb-4">🚨 Emergency Cases Need Help</h3>
            <p className="text-red-100 mb-6 text-lg">
              Right now, animals with critical injuries need immediate medical attention. 
              Your emergency donation can save a life today.
            </p>
            <Link
              to="/donate?emergency=true"
              className="inline-block bg-yellow-400 text-gray-900 font-bold py-3 px-6 rounded-lg hover:bg-yellow-500 transition-colors"
            >
              Make Emergency Donation
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default DonateSuccess;
