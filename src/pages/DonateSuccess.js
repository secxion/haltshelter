import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircleIcon, HeartIcon, ShareIcon, EnvelopeIcon, SparklesIcon, BellAlertIcon } from '@heroicons/react/24/outline';
import { getPageData, buildAbsoluteUrl } from '../utils/navigationUtils';

const DonateSuccess = () => {
  const [donationDetails, setDonationDetails] = useState({
    amount: '0',
    type: 'one-time',
    emergency: 'false'
  });
  const [isVisible, setIsVisible] = useState(false);
  const hasLoadedData = useRef(false);

  useEffect(() => {
    // Prevent double-loading in React StrictMode
    if (hasLoadedData.current) {
      console.log('[DONATE-SUCCESS] Data already loaded, skipping...');
      return;
    }
    
    // Get donation details from centralized navigation utility
    // Set clearAfter to false initially to prevent losing data on first render
    const storedDetails = getPageData('/donate/success', null, false);
    
    console.log('[DONATE-SUCCESS] Retrieved from sessionStorage:', storedDetails);
    
    if (storedDetails && storedDetails.amount) {
      // Amount is stored in cents, convert to dollars for display
      const amountInCents = typeof storedDetails.amount === 'number' 
        ? storedDetails.amount
        : parseFloat(storedDetails.amount || 0);
      
      // Only process if we have a valid amount
      if (amountInCents > 0) {
        const amountInDollars = amountInCents / 100;
        const formattedAmount = amountInDollars.toFixed(2);
        
        console.log('[DONATE-SUCCESS] Amount conversion:', {
          storedInCents: amountInCents,
          convertedToDollars: amountInDollars,
          formatted: formattedAmount
        });
        
        setDonationDetails({
          amount: formattedAmount,
          type: storedDetails.type || 'one-time',
          emergency: storedDetails.emergency === true || storedDetails.emergency === 'true'
        });
        
        // Mark as loaded and clear sessionStorage
        hasLoadedData.current = true;
        sessionStorage.removeItem('_donate_success_data');
        return; // Exit early to prevent fallback logic
      }
    }
    
    // Only use fallback if no valid stored details were found
    console.log('[DONATE-SUCCESS] No sessionStorage data found, checking URL params...');
    const urlParams = new URLSearchParams(window.location.search);
    const urlAmount = urlParams.get('amount') || '0';
    setDonationDetails({
      amount: parseFloat(urlAmount).toFixed(2),
      type: urlParams.get('type') || 'one-time',
      emergency: urlParams.get('emergency') === 'true'
    });
    hasLoadedData.current = true;
  }, []);

  // Trigger animations on mount
  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
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

  const shareUrl = buildAbsoluteUrl('/donate');
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
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Success Header with Animation */}
        <div className={`text-center mb-12 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-10'}`}>
          <div className="relative inline-block mb-6">
            {/* Animated Success Icon */}
            <div className="w-24 h-24 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center mx-auto shadow-2xl animate-bounce-slow">
              <CheckCircleIcon className="w-16 h-16 text-white" />
            </div>
            {/* Sparkle Effects */}
            <SparklesIcon className="w-8 h-8 text-yellow-400 absolute -top-2 -right-2 animate-pulse" />
            <SparklesIcon className="w-6 h-6 text-yellow-300 absolute -bottom-1 -left-1 animate-pulse delay-100" />
          </div>
          
          <h1 className="text-5xl md:text-6xl font-extrabold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent mb-4 animate-fade-in">
            Thank You! 🎉
          </h1>
          <p className="text-2xl text-gray-700 font-medium">
            Your <span className="text-green-600 font-bold text-3xl">${donationDetails.amount}</span> 
            {donationDetails.emergency ? <span className="text-red-600 font-semibold"> emergency</span> : ''}
            {donationDetails.type === 'monthly' ? <span className="text-blue-600 font-semibold"> monthly</span> : ''}
            <br />donation has been processed successfully
          </p>
          <div className="mt-4 inline-flex items-center justify-center space-x-2 bg-green-100 text-green-800 px-6 py-3 rounded-full font-semibold shadow-md">
            <CheckCircleIcon className="w-5 h-5" />
            <span>Payment Confirmed</span>
          </div>
        </div>

        <div className={`grid lg:grid-cols-2 gap-8 transition-all duration-1000 delay-300 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          {/* Impact Message */}
          <div className="bg-white rounded-2xl shadow-2xl p-8 hover:shadow-3xl transition-shadow duration-300 border border-gray-100">
            <div className="flex items-center mb-6">
              <div className="bg-red-100 p-3 rounded-full mr-4">
                <HeartIcon className="w-8 h-8 text-red-600 animate-pulse" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900">Your Impact</h2>
            </div>
            
            <div className="bg-gradient-to-r from-red-50 to-pink-50 border-l-4 border-red-500 p-6 mb-6 rounded-r-xl shadow-inner">
              <p className="text-gray-800 text-lg leading-relaxed font-medium">
                {getImpactMessage(donationDetails.amount)}
              </p>
            </div>

            {donationDetails.emergency && (
              <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-300 rounded-xl p-5 mb-6 shadow-md animate-fade-in-scale">
                <div className="flex items-start">
                  <BellAlertIcon className="w-6 h-6 text-yellow-600 mr-3 flex-shrink-0 animate-pulse" />
                  <div>
                    <p className="text-yellow-900 font-bold text-lg">
                      🚨 Emergency Fund Contribution
                    </p>
                    <p className="text-yellow-800 mt-2 leading-relaxed">
                      Your emergency donation will be used immediately for critical cases requiring urgent medical attention.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {donationDetails.type === 'monthly' && (
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-300 rounded-xl p-5 mb-6 shadow-md animate-fade-in-scale">
                <p className="text-blue-900 font-bold text-lg flex items-center">
                  <SparklesIcon className="w-5 h-5 mr-2" />
                  🏆 Monthly Supporter - Thank You!
                </p>
                <p className="text-blue-800 mt-2 leading-relaxed">
                  As a monthly donor, you'll receive exclusive updates about the animals you're helping and priority access to special events.
                </p>
              </div>
            )}

            <div className="space-y-4 bg-gray-50 p-6 rounded-xl">
              <h3 className="text-xl font-bold text-gray-900 flex items-center">
                <span className="bg-green-500 w-2 h-2 rounded-full mr-2 animate-pulse"></span>
                What happens next?
              </h3>
              <ul className="space-y-3 text-gray-700">
                <li className="flex items-start hover:translate-x-2 transition-transform duration-200">
                  <span className="text-green-600 font-bold text-xl mr-3 flex-shrink-0">✓</span>
                  <span className="leading-relaxed">You'll receive an email receipt for tax purposes within 24 hours <span className="font-semibold">(EIN: 41-2531054)</span></span>
                </li>
                <li className="flex items-start hover:translate-x-2 transition-transform duration-200">
                  <span className="text-green-600 font-bold text-xl mr-3 flex-shrink-0">✓</span>
                  <span className="leading-relaxed">Your donation is immediately put to work helping animals in need</span>
                </li>
                <li className="flex items-start hover:translate-x-2 transition-transform duration-200">
                  <span className="text-green-600 font-bold text-xl mr-3 flex-shrink-0">✓</span>
                  <span className="leading-relaxed">You'll get updates about the impact of your contribution</span>
                </li>
                {donationDetails.type === 'monthly' && (
                  <li className="flex items-start hover:translate-x-2 transition-transform duration-200">
                    <span className="text-blue-600 font-bold text-xl mr-3 flex-shrink-0">✓</span>
                    <span className="leading-relaxed">Your monthly donation will automatically process on this same date each month</span>
                  </li>
                )}
              </ul>
            </div>
          </div>

          {/* Share and Next Steps */}
          <div className="space-y-6">
            {/* Share Your Impact */}
            <div className="bg-white rounded-2xl shadow-2xl p-6 hover:shadow-3xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-100">
              <div className="flex items-center mb-4">
                <div className="bg-purple-100 p-2 rounded-full mr-3">
                  <ShareIcon className="w-6 h-6 text-purple-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900">Share Your Impact</h3>
              </div>
              <p className="text-gray-600 mb-5 leading-relaxed">
                Help us spread the word and inspire others to join our mission!
              </p>
              <div className="flex space-x-3">
                <button
                  onClick={() => handleShare('facebook')}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 px-4 rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-300 text-sm font-bold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  Facebook
                </button>
                <button
                  onClick={() => handleShare('twitter')}
                  className="flex-1 bg-gradient-to-r from-sky-400 to-sky-500 text-white py-3 px-4 rounded-xl hover:from-sky-500 hover:to-sky-600 transition-all duration-300 text-sm font-bold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  Twitter
                </button>
                <button
                  onClick={() => handleShare('email')}
                  className="flex-1 bg-gradient-to-r from-gray-600 to-gray-700 text-white py-3 px-4 rounded-xl hover:from-gray-700 hover:to-gray-800 transition-all duration-300 text-sm font-bold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  Email
                </button>
              </div>
            </div>

            {/* Stay Connected - Social & Contact */}
            <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl shadow-2xl p-6 text-white transform hover:-translate-y-1 transition-all duration-300">
              <div className="flex items-center mb-4">
                <div className="bg-white/20 p-2 rounded-full mr-3">
                  <EnvelopeIcon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-2xl font-bold">Stay Connected</h3>
              </div>
              <p className="text-indigo-100 mb-5 leading-relaxed">
                Follow us for rescue stories, adoption updates, and ways to get involved!
              </p>
              <div className="space-y-3">
                <a
                  href="https://www.facebook.com/haltshelter"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-xl transition-all duration-300 font-bold text-center flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                  Follow on Facebook
                </a>
                <a
                  href="mailto:contact@haltshelter.org?subject=Hello%20from%20a%20HALT%20Supporter!"
                  className="w-full bg-white text-indigo-600 py-3 px-4 rounded-xl hover:bg-indigo-50 transition-all duration-300 font-bold text-center flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  <EnvelopeIcon className="w-5 h-5" />
                  Email Us
                </a>
              </div>
            </div>

            {/* Other Ways to Help */}
            <div className="bg-white rounded-2xl shadow-2xl p-6 hover:shadow-3xl transition-shadow duration-300 border border-gray-100">
              <h3 className="text-2xl font-bold text-gray-900 mb-5">Other Ways to Help</h3>
              <div className="space-y-3">
                <Link
                  to="/volunteer"
                  className="block w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white py-3 px-4 rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all duration-300 font-bold text-center shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  🤝 Volunteer Your Time
                </Link>
                <Link
                  to="/stories"
                  className="block w-full bg-gradient-to-r from-blue-500 to-cyan-600 text-white py-3 px-4 rounded-xl hover:from-blue-600 hover:to-cyan-700 transition-all duration-300 font-bold text-center shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  📖 Read Success Stories
                </Link>
              </div>
            </div>

            {/* Return to Site */}
            <div className="text-center">
              <Link
                to="/"
                className="inline-block bg-gradient-to-r from-gray-700 to-gray-800 text-white py-3 px-8 rounded-xl hover:from-gray-800 hover:to-gray-900 transition-all duration-300 font-bold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                ← Return to Homepage
              </Link>
            </div>
          </div>
        </div>

        {/* Emergency CTA */}
        {!donationDetails.emergency && (
          <div className={`mt-12 bg-gradient-to-r from-red-600 via-red-700 to-pink-600 text-white rounded-2xl p-8 text-center shadow-2xl transition-all duration-1000 delay-500 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'} hover:shadow-3xl transform hover:-translate-y-1`}>
            <div className="inline-block mb-4 animate-pulse">
              <BellAlertIcon className="w-16 h-16 text-yellow-300 mx-auto" />
            </div>
            <h3 className="text-3xl font-bold mb-4 drop-shadow-lg">🚨 Emergency Cases Need Help</h3>
            <p className="text-red-100 mb-6 text-lg max-w-2xl mx-auto leading-relaxed">
              Right now, animals with critical injuries need immediate medical attention. 
              Your emergency donation can save a life today.
            </p>
            <Link
              to="/donate?emergency=true"
              className="inline-block bg-yellow-400 text-gray-900 font-bold py-4 px-8 rounded-xl hover:bg-yellow-300 transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:scale-105"
            >
              💝 Make Emergency Donation
            </Link>
          </div>
        )}
      </div>

      {/* Add custom animations - ⭐ FIXED: Removed jsx attribute */}
      <style>{`
        @keyframes bounce-slow {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-10px);
          }
        }
        
        @keyframes fade-in-scale {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        
        .animate-bounce-slow {
          animation: bounce-slow 2s ease-in-out infinite;
        }
        
        .animate-fade-in {
          animation: fade-in-scale 0.6s ease-out;
        }
        
        .animate-fade-in-scale {
          animation: fade-in-scale 0.5s ease-out;
        }
        
        .delay-100 {
          animation-delay: 100ms;
        }
      `}</style>
    </div>
  );
};

export default DonateSuccess;
