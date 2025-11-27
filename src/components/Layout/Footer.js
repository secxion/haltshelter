import React from 'react';
import { Link } from 'react-router-dom';
import { HeartIcon, EnvelopeIcon, PhoneIcon } from '@heroicons/react/24/outline';
import { FaFacebook } from 'react-icons/fa';
import FooterSponsors from './FooterSponsors';

const Footer = () => {
  // Allow overriding the Facebook URL via environment variable for easy updates without code changes
  const fbUrl = process.env.REACT_APP_FACEBOOK_URL || 'https://www.facebook.com/HelpingAnimalsLiveAndThrive';
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center">
              <HeartIcon className="h-8 w-8 text-red-600" />
              <span className="ml-2 text-xl font-bold">HALTSHELTER</span>
            </div>
            <p className="text-gray-300 text-sm">
              Dedicated to rescuing, rehabilitating, and rehoming animals in need. 
              Every donation saves a life.
            </p>
            <div className="flex space-x-4">
              {/* Facebook only - update the href to your page's actual slug if different */}
              <a href={fbUrl} target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-white transition-colors" aria-label="Helping Animals Live & Thrive - Facebook">
                <FaFacebook className="h-6 w-6" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Quick Links</h3>
            <ul className="space-y-2">
              <li><Link to="/about" className="text-gray-300 hover:text-white transition-colors">About Us</Link></li>
              <li><Link to="/stories" className="text-gray-300 hover:text-white transition-colors">Success Stories</Link></li>
              <li><Link to="/volunteer" className="text-gray-300 hover:text-white transition-colors">Volunteer</Link></li>
              <li><Link to="/blog?category=pet-care" className="text-gray-300 hover:text-white transition-colors">Pet Care Guides</Link></li>
            </ul>
          </div>

          {/* Support */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Support</h3>
            <ul className="space-y-2">
              <li><Link to="/donate" className="text-gray-300 hover:text-white transition-colors">One-Time Donation</Link></li>
              <li><Link to="/donate?recurrence=monthly" className="text-gray-300 hover:text-white transition-colors">Monthly Giving</Link></li>
            </ul>
            {/* Sponsors preview (featured) */}
            <FooterSponsors />
          </div>

          {/* Contact */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Contact</h3>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <EnvelopeIcon className="h-5 w-5 text-red-600" />
                <span className="text-gray-300">contact@haltshelter.org</span>
              </div>
              <div className="flex items-center space-x-2">
                <PhoneIcon className="h-5 w-5 text-red-600" />
                <span className="text-gray-300">+1 (555) 123-4567</span>
              </div>
            </div>
            {/* Emergency contact removed per request */}
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-gray-700">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-300 text-sm">
              © 2025 HALTSHELTER. All rights reserved. | 501(c)(3) Nonprofit | EIN: 41-2531054
            </p>
            <div className="mt-4 md:mt-0 flex space-x-6">
              <button type="button" className="text-gray-300 hover:text-white text-sm transition-colors">Privacy Policy</button>
              <button type="button" className="text-gray-300 hover:text-white text-sm transition-colors">Terms of Service</button>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
