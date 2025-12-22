import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { HeartIcon, Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';
import { navigateTo } from '../../utils/navigationUtils';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  const navigation = [
    { name: 'Home', href: '/', current: location.pathname === '/' },
    { name: 'Animals', href: '/animals', current: location.pathname === '/animals' },
  { name: 'Donate', href: '/donate', current: location.pathname === '/donate' },
    { name: 'Stories', href: '/stories', current: location.pathname === '/stories' },
    { name: 'Blog', href: '/blog', current: location.pathname === '/blog' },
    { name: 'About', href: '/about', current: location.pathname === '/about' },
    { name: 'Volunteer', href: '/volunteer', current: location.pathname === '/volunteer' },
  ];

  return (
    <nav className="bg-white shadow-lg sticky top-0 z-50 transition-all duration-300 ease-out">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 flex items-center">
              <HeartIcon className="h-8 w-8 text-red-600" />
              <span className="ml-2 text-xl font-bold text-gray-900">HALTSHELTER</span>
            </Link>
          </div>

          {/* Desktop navigation - show at xl (1280px+) to prevent crowding */}
          <div className="hidden xl:flex items-center space-x-4 2xl:space-x-6">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`px-2 2xl:px-3 py-2 text-sm font-semibold transition-all duration-300 ease-out transform hover:scale-110 hover:-translate-y-0.5 whitespace-nowrap ${
                  item.current
                    ? 'text-red-600 border-b-2 border-red-600'
                    : 'text-gray-700 hover:text-red-600'
                }`}
              >
                {item.name}
              </Link>
            ))}
            <a
              href="#"
              onClick={(e) => { e.preventDefault(); navigateTo('/donate', { recurrence: 'monthly' }); }}
              className="bg-red-600 text-white px-3 2xl:px-4 py-2 rounded-md text-sm font-semibold hover:bg-red-700 transition-all duration-300 ease-out transform hover:scale-105 hover:shadow-lg cursor-pointer whitespace-nowrap"
            >
              Donate Monthly
            </a>
          </div>

          {/* Mobile menu button - show until xl breakpoint */}
          <div className="xl:hidden flex items-center">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-700 hover:text-red-600 focus:outline-none focus:text-red-600 transition-all duration-300 transform hover:scale-110"
            >
              {isMenuOpen ? (
                <XMarkIcon className="h-6 w-6 animate-spin-slow" />
              ) : (
                <Bars3Icon className="h-6 w-6 transition-transform duration-300" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="xl:hidden animate-slideDown">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white shadow-lg max-h-[calc(100vh-4rem)] overflow-y-auto">
            {navigation.map((item, index) => (
              <Link
                key={item.name}
                to={item.href}
                className={`block px-3 py-3 min-h-[44px] text-base font-semibold transition-all duration-300 ease-out transform hover:translate-x-1 hover:scale-105 ${
                  item.current
                    ? 'text-red-600 bg-red-50'
                    : 'text-gray-700 hover:text-red-600 hover:bg-red-50'
                }`}
                onClick={() => setIsMenuOpen(false)}
                style={{
                  animation: `slideInLeft 0.3s ease-out ${index * 0.05}s both`
                }}
              >
                {item.name}
              </Link>
            ))}
            <a
              href="#"
              onClick={(e) => { e.preventDefault(); setIsMenuOpen(false); navigateTo('/donate', { recurrence: 'monthly' }); }}
              className="block mx-3 mt-4 bg-red-600 text-white px-4 py-3 min-h-[44px] rounded-md text-base font-semibold hover:bg-red-700 transition-all duration-300 transform hover:scale-105 hover:shadow-lg text-center cursor-pointer"
              style={{
                animation: `slideInLeft 0.3s ease-out ${navigation.length * 0.05 + 0.05}s both`
              }}
            >
              Donate Monthly
            </a>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
