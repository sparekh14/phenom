import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import SearchBox from './SearchBox';
import FiltersBar from './FiltersBar';
import CalendarNav from './CalendarNav';

const CalendarToolbar = ({ 
  currentView, 
  setCurrentView, 
  searchQuery, 
  setSearchQuery, 
  filters, 
  setFilters, 
  events,
  currentDate,
  setCurrentDate,
  goToToday,
  navigateDate
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
    <div className="container mx-auto px-4 mt-6">
      {/* Desktop: 3-column grid layout, Mobile: stacked */}
      <div className="hidden md:grid md:grid-cols-3 md:items-center md:gap-4">
        {/* Left: View Toggle */}
        <div className="flex justify-start">
          <div className="flex bg-gray-100 rounded-md p-1 h-9">
            {views.map((view) => (
              <button
                key={view.key}
                onClick={() => handleViewChange(view)}
                className={`px-3 h-7 rounded-md text-sm font-medium transition-colors ${
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

        {/* Center: Date Navigation */}
        <div className="flex items-center gap-3 justify-center">
          <CalendarNav
            currentDate={currentDate}
            setCurrentDate={setCurrentDate}
            currentView={currentView}
            goToToday={goToToday}
            navigateDate={navigateDate}
          />
        </div>

        {/* Right: Search + Filters */}
        <div className="flex items-center gap-3 justify-end">
          <div className="max-w-md md:w-80">
            <SearchBox
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`px-4 h-9 rounded-md border border-gray-300 text-sm font-medium transition-colors ${
              showFilters
                ? 'bg-blue-50 text-blue-700 border-blue-300'
                : 'bg-white text-gray-700 hover:bg-gray-50'
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

      {/* Mobile: Two-row layout */}
      <div className="flex flex-col gap-3 md:hidden">
        {/* Row 1: View Toggle (scrollable) + Filters */}
        <div className="flex items-center justify-between gap-3">
          {/* Scrollable View Toggle */}
          <div className="overflow-x-auto whitespace-nowrap -mx-2 px-2 flex-1">
            <div className="inline-flex bg-gray-100 rounded-md p-1 h-10">
              {views.map((view) => (
                <button
                  key={view.key}
                  onClick={() => handleViewChange(view)}
                  className={`px-3 h-8 min-w-[44px] rounded-md text-sm font-medium transition-colors ${
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

          {/* Filters Button */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`px-4 h-10 min-w-[44px] rounded-md border border-gray-300 text-sm font-medium transition-colors flex-shrink-0 ${
              showFilters
                ? 'bg-blue-50 text-blue-700 border-blue-300'
                : 'bg-white text-gray-700 hover:bg-gray-50'
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

        {/* Row 2: Full-width Search */}
        <div className="w-full">
          <SearchBox
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
          />
        </div>

        {/* Date Navigation - Centered (below both rows) */}
        <div className="flex justify-center">
          <CalendarNav
            currentDate={currentDate}
            setCurrentDate={setCurrentDate}
            currentView={currentView}
            goToToday={goToToday}
            navigateDate={navigateDate}
          />
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
  );
};

export default CalendarToolbar; 