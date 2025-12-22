import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../App';
import {
  HomeIcon,
  DocumentTextIcon,
  PhotoIcon,
  UsersIcon,
  ArrowRightOnRectangleIcon,
  NewspaperIcon,
  HeartIcon,
  ChartBarIcon,
  EnvelopeOpenIcon,
  CurrencyDollarIcon
} from '@heroicons/react/24/outline';

const Layout = ({ children }) => {
  const { user, logout } = useAuth();
  const location = useLocation();

  const navigation = [
    { name: 'Dashboard', href: '/', icon: HomeIcon, current: location.pathname === '/' },
    { name: 'Stories', href: '/stories', icon: DocumentTextIcon, current: location.pathname === '/stories' },
    { name: 'Blog', href: '/blog', icon: NewspaperIcon, current: location.pathname === '/blog' },
    { name: 'Animals', href: '/animals', icon: PhotoIcon, current: location.pathname === '/animals' },
    { name: 'Adoption Inquiries', href: '/adoption-inquiries', icon: HeartIcon, current: location.pathname === '/adoption-inquiries' },
    { name: 'Volunteers', href: '/volunteers', icon: UsersIcon, current: location.pathname === '/volunteers' },
    { name: 'Funding & Impact', href: '/funding-needs', icon: CurrencyDollarIcon, current: location.pathname === '/funding-needs' },
    { name: 'User Management', href: '/users', icon: UsersIcon, current: location.pathname === '/users' },
    { name: 'Stats', href: '/stats', icon: ChartBarIcon, current: location.pathname === '/stats' },
    { name: 'Subscribers', href: '/newsletter', icon: EnvelopeOpenIcon, current: location.pathname === '/newsletter' },
    { name: 'Compose Newsletter', href: '/newsletter/compose', icon: EnvelopeOpenIcon, current: location.pathname === '/newsletter/compose' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg">
        <div className="flex h-16 shrink-0 items-center px-6">
          <div className="h-8 w-8 bg-primary-500 rounded flex items-center justify-center">
            <span className="text-white font-bold">H</span>
          </div>
          <span className="ml-2 text-xl font-semibold text-gray-900">HALT Admin</span>
        </div>
        
        <nav className="mt-6 px-3">
          <ul className="space-y-1">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <li key={item.name}>
                  <Link
                    to={item.href}
                    className={`group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold ${
                      item.current
                        ? 'bg-primary-50 text-primary-600'
                        : 'text-gray-700 hover:text-primary-600 hover:bg-gray-50'
                    }`}
                  >
                    <Icon className="h-6 w-6 shrink-0" />
                    {item.name}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
        
        {/* User section */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="h-8 w-8 bg-gray-300 rounded-full flex items-center justify-center">
                <span className="text-sm font-medium text-gray-700">
                  {user?.name?.charAt(0) || 'A'}
                </span>
              </div>
            </div>
            <div className="ml-3 flex-1">
              <p className="text-sm font-medium text-gray-900">{user?.name}</p>
              <p className="text-xs text-gray-500">{user?.email}</p>
            </div>
            <button
              onClick={logout}
              className="ml-3 p-1 text-gray-400 hover:text-gray-600"
              title="Logout"
            >
              <ArrowRightOnRectangleIcon className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="pl-64">
        <main className="py-6">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
