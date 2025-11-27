import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { HeartIcon, UserGroupIcon, TruckIcon, HomeIcon, CameraIcon, MegaphoneIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import { apiService, handleApiError } from '../services/api';

export default function Volunteer() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    interests: [],
    availability: [],
    experience: '',
    message: ''
  });
  const [submitStatus, setSubmitStatus] = useState('');
  const [errors, setErrors] = useState({});

  const volunteerOpportunities = [
    {
      id: 'animal-care',
      title: 'Animal Care',
      icon: HeartIcon,
      description: 'Feed, clean, exercise, and provide loving attention to animals in our care',
      commitment: '4+ hours/week',
      requirements: 'Animal experience preferred but not required. Training provided.'
    },
    {
      id: 'transport',
      title: 'Transport & Rescue',
      icon: TruckIcon,
      description: 'Help transport animals to/from vet appointments, foster homes, and adoption events',
      commitment: 'Flexible schedule',
      requirements: 'Valid driver\'s license and reliable vehicle required.'
    },
    {
      id: 'fostering',
      title: 'Foster Care',
      icon: HomeIcon,
      description: 'Provide temporary homes for animals who need extra care or space',
      commitment: 'Varies by animal needs',
      requirements: 'Home visit and application process required.'
    },
    {
      id: 'events',
      title: 'Events & Outreach',
      icon: UserGroupIcon,
      description: 'Help at adoption events, fundraisers, and community outreach programs',
      commitment: 'Weekend events',
      requirements: 'Friendly personality and enthusiasm for our mission.'
    },
    {
      id: 'photography',
      title: 'Photography & Media',
      icon: CameraIcon,
      description: 'Take photos/videos of animals for adoption listings and social media',
      commitment: '2-4 hours/month',
      requirements: 'Photography skills and own equipment preferred.'
    },
    {
      id: 'fundraising',
      title: 'Fundraising & Marketing',
      icon: MegaphoneIcon,
      description: 'Help with grant writing, social media, and fundraising campaigns',
      commitment: 'Remote work possible',
      requirements: 'Marketing, writing, or social media experience helpful.'
    }
  ];

  const availabilityOptions = [
    'Weekday mornings',
    'Weekday afternoons',
    'Weekday evenings',
    'Weekend mornings',
    'Weekend afternoons',
    'Weekend evenings',
    'Flexible/As needed'
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleCheckboxChange = (e, field) => {
    const { value, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [field]: checked
        ? [...prev[field], value]
        : prev[field].filter(item => item !== value)
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
    if (formData.interests.length === 0) newErrors.interests = 'Please select at least one area of interest';
    if (formData.availability.length === 0) newErrors.availability = 'Please select your availability';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      setSubmitStatus('loading');
      await apiService.volunteers.apply(formData);
      setSubmitStatus('success');
      
      // Reset form
      setFormData({
        name: '',
        email: '',
        phone: '',
        interests: [],
        availability: [],
        experience: '',
        message: ''
      });
    } catch (err) {
      console.error('Volunteer registration error:', err);
      const errorInfo = handleApiError(err);
      setSubmitStatus('error');
      setErrors({ submit: errorInfo.message });
    }
  };

  if (submitStatus === 'success') {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircleIcon className="w-10 h-10 text-green-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Thank You for Your Interest! 🎉
            </h1>
            <p className="text-lg text-gray-600 mb-6">
              We've received your volunteer application and will be in touch within 2-3 business days 
              to discuss next steps and answer any questions you might have.
            </p>
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">What happens next?</h3>
              <ul className="text-gray-700 space-y-2 text-left">
                <li className="flex items-start">
                  <span className="text-green-600 mr-2">✓</span>
                  Our volunteer coordinator will review your application
                </li>
                <li className="flex items-start">
                  <span className="text-green-600 mr-2">✓</span>
                  We'll schedule a brief phone interview to discuss your interests
                </li>
                <li className="flex items-start">
                  <span className="text-green-600 mr-2">✓</span>
                  You'll receive orientation and training for your chosen volunteer roles
                </li>
                <li className="flex items-start">
                  <span className="text-green-600 mr-2">✓</span>
                  Start making a difference in the lives of animals in need!
                </li>
              </ul>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => setSubmitStatus('')}
                className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
              >
                Submit Another Application
              </button>
              <Link
                to="/"
                className="border-2 border-red-600 text-red-600 hover:bg-red-600 hover:text-white font-bold py-3 px-6 rounded-lg transition-colors text-center"
              >
                Return to Homepage
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-red-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              🤝 Join Our Volunteer Family
            </h1>
            <p className="text-xl md:text-2xl text-red-100 max-w-3xl mx-auto">
              Make a direct impact in the lives of animals who need it most. Every hour you volunteer helps save lives and create forever families.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Volunteer Opportunities */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
            Ways to Make a Difference
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {volunteerOpportunities.map((opportunity) => {
              const Icon = opportunity.icon;
              return (
                <div key={opportunity.id} className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow">
                  <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-4">
                    <Icon className="w-6 h-6 text-red-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{opportunity.title}</h3>
                  <p className="text-gray-600 mb-4">{opportunity.description}</p>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="font-semibold text-gray-700">Time Commitment:</span>
                      <span className="text-gray-600">{opportunity.commitment}</span>
                    </div>
                    <div>
                      <span className="font-semibold text-gray-700">Requirements:</span>
                      <p className="text-gray-600 mt-1">{opportunity.requirements}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Volunteer Registration Form */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            Ready to Get Started? Apply Today!
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Personal Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent ${
                    errors.name ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter your full name"
                />
                {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Email Address *
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent ${
                    errors.email ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter your email address"
                />
                {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Phone Number *
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent ${
                  errors.phone ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter your phone number"
              />
              {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
            </div>

            {/* Areas of Interest */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-4">
                Areas of Interest * (Select all that apply)
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {volunteerOpportunities.map((opportunity) => (
                  <label key={opportunity.id} className="flex items-center">
                    <input
                      type="checkbox"
                      value={opportunity.id}
                      checked={formData.interests.includes(opportunity.id)}
                      onChange={(e) => handleCheckboxChange(e, 'interests')}
                      className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-gray-700">{opportunity.title}</span>
                  </label>
                ))}
              </div>
              {errors.interests && <p className="text-red-500 text-sm mt-1">{errors.interests}</p>}
            </div>

            {/* Availability */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-4">
                Availability * (Select all that apply)
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {availabilityOptions.map((option) => (
                  <label key={option} className="flex items-center">
                    <input
                      type="checkbox"
                      value={option}
                      checked={formData.availability.includes(option)}
                      onChange={(e) => handleCheckboxChange(e, 'availability')}
                      className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-gray-700">{option}</span>
                  </label>
                ))}
              </div>
              {errors.availability && <p className="text-red-500 text-sm mt-1">{errors.availability}</p>}
            </div>

            {/* Experience */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Previous Experience with Animals (Optional)
              </label>
              <textarea
                name="experience"
                value={formData.experience}
                onChange={handleInputChange}
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                placeholder="Tell us about any previous experience with animals, volunteering, or relevant skills..."
              />
            </div>

            {/* Additional Message */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Additional Comments or Questions (Optional)
              </label>
              <textarea
                name="message"
                value={formData.message}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                placeholder="Anything else you'd like us to know?"
              />
            </div>

            {/* Submit Button */}
            <div className="text-center">
              {errors.submit && (
                <p className="text-red-500 text-sm mb-4">{errors.submit}</p>
              )}
              
              <button
                type="submit"
                disabled={submitStatus === 'loading'}
                className="bg-red-600 hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-bold py-4 px-8 rounded-lg text-lg transition-colors"
              >
                {submitStatus === 'loading' ? 'Submitting...' : 'Submit Application'}
              </button>
              
              <p className="text-sm text-gray-600 mt-4">
                By submitting this form, you agree to be contacted by HALT Shelter regarding volunteer opportunities.
              </p>
            </div>
          </form>
        </div>

        {/* Additional Information */}
        <div className="mt-16 grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Volunteer Benefits</h3>
            <ul className="space-y-3 text-gray-700">
              <li className="flex items-start">
                <span className="text-green-600 mr-2">✓</span>
                Make a direct impact in saving animal lives
              </li>
              <li className="flex items-start">
                <span className="text-green-600 mr-2">✓</span>
                Gain valuable experience and skills
              </li>
              <li className="flex items-start">
                <span className="text-green-600 mr-2">✓</span>
                Connect with like-minded animal lovers
              </li>
              <li className="flex items-start">
                <span className="text-green-600 mr-2">✓</span>
                Flexible scheduling to fit your lifestyle
              </li>
              <li className="flex items-start">
                <span className="text-green-600 mr-2">✓</span>
                Comprehensive training and support
              </li>
              <li className="flex items-start">
                <span className="text-green-600 mr-2">✓</span>
                Volunteer appreciation events and recognition
              </li>
            </ul>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-8">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h3>
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-gray-900">Do I need previous experience?</h4>
                <p className="text-gray-600 text-sm">No! We provide comprehensive training for all volunteer roles. Your enthusiasm and commitment matter most.</p>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">What's the minimum age requirement?</h4>
                <p className="text-gray-600 text-sm">Volunteers must be 16 or older. Volunteers under 18 need parental consent.</p>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">How much time do I need to commit?</h4>
                <p className="text-gray-600 text-sm">We appreciate any time you can give! Most volunteers contribute 2-4 hours per week, but we're flexible.</p>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">Can I bring my own pet?</h4>
                <p className="text-gray-600 text-sm">For safety reasons, personal pets are not allowed in our facilities except for special approved events.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
