import React from 'react';

const FiltersBar = ({ filters, setFilters, events }) => {
  // Get unique values for dropdowns
  const sports = [...new Set(events.map(e => e.sport))].filter(Boolean).sort();
  const ages = [...new Set(events.map(e => e.age))].filter(Boolean).sort();
  const genders = [...new Set(events.map(e => e.gender))].filter(Boolean).sort();
  const eventTypes = [...new Set(events.map(e => e.event_type))].filter(Boolean).sort();

  const updateFilter = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const clearAllFilters = () => {
    setFilters({
      sport: '',
      location: '',
      age: '',
      gender: '',
      eventType: '',
      dateRange: { start: null, end: null }
    });
  };

  const hasActiveFilters = Object.values(filters).some(value => {
    if (typeof value === 'object' && value !== null) {
      return value.start !== null || value.end !== null;
    }
    return value !== '';
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-4">
        {/* Sport Filter */}
        <div className="flex flex-col">
          <label className="text-sm font-medium text-gray-700 mb-1">Sport</label>
          <select
            value={filters.sport}
            onChange={(e) => updateFilter('sport', e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">All Sports</option>
            {sports.map(sport => (
              <option key={sport} value={sport}>{sport}</option>
            ))}
          </select>
        </div>



        {/* Age Filter */}
        <div className="flex flex-col">
          <label className="text-sm font-medium text-gray-700 mb-1">Age Group</label>
          <select
            value={filters.age}
            onChange={(e) => updateFilter('age', e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">All Ages</option>
            {ages.map(age => (
              <option key={age} value={age}>{age}</option>
            ))}
          </select>
        </div>

        {/* Gender Filter */}
        <div className="flex flex-col">
          <label className="text-sm font-medium text-gray-700 mb-1">Gender</label>
          <select
            value={filters.gender}
            onChange={(e) => updateFilter('gender', e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">All Genders</option>
            {genders.map(gender => (
              <option key={gender} value={gender}>{gender}</option>
            ))}
          </select>
        </div>

        {/* Event Type Filter */}
        <div className="flex flex-col">
          <label className="text-sm font-medium text-gray-700 mb-1">Event Type</label>
          <select
            value={filters.eventType}
            onChange={(e) => updateFilter('eventType', e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">All Types</option>
            {eventTypes.map(eventType => (
              <option key={eventType} value={eventType}>{eventType}</option>
            ))}
          </select>
        </div>

        {/* Location Filter */}
        <div className="flex flex-col">
          <label className="text-sm font-medium text-gray-700 mb-1">Location</label>
          <input
            type="text"
            placeholder="Filter by location..."
            value={filters.location}
            onChange={(e) => updateFilter('location', e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      {/* Date Range */}
      <div className="flex flex-col sm:flex-row sm:items-end gap-4">
        <div className="flex flex-col">
          <label className="text-sm font-medium text-gray-700 mb-1">Start Date</label>
          <input
            type="date"
            value={filters.dateRange.start ? filters.dateRange.start.toISOString().split('T')[0] : ''}
            onChange={(e) => updateFilter('dateRange', {
              ...filters.dateRange,
              start: e.target.value ? new Date(e.target.value) : null
            })}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div className="flex flex-col">
          <label className="text-sm font-medium text-gray-700 mb-1">End Date</label>
          <input
            type="date"
            value={filters.dateRange.end ? filters.dateRange.end.toISOString().split('T')[0] : ''}
            onChange={(e) => updateFilter('dateRange', {
              ...filters.dateRange,
              end: e.target.value ? new Date(e.target.value) : null
            })}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        
        {hasActiveFilters && (
          <button
            onClick={clearAllFilters}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md text-sm hover:bg-gray-200 transition-colors"
          >
            Clear All
          </button>
        )}
      </div>
    </div>
  );
};

export default FiltersBar; 