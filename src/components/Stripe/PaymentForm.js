import React, { useState } from 'react';
import { useStripe, useElements, CardElement } from '@stripe/react-stripe-js';
import { CreditCardIcon, ShieldCheckIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { stripeService } from '../../services/stripe';

const cardElementOptions = {
  style: {
    base: {
      fontSize: '16px',
      color: '#374151',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      '::placeholder': {
        color: '#9CA3AF',
      },
    },
    invalid: {
      color: '#EF4444',
      iconColor: '#EF4444',
    },
  },
  hidePostalCode: false,
};

const PaymentForm = ({ 
  amount, 
  donationType = 'one-time', 
  onSuccess, 
  onError,
  isEmergency = false 
}) => {
  const stripe = useStripe();
  const elements = useElements();
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [donorInfo, setDonorInfo] = useState({
    name: '',
    email: '',
    phone: '',
    anonymous: false,
  });

  const handleSubmit = async (event) => {
    event.preventDefault();
    
    if (!stripe || !elements) {
      setError('Payment system is not ready. Please try again.');
      return;
    }

    if (!amount || amount <= 0) {
      setError('Please enter a valid donation amount.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Validate amount
      const amountValidation = stripeService.validateAmount(amount);
      if (!amountValidation.valid) {
        setError(amountValidation.error);
        setLoading(false);
        return;
      }

      // Create payment intent
      const { client_secret } = await stripeService.createPaymentIntent(
        amount,
        'usd',
        {
          donor_name: donorInfo.anonymous ? 'Anonymous' : donorInfo.name,
          donor_email: donorInfo.email,
          donation_type: donationType,
          is_emergency: isEmergency,
        }
      );

      // Process payment
      // NOTE: We intentionally do NOT pass email to billing_details to prevent
      // Stripe from sending duplicate automatic receipts. Our webhook handles emails.
      const result = await stripeService.processPayment(
        stripe,
        elements,
        client_secret,
        {
          name: donorInfo.anonymous ? 'Anonymous Donor' : donorInfo.name,
          // email is NOT passed here to prevent Stripe automatic receipts
          phone: donorInfo.phone,
        }
      );

      if (result.error) {
        setError(result.error.message);
      } else {
        // Payment succeeded
        console.log('[PAYMENT-FORM] Payment result:', result);
        console.log('[PAYMENT-FORM] PaymentIntent amount:', result.paymentIntent?.amount);
        if (onSuccess) {
          onSuccess({
            paymentIntent: result.paymentIntent,
            donorInfo,
            amount: result.paymentIntent.amount, // Use amount in cents from Stripe PaymentIntent
            donationType,
            isEmergency,
          });
        }
      }
    } catch (err) {
      console.error('Payment error:', err);
      setError(err.message || 'An unexpected error occurred. Please try again.');
      if (onError) {
        onError(err);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDonorInfoChange = (field, value) => {
    setDonorInfo(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Donor Information */}
      <div className="bg-gray-50 p-6 rounded-lg">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Donor Information</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Full Name *
            </label>
            <input
              type="text"
              required={!donorInfo.anonymous}
              disabled={donorInfo.anonymous}
              value={donorInfo.anonymous ? '' : donorInfo.name}
              onChange={(e) => handleDonorInfoChange('name', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500 disabled:bg-gray-100"
              placeholder="Enter your full name"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email Address *
            </label>
            <input
              type="email"
              required
              value={donorInfo.email}
              onChange={(e) => handleDonorInfoChange('email', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500"
              placeholder="Enter your email"
            />
          </div>
        </div>
        
        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Phone Number (Optional)
          </label>
          <input
            type="tel"
            value={donorInfo.phone}
            onChange={(e) => handleDonorInfoChange('phone', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500"
            placeholder="Enter your phone number"
          />
        </div>
        
        <div className="mt-4">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={donorInfo.anonymous}
              onChange={(e) => handleDonorInfoChange('anonymous', e.target.checked)}
              className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
            />
            <span className="ml-2 text-sm text-gray-700">
              Make this donation anonymous
            </span>
          </label>
        </div>
      </div>

      {/* Payment Information */}
      <div className="bg-white border border-gray-200 p-6 rounded-lg">
        <div className="flex items-center mb-4">
          <CreditCardIcon className="w-6 h-6 text-gray-600 mr-2" />
          <h3 className="text-lg font-semibold text-gray-900">Payment Information</h3>
        </div>
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Card Details
          </label>
          <div className="p-3 border border-gray-300 rounded-md focus-within:ring-2 focus-within:ring-red-500 focus-within:border-red-500">
            <CardElement options={cardElementOptions} />
          </div>
        </div>
        
        {/* Security Indicators */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center">
            <ShieldCheckIcon className="w-5 h-5 text-green-600 mr-2" />
            <div className="text-sm">
              <p className="font-medium text-green-800">Secure Payment</p>
              <p className="text-green-700">
                Your payment is encrypted and secure. We never store your card information.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex">
            <ExclamationTriangleIcon className="w-5 h-5 text-red-400 mt-0.5 mr-2" />
            <div className="text-sm text-red-700">{error}</div>
          </div>
        </div>
      )}

      {/* Donation Summary */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-semibold text-blue-900 mb-2">Donation Summary</h4>
        <div className="space-y-1 text-sm text-blue-800">
          <div className="flex justify-between">
            <span>Amount:</span>
            <span className="font-semibold">{stripeService.formatAmount(amount)}</span>
          </div>
          <div className="flex justify-between">
            <span>Type:</span>
            <span className="font-semibold capitalize">
              {donationType} {isEmergency ? '(Emergency)' : ''}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Tax Deductible:</span>
            <span className="font-semibold">Yes</span>
          </div>
        </div>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={!stripe || loading || !amount || !donorInfo.email}
        className="w-full bg-red-600 hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-bold py-4 px-6 rounded-lg text-lg transition-colors flex items-center justify-center"
      >
        {loading ? (
          <>
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
            Processing...
          </>
        ) : (
          <>
            <ShieldCheckIcon className="w-5 h-5 mr-2" />
            Donate {stripeService.formatAmount(amount)} Securely
          </>
        )}
      </button>
      
      {/* Terms */}
      <p className="text-xs text-gray-500 text-center">
        By donating, you agree to our Terms of Service and Privacy Policy. 
        Your donation is tax-deductible to the fullest extent allowed by law.
      </p>
    </form>
  );
};

export default PaymentForm;
