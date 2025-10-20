import React from 'react';
import { Link } from 'react-router-dom';
import { HeartIcon, EnvelopeIcon, PhoneIcon } from '@heroicons/react/24/outline';
import { FaFacebook, FaInstagram, FaTwitter, FaYoutube, FaTiktok } from 'react-icons/fa';

const Footer = () => {
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
              <a href="https://facebook.com/haltshelter" target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-white transition-colors" aria-label="Facebook">
                <FaFacebook className="h-6 w-6" />
              </a>
              <a href="https://instagram.com/haltshelter" target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-white transition-colors" aria-label="Instagram">
                <FaInstagram className="h-6 w-6" />
              </a>
              <a href="https://twitter.com/haltshelter" target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-white transition-colors" aria-label="Twitter">
                <FaTwitter className="h-6 w-6" />
              </a>
              <a href="https://tiktok.com/@haltshelter" target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-white transition-colors" aria-label="TikTok">
                <FaTiktok className="h-6 w-6" />
              </a>
              <a href="https://youtube.com/haltshelter" target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-white transition-colors" aria-label="YouTube">
                <FaYoutube className="h-6 w-6" />
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
              <li><Link to="/blog" className="text-gray-300 hover:text-white transition-colors">Pet Care Guides</Link></li>
            </ul>
          </div>

          {/* Support */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Support</h3>
            <ul className="space-y-2">
              <li><Link to="/donate" className="text-gray-300 hover:text-white transition-colors">One-Time Donation</Link></li>
              <li><Link to="/monthly" className="text-gray-300 hover:text-white transition-colors">Monthly Giving</Link></li>
              <li><button type="button" className="text-gray-300 hover:text-white transition-colors text-left">Corporate Sponsors</button></li>
            </ul>
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
            <div className="pt-4">
              <p className="text-sm text-gray-300">
                Emergency Animal Rescue:<br />
                <span className="text-white font-semibold">+1 (555) 911-PETS</span>
              </p>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-gray-700">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-300 text-sm">
              © 2025 HALTSHELTER. All rights reserved. | 501(c)(3) Nonprofit
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
