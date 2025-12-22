import React from 'react';
import { CheckCircleIcon, HeartIcon, ShareIcon } from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';
import { stripeService } from '../../services/stripe';

const PaymentSuccess = ({ 
  paymentIntent, 
  donorInfo, 
  amount, 
  donationType, 
  isEmergency,
  onNewDonation 
}) => {
  const handleShare = () => {
    const text = `I just donated ${stripeService.formatAmount(amount)} to HALTSHELTER to help animals in need! Join me in making a difference. 🐾❤️`;
    const url = window.location.origin;
    
    if (navigator.share) {
      navigator.share({
        title: 'I donated to HALTSHELTER',
        text,
        url,
      });
    } else {
      // Fallback to copy to clipboard
      navigator.clipboard.writeText(`${text} ${url}`);
      alert('Link copied to clipboard!');
    }
  };

  const getImpactMessage = () => {
    if (isEmergency) {
      if (amount >= 300) return "Your donation can fund complete emergency veterinary care for an animal in critical condition.";
      if (amount >= 150) return "Your donation provides essential emergency surgery supplies.";
      return "Your donation helps provide emergency medication for animals in need.";
    }
    
    if (amount >= 500) return "Your donation can fund a complete rescue operation, saving multiple animals.";
    if (amount >= 250) return "Your donation covers emergency medical treatment for an animal in need.";
    if (amount >= 100) return "Your donation sponsors an animal's complete shelter stay until adoption.";
    if (amount >= 50) return "Your donation provides essential veterinary care for shelter animals.";
    return "Your donation helps feed shelter animals and provides basic care.";
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Success Header */}
      <div className="text-center mb-8">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircleIcon className="w-12 h-12 text-green-600" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Thank You!</h1>
        <p className="text-lg text-gray-600">
          Your {isEmergency ? 'emergency ' : ''}donation has been processed successfully.
        </p>
      </div>

      {/* Donation Details */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Donation Details</h2>
        
        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-gray-600">Amount:</span>
            <span className="font-semibold text-gray-900">
              {stripeService.formatAmount(amount)}
            </span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-gray-600">Type:</span>
            <span className="font-semibold text-gray-900 capitalize">
              {donationType} {isEmergency ? '(Emergency)' : ''}
            </span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-gray-600">Payment ID:</span>
            <span className="font-mono text-sm text-gray-700">
              {paymentIntent.id}
            </span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-gray-600">Date:</span>
            <span className="text-gray-900">
              {new Date().toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </span>
          </div>
          
          {!donorInfo.anonymous && (
            <div className="flex justify-between">
              <span className="text-gray-600">Donor:</span>
              <span className="text-gray-900">{donorInfo.name}</span>
            </div>
          )}
        </div>
      </div>

      {/* Impact Message */}
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-6">
        <div className="flex items-start">
          <HeartIcon className="w-6 h-6 text-red-600 mt-1 mr-3 flex-shrink-0" />
          <div>
            <h3 className="font-semibold text-red-900 mb-2">Your Impact</h3>
            <p className="text-red-800">{getImpactMessage()}</p>
            <p className="text-red-700 text-sm mt-2">
              Every dollar you donate goes directly toward helping animals live and thrive.
            </p>
          </div>
        </div>
      </div>

      {/* What's Next */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
        <h3 className="font-semibold text-blue-900 mb-3">What Happens Next?</h3>
        <ul className="space-y-2 text-blue-800 text-sm">
          <li className="flex items-center">
            <div className="w-2 h-2 bg-blue-600 rounded-full mr-3"></div>
            You'll receive a tax-deductible receipt via email within 24 hours
          </li>
          <li className="flex items-center">
            <div className="w-2 h-2 bg-blue-600 rounded-full mr-3"></div>
            Your donation will be put to work immediately helping animals in need
          </li>
          <li className="flex items-center">
            <div className="w-2 h-2 bg-blue-600 rounded-full mr-3"></div>
            We'll send you updates on how your contribution is making a difference
          </li>
          {donationType === 'monthly' && (
            <li className="flex items-center">
              <div className="w-2 h-2 bg-blue-600 rounded-full mr-3"></div>
              Your monthly donation will automatically process on this day each month
            </li>
          )}
        </ul>
      </div>

      {/* Action Buttons */}
      <div className="space-y-4">
        {/* Share */}
        <button
          onClick={handleShare}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center"
        >
          <ShareIcon className="w-5 h-5 mr-2" />
          Share Your Good Deed
        </button>
        
        {/* Make Another Donation */}
        {onNewDonation && (
          <button
            onClick={onNewDonation}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
          >
            Make Another Donation
          </button>
        )}
        
        {/* View Stories */}
        <Link
          to="/stories"
          className="w-full bg-gray-600 hover:bg-gray-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors text-center block"
        >
          See How Donations Help Animals
        </Link>
      </div>

      {/* Contact Info */}
      <div className="mt-8 text-center text-gray-600 text-sm">
        <p>Questions about your donation?</p>
        <p>
          Contact us at{' '}
          <a href="mailto:donations@haltshelter.org" className="text-red-600 hover:text-red-700">
            donations@haltshelter.org
          </a>{' '}
          or call +1 (805) 452-9111
        </p>
      </div>
    </div>
  );
};

export default PaymentSuccess;
