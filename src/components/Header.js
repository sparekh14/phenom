import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const mainTabs = [
    { key: 'calendar', label: 'Calendar', path: '/month', isActive: ['/month', '/week', '/day', '/list'].includes(location.pathname) },
    { key: 'jobs', label: 'Job Board', path: '/jobs', isActive: location.pathname.startsWith('/jobs') }
  ];

  const handleMainTabChange = (tab) => {
    navigate(tab.path);
  };

  return (
    <header className="bg-white shadow-md border-b">
      <div className="container mx-auto px-4 py-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div className="mb-4 sm:mb-0">
            <h1 className="text-2xl font-bold text-gray-900">Phenom</h1>
            <p className="text-sm text-gray-600">Your Hub for Youth Sports</p>
          </div>
          
          {/* Main Navigation Tabs */}
          <div className="flex space-x-1">
            {mainTabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => handleMainTabChange(tab)}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors focus:outline-none ${
                  tab.isActive
                    ? 'bg-blue-600 text-white'
                    : 'border border-gray-300 text-gray-700 hover:bg-gray-100'
                }`}
                aria-current={tab.isActive ? 'page' : undefined}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header; 