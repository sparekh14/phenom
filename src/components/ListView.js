import React, { useState } from 'react';
import { format, parseISO } from 'date-fns';

import { downloadMultipleEventsICS } from '../utils/export';
import { getColorBySport } from '../utils/colors';
import { isValidExternalWebsite, getWebsiteDisplayText, getWebsiteDisplayClass } from '../utils/websiteValidation';
import { getLocationDisplay, getAgeDisplay, getGenderDisplay, getEventTypeDisplay, getDisplayClass } from '../utils/displayHelpers';

const ListView = ({ events, timezone, onEventClick }) => {
  const [sortField, setSortField] = useState('startDateTime');
  const [sortDirection, setSortDirection] = useState('asc');

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const sortedEvents = [...events].sort((a, b) => {
    let aValue, bValue;
    
    switch (sortField) {
      case 'startDateTime':
        aValue = new Date(a.start_date);
        bValue = new Date(b.start_date);
        break;
      case 'name':
        aValue = a.name.toLowerCase();
        bValue = b.name.toLowerCase();
        break;
      case 'sport':
        aValue = a.sport.toLowerCase();
        bValue = b.sport.toLowerCase();
        break;
      case 'location':
        aValue = a.location.toLowerCase();
        bValue = b.location.toLowerCase();
        break;
      case 'age':
        aValue = a.age.toLowerCase();
        bValue = b.age.toLowerCase();
        break;
      case 'gender':
        aValue = a.gender.toLowerCase();
        bValue = b.gender.toLowerCase();
        break;
      case 'eventType':
        aValue = (a.event_type || '').toLowerCase();
        bValue = (b.event_type || '').toLowerCase();
        break;

      default:
        return 0;
    }

    if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  const getSortIcon = (field) => {
    if (sortField !== field) {
      return (
        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
        </svg>
      );
    }
    
    return sortDirection === 'asc' ? (
      <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
      </svg>
    ) : (
      <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h9m5-4v12m0 0l-4-4m4 4l4-4" />
      </svg>
    );
  };



  const getSportIcon = (sport) => {
    switch (sport.toLowerCase()) {
      case 'soccer': return '⚽';
      case 'basketball': return '🏀';
      case 'football': return '🏈';
      case 'baseball': return '⚾';
      case 'tennis': return '🎾';
      case 'swimming': return '🏊';
      case 'volleyball': return '🏐';
      case 'hockey': return '🏒';
      case 'lacrosse': return '🥍';
      default: return '🏃';
    }
  };

  const handleExportAll = () => {
    downloadMultipleEventsICS(sortedEvents, timezone);
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      {/* Header with Export Button */}
      <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Events List</h3>
          <p className="text-sm text-gray-600">{sortedEvents.length} events found</p>
        </div>
        <button
          onClick={handleExportAll}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Export All (.ics)
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200" style={{ minWidth: '1400px' }}>
          <thead className="bg-gray-50">
            <tr>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('startDateTime')}
              >
                <div className="flex items-center space-x-1">
                  <span>Start Date/Time</span>
                  {getSortIcon('startDateTime')}
                </div>
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('startDateTime')}
              >
                <div className="flex items-center space-x-1">
                  <span>End Date/Time</span>
                  {getSortIcon('startDateTime')}
                </div>
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('name')}
              >
                <div className="flex items-center space-x-1">
                  <span>Event Name</span>
                  {getSortIcon('name')}
                </div>
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('location')}
              >
                <div className="flex items-center space-x-1">
                  <span>Location</span>
                  {getSortIcon('location')}
                </div>
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('sport')}
              >
                <div className="flex items-center space-x-1">
                  <span>Sport</span>
                  {getSortIcon('sport')}
                </div>
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('age')}
              >
                <div className="flex items-center space-x-1">
                  <span>Age</span>
                  {getSortIcon('age')}
                </div>
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('gender')}
              >
                <div className="flex items-center space-x-1">
                  <span>Gender</span>
                  {getSortIcon('gender')}
                </div>
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('eventType')}
              >
                <div className="flex items-center space-x-1">
                  <span>Event Type</span>
                  {getSortIcon('eventType')}
                </div>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <div className="flex items-center space-x-1">
                  <span>Website</span>
                </div>
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sortedEvents.map((event) => (
              <tr
                key={event.id}
                onClick={() => onEventClick(event)}
                className={`hover:bg-gray-50 cursor-pointer ${getColorBySport(event.sport)}`}
              >
                {/* Start Date/Time */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {format(parseISO(event.start_date), 'MMM d, yyyy')}
                  </div>
                  <div className="text-sm text-gray-500">
                    All Day Event
                  </div>
                </td>
                {/* End Date/Time (same as start for now) */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {format(parseISO(event.end_date), 'MMM d, yyyy')}
                  </div>
                  <div className="text-sm text-gray-500">
                    All Day Event
                  </div>
                </td>
                {/* Event Name */}
                <td className="px-6 py-4">
                  <div className="flex items-center">
                    <span className="text-lg mr-3">{getSportIcon(event.sport)}</span>
                    <div className="text-sm font-medium text-gray-900">{event.name}</div>
                  </div>
                </td>
                {/* Location */}
                <td className="px-6 py-4">
                  <div className={getDisplayClass(event.location)}>{getLocationDisplay(event.location)}</div>
                </td>
                {/* Sport */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{event.sport}</div>
                </td>
                {/* Age */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className={getDisplayClass(event.age)}>{getAgeDisplay(event.age)}</div>
                </td>
                {/* Gender */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className={getDisplayClass(event.gender)}>{getGenderDisplay(event.gender)}</div>
                </td>
                {/* Event Type */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className={getDisplayClass(event.event_type)}>{getEventTypeDisplay(event.event_type)}</div>
                </td>
                {/* Website */}
                <td className="px-6 py-4 whitespace-nowrap">
                  {isValidExternalWebsite(event.website) ? (
                    <a 
                      href={event.website} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className={getWebsiteDisplayClass(event.website)}
                      onClick={(e) => e.stopPropagation()}
                    >
                      {getWebsiteDisplayText(event.website)}
                    </a>
                  ) : (
                    <div className={getWebsiteDisplayClass(event.website)}>
                      {getWebsiteDisplayText(event.website)}
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Empty state */}
      {sortedEvents.length === 0 && (
        <div className="text-center py-12">
          <svg className="mx-auto h-12 w-12 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No events found</h3>
          <p className="mt-1 text-sm text-gray-500">Try adjusting your filters to see more events.</p>
        </div>
      )}
    </div>
  );
};

export default ListView; 