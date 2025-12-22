import React, { useState, useEffect } from 'react';
import { Elements } from '@stripe/react-stripe-js';
import { Link, useNavigate } from 'react-router-dom';
import { HeartIcon, ShieldCheckIcon, CreditCardIcon, GiftIcon } from '@heroicons/react/24/outline';
import { stripeService } from '../services/stripe';
import { apiService } from '../services/api';
import { navigateTo, getPageData } from '../utils/navigationUtils';
import PaymentForm from '../components/Stripe/PaymentForm';

const Donate = () => {
  const navigate = useNavigate();
  const [selectedAmount, setSelectedAmount] = useState('');
  const [customAmount, setCustomAmount] = useState('');
  const [isEmergency, setIsEmergency] = useState(false);
  const [donationType, setDonationType] = useState('one-time'); // 'one-time' or 'monthly'
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  
  // Real data from backend
  const [fundingNeeds, setFundingNeeds] = useState([]);
  const [impactStats, setImpactStats] = useState({
    rescuedThisMonth: 0,
    adoptionsThisMonth: 0,
    medicalTreatments: 0,
    spayNeuterCount: 0
  });
  const [dataLoading, setDataLoading] = useState(true);

  // Fetch funding needs and impact stats
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [fundingRes, impactRes] = await Promise.all([
          apiService.fundingNeeds.getAll(),
          apiService.stats.getImpact()
        ]);
        
        // Store all funding needs (emergency ones first)
        const needs = fundingRes.data?.fundingNeeds || [];
        setFundingNeeds(needs.sort((a, b) => {
          if (a.type === 'emergency' && b.type !== 'emergency') return -1;
          if (a.type !== 'emergency' && b.type === 'emergency') return 1;
          return (b.priority || 0) - (a.priority || 0);
        }));
        
        if (impactRes.data?.impact) {
          setImpactStats(impactRes.data.impact);
        }
      } catch (error) {
        console.error('Error fetching donate page data:', error);
      } finally {
        setDataLoading(false);
      }
    };
    
    fetchData();
  }, []);

  useEffect(() => {
    // Check if data was passed via navigationUtils
    const pageData = getPageData('/donate');
    if (pageData) {
      if (pageData.emergency) setIsEmergency(true);
      if (pageData.recurrence === 'monthly') setDonationType('monthly');
    } else {
      // Fallback to URL parameters for backwards compatibility
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get('emergency') === 'true') {
        setIsEmergency(true);
      }
      if (urlParams.get('recurrence') === 'monthly') {
        setDonationType('monthly');
      }
    }
  }, []);

  const donationAmounts = [
    { amount: 25, impact: 'Feeds 5 animals for a day' },
    { amount: 50, impact: 'Provides basic veterinary care' },
    { amount: 100, impact: 'Sponsors an animal\'s shelter stay' },
    { amount: 250, impact: 'Covers emergency medical treatment' },
    { amount: 500, impact: 'Funds a complete rescue operation' },
    { amount: 1000, impact: 'Supports shelter operations for a week' }
  ];

  const emergencyAmounts = [
    { amount: 50, impact: 'Emergency medication for 1 animal' },
    { amount: 150, impact: 'Emergency surgery supplies' },
    { amount: 300, impact: 'Complete emergency veterinary care' },
    { amount: 750, impact: 'Multiple animal emergency response' },
    { amount: 1500, impact: 'Mobile emergency unit deployment' }
  ];

  const currentAmounts = isEmergency ? emergencyAmounts : donationAmounts;

  const handleAmountSelect = (amount) => {
    setSelectedAmount(amount.toString());
    setCustomAmount('');
  };

  const handleCustomAmountChange = (e) => {
    setCustomAmount(e.target.value);
    setSelectedAmount('');
  };

  const getFinalAmount = () => {
    return customAmount || selectedAmount;
  };

  const handleDonateClick = () => {
    const amount = getFinalAmount();
    if (amount && amount > 0) {
      setShowPaymentForm(true);
      // Scroll to top when showing payment form
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePaymentSuccess = (donationData) => {
    // Store donation details and redirect with clean URL
    // IMPORTANT: Store amount in CENTS to preserve accuracy
    // DonateSuccess.js will convert to dollars for display
    
    console.log('[DONATE] Raw donationData received:', donationData);
    
    const amountInCents = donationData.amount 
      ? donationData.amount
      : ((parseFloat(selectedAmount) || parseFloat(customAmount) || 0) * 100);
    
    console.log('[DONATE] Payment Success - Amount data:', {
      received: donationData.amount,
      storingInCents: amountInCents,
      willDisplayAsDollars: amountInCents / 100,
      selected: selectedAmount,
      custom: customAmount
    });
    
    const donationDetails = {
      amount: amountInCents.toString(), // Store in cents as string
      type: donationType,
      emergency: isEmergency
    };
    
    console.log('[DONATE] Storing donation details:', donationDetails);
    
    // Store in sessionStorage
    const key = '_donate_success_data';
    sessionStorage.setItem(key, JSON.stringify(donationDetails));
    
    // Verify it was stored
    const verify = sessionStorage.getItem(key);
    console.log('[DONATE] Verification - stored in sessionStorage:', verify);
    
    // Use React Router navigate instead of window.location.href to preserve sessionStorage
    navigate('/donate/success');
  };

  const handleBackToForm = () => {
    setShowPaymentForm(false);
  };

  // If showing payment form, render Stripe Elements
  if (showPaymentForm) {
    const amount = parseFloat(getFinalAmount());
    
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="mb-6">
              <button
                onClick={handleBackToForm}
                className="text-red-600 hover:text-red-800 font-semibold mb-4"
              >
                ← Back to donation options
              </button>
              <h2 className="text-2xl font-bold text-gray-900">
                Complete Your ${amount} {isEmergency ? 'Emergency ' : ''}{donationType === 'monthly' ? 'Monthly ' : ''}Donation
              </h2>
            </div>
            
            <Elements stripe={stripeService.getStripe()}>
              <PaymentForm
                amount={amount}
                isEmergency={isEmergency}
                donationType={donationType}
                onSuccess={handlePaymentSuccess}
                onError={(error) => {
                  console.error('Payment error:', error);
                  // Could show error message here
                }}
              />
            </Elements>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className={`${isEmergency ? 'bg-red-600' : 'bg-red-600'} text-white`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            {isEmergency ? (
              <>
                <div className="mb-4">
                  <span className="bg-yellow-400 text-red-900 px-4 py-2 rounded-full text-sm font-bold uppercase tracking-wide">
                    Emergency Fund
                  </span>
                </div>
                <h1 className="text-4xl md:text-5xl font-bold mb-4">
                  Help Save a Life Today
                </h1>
                <p className="text-xl md:text-2xl text-red-100 max-w-3xl mx-auto">
                  Critical cases need immediate medical attention. Your emergency donation provides life-saving care when every second counts.
                </p>
              </>
            ) : (
              <>
                <h1 className="text-4xl md:text-5xl font-bold mb-4">
                  Make a Difference Today
                </h1>
                <p className="text-xl md:text-2xl text-red-100 max-w-3xl mx-auto">
                  Your donation rescues, rehabilitates, and rehomes animals in need. Every contribution saves lives and creates forever families.
                </p>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid lg:grid-cols-2 gap-12">
          {/* Donation Form */}
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="flex items-center mb-6">
              <HeartIcon className="w-8 h-8 text-red-600 mr-3" />
              <h2 className="text-2xl font-bold text-gray-900">
                {isEmergency ? 'Emergency Donation' : 'Choose Your Donation Amount'}
              </h2>
            </div>

            {/* Toggle Emergency/Regular */}
            <div className="mb-6">
              <div className="flex space-x-4">
                <button
                  onClick={() => setIsEmergency(false)}
                  className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-colors ${
                    !isEmergency 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Regular Donation
                </button>
                <button
                  onClick={() => setIsEmergency(true)}
                  className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-colors ${
                    isEmergency 
                      ? 'bg-red-600 text-white' 
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Emergency Fund
                </button>
              </div>
            </div>

            {/* Amount Selection */}
            <div className="mb-6">
              <label className="block text-lg font-semibold text-gray-900 mb-4">
                Select Amount
              </label>
              <div className="grid grid-cols-2 gap-3">
                {currentAmounts.map((option) => (
                  <button
                    key={option.amount}
                    onClick={() => handleAmountSelect(option.amount)}
                    className={`p-4 rounded-lg border-2 text-left transition-colors ${
                      selectedAmount === option.amount.toString()
                        ? 'border-red-600 bg-red-50'
                        : 'border-gray-300 hover:border-red-300'
                    }`}
                  >
                    <div className="font-bold text-lg">${option.amount}</div>
                    <div className="text-sm text-gray-600">{option.impact}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Amount */}
            <div className="mb-6">
              <label className="block text-lg font-semibold text-gray-900 mb-2">
                Or Enter Custom Amount
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-lg">$</span>
                <input
                  type="number"
                  min="1"
                  placeholder="0"
                  value={customAmount}
                  onChange={handleCustomAmountChange}
                  className="w-full pl-8 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:border-red-600 focus:outline-none text-lg"
                />
              </div>
            </div>

            {/* Donation Options */}
            <div className="mb-6">
              <div className="flex space-x-4">
                <button 
                  onClick={() => setDonationType('one-time')}
                  className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-colors ${
                    donationType === 'one-time'
                      ? 'bg-red-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  One-Time
                </button>
                <button 
                  onClick={() => setDonationType('monthly')}
                  className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-colors ${
                    donationType === 'monthly'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Monthly
                </button>
              </div>
              <p className="text-sm text-gray-600 mt-2 text-center">
                Monthly donors receive exclusive updates and special supporter perks
              </p>
            </div>

            {/* Secure Donation Button */}
            <button 
              onClick={handleDonateClick}
              disabled={!getFinalAmount()}
              className="w-full bg-yellow-400 hover:bg-yellow-500 disabled:bg-gray-300 disabled:cursor-not-allowed text-gray-900 font-bold py-4 px-6 rounded-lg text-lg transition-colors"
            >
              <div className="flex items-center justify-center">
                <ShieldCheckIcon className="w-6 h-6 mr-2" />
                {getFinalAmount() ? `Donate $${getFinalAmount()} Securely` : 'Select Amount to Continue'}
              </div>
            </button>

            {/* Security Note */}
            <div className="mt-4 text-center">
              <div className="flex items-center justify-center text-sm text-gray-600">
                <CreditCardIcon className="w-4 h-4 mr-1" />
                Secured by SSL encryption • Tax-deductible
              </div>
            </div>
          </div>

          {/* Impact Information */}
          <div className="space-y-8">
            {/* Trust Indicators */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Why Donate to HALTSHELTER?</h3>
              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3 mt-1">
                    <ShieldCheckIcon className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">501(c)(3) Nonprofit</h4>
                    <p className="text-gray-600">Your donation is tax-deductible. EIN: 41-2531054</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3 mt-1">
                    <HeartIcon className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Direct Impact</h4>
                    <p className="text-gray-600">100% of donations go directly to animal care and rescue operations</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center mr-3 mt-1">
                    <GiftIcon className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Transparent</h4>
                    <p className="text-gray-600">Monthly impact reports show exactly how your money helps</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Current Needs */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Current Funding Needs</h3>
              {dataLoading ? (
                <div className="text-gray-500 text-center py-4">Loading...</div>
              ) : fundingNeeds.length > 0 ? (
                <div className="space-y-4">
                  {fundingNeeds.map((need, index) => {
                    const isEmergencyNeed = need.type === 'emergency';
                    const borderColor = isEmergencyNeed ? 'border-red-500' : (index % 2 === 0 ? 'border-blue-500' : 'border-green-500');
                    const textColor = isEmergencyNeed ? 'text-red-600' : (index % 2 === 0 ? 'text-blue-600' : 'text-green-600');
                    const progress = need.goalAmount > 0 ? Math.min(100, (need.currentAmount / need.goalAmount) * 100) : 0;
                    
                    return (
                      <div key={need._id} className={`border-l-4 ${borderColor} pl-4`}>
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold text-gray-900">{need.title}</h4>
                          {isEmergencyNeed && (
                            <span className="bg-red-100 text-red-700 text-xs px-2 py-0.5 rounded-full">🚨 Urgent</span>
                          )}
                        </div>
                        <p className="text-gray-600 text-sm mt-1">{need.description}</p>
                        <div className="mt-2">
                          <div className="flex justify-between text-sm mb-1">
                            <span className={`${textColor} font-semibold`}>
                              ${need.currentAmount?.toLocaleString() || 0} raised
                            </span>
                            <span className="text-gray-500">
                              of ${need.goalAmount?.toLocaleString() || 0} goal
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full ${isEmergencyNeed ? 'bg-red-500' : 'bg-blue-500'}`}
                              style={{ width: `${progress}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-gray-500">No active funding needs at this time.</p>
              )}
            </div>

            {/* Recent Impact */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Recent Impact</h3>
              {dataLoading ? (
                <div className="text-gray-500 text-center py-4">Loading...</div>
              ) : (
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Animals rescued this month</span>
                    <span className="font-bold text-gray-900">{impactStats.rescuedThisMonth}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Successful adoptions</span>
                    <span className="font-bold text-gray-900">{impactStats.adoptionsThisMonth}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Medical treatments provided</span>
                    <span className="font-bold text-gray-900">{impactStats.medicalTreatments}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Community pets spayed/neutered</span>
                    <span className="font-bold text-gray-900">{impactStats.spayNeuterCount}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Other Ways to Help */}
            <div className="bg-gray-100 rounded-lg p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Other Ways to Help</h3>
              <div className="space-y-2">
                <Link to="/volunteer" className="block text-blue-600 hover:text-blue-800 font-semibold">
                  → Volunteer your time
                </Link>
                <button className="block text-blue-600 hover:text-blue-800 font-semibold text-left">
                  → Corporate sponsorship opportunities
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Donate;
