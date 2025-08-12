import React, { useState, useCallback } from 'react';
import { SPORTS } from '../../constants/sports';

const JobFilters = ({ filters, onFiltersChange }) => {
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [localSport, setLocalSport] = useState(filters.sport || '');

  const categories = ['Video', 'Photo', 'Video & Photo', 'Design', 'Editing'];

  // Debounced filter updates
  const debouncedUpdateFilters = useCallback(
    debounce((newFilters) => {
      onFiltersChange(newFilters);
    }, 300),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  const handleCategoryToggle = (category) => {
    const currentCategories = filters.categories || [];
    const updatedCategories = currentCategories.includes(category)
      ? currentCategories.filter(c => c !== category)
      : [...currentCategories, category];
    
    onFiltersChange({ ...filters, categories: updatedCategories });
  };

  const handleSportChange = (value) => {
    setLocalSport(value);
    debouncedUpdateFilters({ ...filters, sport: value });
  };



  const clearFilters = () => {
    setLocalSport('');
    onFiltersChange({
      categories: [],
      sport: ''
    });
  };

  const hasActiveFilters = () => {
    return (filters.categories && filters.categories.length > 0) ||
           filters.sport;
  };

  const FilterContent = () => (
    <div className="space-y-6">
      {/* Categories */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Category
        </label>
        <div className="flex flex-col gap-3 w-full">
          {categories.map(category => (
            <button
              key={category}
              onClick={() => handleCategoryToggle(category)}
              className={`w-full px-4 py-3 text-sm rounded-md border transition-colors text-left font-medium min-h-[44px] flex items-center ${
                (filters.categories || []).includes(category)
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-gray-700 border-gray-300 hover:border-blue-300 hover:bg-gray-50'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Sport */}
      <div>
        <label htmlFor="sport-filter" className="block text-sm font-medium text-gray-700 mb-2">
          Sport
        </label>
        <select
          id="sport-filter"
          value={localSport}
          onChange={(e) => handleSportChange(e.target.value)}
          className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
        >
          <option value="">All Sports</option>
          {SPORTS.map(sport => (
            <option key={sport} value={sport}>{sport}</option>
          ))}
        </select>
      </div>





      {/* Clear Filters */}
      {hasActiveFilters() && (
        <button
          onClick={clearFilters}
          className="w-full px-4 py-2 text-sm text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
        >
          Clear All Filters
        </button>
      )}
    </div>
  );

  return (
    <>
      {/* Desktop Filters */}
      <div className="hidden lg:block bg-white rounded-lg shadow-sm border border-gray-200 p-6 min-w-[280px] w-full">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
          {hasActiveFilters() && (
            <span className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
              Active
            </span>
          )}
        </div>
        <FilterContent />
      </div>

      {/* Mobile Filter Toggle */}
      <div className="lg:hidden mb-4">
        <button
          onClick={() => setShowMobileFilters(!showMobileFilters)}
          className="flex items-center justify-between w-full px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
        >
          <span className="flex items-center">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            Filters
            {hasActiveFilters() && (
              <span className="ml-2 text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
                Active
              </span>
            )}
          </span>
          <svg 
            className={`w-4 h-4 transition-transform ${showMobileFilters ? 'rotate-180' : ''}`} 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {/* Mobile Filter Panel */}
        {showMobileFilters && (
          <div className="mt-4 bg-white rounded-lg shadow-sm border border-gray-200 p-4 min-w-[280px] w-full">
            <FilterContent />
          </div>
        )}
      </div>
    </>
  );
};

export default JobFilters; 