import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import SearchBox from './SearchBox';
import FiltersBar from './FiltersBar';

const Header = ({ 
  currentView, 
  setCurrentView, 
  searchQuery, 
  setSearchQuery, 
  filters, 
  setFilters, 
  events 
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [showFilters, setShowFilters] = useState(false);

  const views = [
    { key: 'month', label: 'Month', path: '/month' },
    { key: 'week', label: 'Week', path: '/week' },
    { key: 'day', label: 'Day', path: '/day' },
    { key: 'list', label: 'List', path: '/list' }
  ];

  const handleViewChange = (view) => {
    setCurrentView(view.key);
    navigate(view.path);
  };

  const currentPath = location.pathname;

  return (
    <header className="bg-white shadow-md border-b">
      <div className="container mx-auto px-4 py-4">
        {/* Top row: Title and View selector */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
          <div className="mb-4 sm:mb-0">
            <h1 className="text-2xl font-bold text-gray-900">Youth Sports Events</h1>
            <p className="text-sm text-gray-600">Calendar & Event Management</p>
          </div>
          
          {/* View Toggle */}
          <div className="flex bg-gray-100 rounded-lg p-1">
            {views.map((view) => (
              <button
                key={view.key}
                onClick={() => handleViewChange(view)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  currentPath === view.path
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {view.label}
              </button>
            ))}
          </div>
        </div>

        {/* Search and Filters Row */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex-1 max-w-md">
            <SearchBox
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
            />
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                showFilters
                  ? 'bg-blue-100 text-blue-700'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <span className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                </svg>
                Filters
              </span>
            </button>
          </div>
        </div>

        {/* Collapsible Filters */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t">
            <FiltersBar
              filters={filters}
              setFilters={setFilters}
              events={events}
            />
          </div>
        )}
      </div>
    </header>
  );
};

export default Header; 