import React from 'react';
import { Link } from 'react-router-dom';
import { HeartIcon, EnvelopeIcon, PhoneIcon } from '@heroicons/react/24/outline';
import { FaFacebook } from 'react-icons/fa';
import { navigateTo } from '../../utils/navigationUtils';

const Footer = () => {
  // Allow overriding the Facebook URL via environment variable for easy updates without code changes
  const fbUrl = process.env.REACT_APP_FACEBOOK_URL || 'https://www.facebook.com/HelpingAnimalsLiveAndThrive';
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center">
              <HeartIcon className="h-8 w-8 text-red-600 animate-pulse" />
              <span className="ml-2 text-xl font-bold tracking-wide">HALTSHELTER</span>
            </div>
            <p className="text-gray-300 text-sm leading-relaxed">
              Dedicated to rescuing, rehabilitating, and rehoming animals in need. 
              Every donation saves a life.
            </p>
            <div className="flex space-x-4">
              {/* Facebook only - update the href to your page's actual slug if different */}
              <a 
                href={fbUrl} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-gray-300 hover:text-white transition-all duration-300 transform hover:scale-110 hover:text-red-400" 
                aria-label="Helping Animals Live & Thrive - Facebook"
              >
                <FaFacebook className="h-6 w-6" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <nav className="space-y-4" aria-label="Quick Links">
            <h3 className="text-lg font-semibold text-white border-b border-red-600 pb-2">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link 
                  to="/about" 
                  className="text-gray-300 hover:text-white transition-all duration-300 transform hover:translate-x-1 flex items-center gap-2"
                  aria-label="About Us"
                >
                  <span className="text-red-400" aria-hidden="true">→</span> About Us
                </Link>
              </li>
              <li>
                <Link 
                  to="/stories" 
                  className="text-gray-300 hover:text-white transition-all duration-300 transform hover:translate-x-1 flex items-center gap-2"
                  aria-label="Success Stories"
                >
                  <span className="text-red-400" aria-hidden="true">→</span> Success Stories
                </Link>
              </li>
              <li>
                <Link 
                  to="/volunteer" 
                  className="text-gray-300 hover:text-white transition-all duration-300 transform hover:translate-x-1 flex items-center gap-2"
                  aria-label="Volunteer With Us"
                >
                  <span className="text-red-400" aria-hidden="true">→</span> Volunteer
                </Link>
              </li>
              <li>
                <a 
                  href="#"
                  onClick={(e) => { e.preventDefault(); navigateTo('/blog', { category: 'pet-care' }); }}
                  className="text-gray-300 hover:text-white transition-all duration-300 transform hover:translate-x-1 flex items-center gap-2 cursor-pointer"
                  aria-label="Pet Care Guides"
                >
                  <span className="text-red-400" aria-hidden="true">→</span> Pet Care Guides
                </a>
              </li>
            </ul>
          </nav>

          {/* Support */}
          <nav className="space-y-4" aria-label="Support">
            <h3 className="text-lg font-semibold text-white border-b border-red-600 pb-2">Support</h3>
            <ul className="space-y-2">
              <li>
                <Link 
                  to="/donate" 
                  className="text-gray-300 hover:text-white transition-all duration-300 transform hover:translate-x-1 flex items-center gap-2"
                  aria-label="Make a One-Time Donation"
                >
                  <span className="text-red-400" aria-hidden="true">→</span> One-Time Donation
                </Link>
              </li>
              <li>
                <a 
                  href="#"
                  onClick={(e) => { e.preventDefault(); navigateTo('/donate', { recurrence: 'monthly' }); }}
                  className="text-gray-300 hover:text-white transition-all duration-300 transform hover:translate-x-1 flex items-center gap-2 cursor-pointer"
                  aria-label="Start Monthly Giving"
                >
                  <span className="text-red-400" aria-hidden="true">→</span> Monthly Giving
                </a>
              </li>
            </ul>
          </nav>

          {/* Contact - Simplified for better fit */}
          <address className="space-y-4 not-italic">
            <h3 className="text-lg font-semibold text-white border-b border-red-600 pb-2">Contact</h3>
            <div className="space-y-3">
              <a 
                href="mailto:contact@haltshelter.org"
                className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors group"
                aria-label="Email us at contact@haltshelter.org"
              >
                <EnvelopeIcon className="h-5 w-5 text-red-500 flex-shrink-0" aria-hidden="true" />
                <span className="text-sm break-all">contact@haltshelter.org</span>
              </a>
              <a 
                href="tel:+18054529111"
                className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors group"
                aria-label="Call us at +1 (805) 452-9111"
              >
                <PhoneIcon className="h-5 w-5 text-green-500 flex-shrink-0" aria-hidden="true" />
                <span className="text-sm">+1 (805) 452-9111</span>
              </a>
            </div>
          </address>
        </div>

        {/* Sponsors Section */}
        {/* <section className="mt-12 sm:mt-16 pt-8 sm:pt-12 border-t border-gray-700" aria-label="Corporate Partners">
          <h2 className="text-lg font-bold text-white mb-8 text-center">Proud Corporate Partners</h2>
          <FooterSponsors />
        </section> */}

        {/* Footer Bottom */}
        <div className="mt-8 sm:mt-12 pt-8 border-t border-gray-700">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-400 text-xs sm:text-sm text-center md:text-left">
              © 2025 HALTSHELTER. All rights reserved. | 501(c)(3) Nonprofit | EIN: 41-2531054
            </p>
            <nav className="flex space-x-6" aria-label="Footer Legal Links">
              <a 
                href="/privacy"
                className="text-gray-400 hover:text-white text-xs sm:text-sm transition-all duration-300 hover:translate-y-0.5"
                aria-label="View our Privacy Policy"
              >
                Privacy Policy
              </a>
              <a 
                href="/terms"
                className="text-gray-400 hover:text-white text-xs sm:text-sm transition-all duration-300 hover:translate-y-0.5"
                aria-label="View our Terms of Service"
              >
                Terms of Service
              </a>
            </nav>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
