import React from 'react';

import { getColorBySport } from '../utils/colors';
import { formatEventDateDisplay } from '../utils/timezone';
import { getLocationDisplay } from '../utils/displayHelpers';

const EventTile = ({ event, timezone, onClick, compact = false, showTime = false, detailed = false }) => {

  const getSportIcon = (sport) => {
    switch (sport.toLowerCase()) {
      case 'soccer':
        return '⚽';
      case 'basketball':
        return '🏀';
      case 'football':
        return '🏈';
      case 'baseball':
        return '⚾';
      case 'tennis':
        return '🎾';
      case 'swimming':
        return '🏊';
      case 'volleyball':
        return '🏐';
      case 'hockey':
        return '🏒';
      case 'lacrosse':
        return '🥍';
      default:
        return '🏃';
    }
  };

  if (compact) {
    return (
      <div
        onClick={onClick}
        className={`cursor-pointer p-1 rounded text-xs border-l-2 hover:bg-gray-50 transition-colors ${getColorBySport(event.sport)}`}
      >
        <div className="font-medium truncate">{event.name}</div>
        {showTime && (
          <div className="text-xs opacity-75">
            {formatEventDateDisplay(event.start_date, event.end_date, timezone)}
          </div>
        )}
      </div>
    );
  }

  if (detailed) {
    return (
      <div
        onClick={onClick}
        className={`cursor-pointer p-3 hover:bg-gray-50 transition-colors ${getColorBySport(event.sport)}`}
      >
        <div className="grid grid-cols-12 gap-4 items-center">
          {/* Icon and Event Name */}
          <div className="col-span-4 flex items-center space-x-3">
            <div className="text-xl flex-shrink-0">{getSportIcon(event.sport)}</div>
            <div className="min-w-0">
              <h3 className="font-medium text-gray-900 truncate">{event.name}</h3>
              <div className="text-xs text-gray-500">{event.sport}</div>
            </div>
          </div>

          {/* Date */}
          <div className="col-span-2 text-sm text-gray-600">
            <div className="font-medium">
              {formatEventDateDisplay(event.start_date, event.end_date, timezone)}
            </div>
          </div>

          {/* Location */}
          <div className="col-span-3 text-sm text-gray-600">
            <div className="flex items-center">
              <svg className="w-3 h-3 mr-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span className="truncate">{getLocationDisplay(event.location)}</span>
            </div>
          </div>

          {/* Age Group */}
          <div className="col-span-1 text-sm text-gray-600">
            <div className="font-medium">{event.age}</div>
            <div className="text-xs text-gray-500">Age</div>
          </div>

          {/* Gender */}
          <div className="col-span-1 text-sm text-gray-600">
            <div className="font-medium">{event.gender}</div>
            <div className="text-xs text-gray-500">Gender</div>
          </div>

          {/* Event Type */}
          <div className="col-span-1 text-sm text-gray-500">
            <div className="font-medium">{event.event_type || 'TBD'}</div>
            <div className="text-xs text-gray-400">Type</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      onClick={onClick}
      className={`cursor-pointer p-2 rounded border hover:shadow-sm transition-shadow ${getColorBySport(event.sport)}`}
    >
      <div className="flex items-center space-x-2">
        <span className="text-lg">{getSportIcon(event.sport)}</span>
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-sm text-gray-900 truncate">{event.name}</h4>
          {showTime && (
            <p className="text-xs text-gray-600">
              {formatEventDateDisplay(event.start_date, event.end_date, timezone)}
            </p>
          )}
          <p className="text-xs text-gray-500 truncate">{getLocationDisplay(event.location)}</p>
        </div>

      </div>
    </div>
  );
};

export default EventTile; 