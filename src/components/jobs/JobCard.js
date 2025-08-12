import React from 'react';
import { formatDateSafe } from '../../lib/utils';

const JobCard = ({ job, onClick }) => {

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'Video':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
        );
      case 'Photo':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        );
      case 'Video & Photo':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
          </svg>
        );
      case 'Design':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
          </svg>
        );
      case 'Editing':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        );
      default:
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2V6" />
          </svg>
        );
    }
  };

  const formatTime = (timeString) => {
    if (!timeString) return '';
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const formatSchedule = (schedule) => {
    if (!schedule || schedule.length === 0) return 'TBD';
    
    if (schedule.length === 1) {
      const day = schedule[0];
      const dateStr = formatDateSafe(day.date, { 
        month: 'short', 
        day: 'numeric', 
        year: 'numeric' 
      });
      
      if (day.times.length === 0) {
        return dateStr;
      } else {
        const timeStrs = day.times.map(time => {
          if (time.start && time.end) {
            return `${formatTime(time.start)}–${formatTime(time.end)}`;
          } else if (time.start) {
            return `${formatTime(time.start)}+`;
          } else if (time.end) {
            return `–${formatTime(time.end)}`;
          }
          return 'TBD';
        });
        return `${dateStr} (${timeStrs.join(', ')})`;
      }
    } else {
      const startStr = formatDateSafe(schedule[0].date, { month: 'short', day: 'numeric' });
      const endStr = formatDateSafe(schedule[schedule.length - 1].date, { 
        month: 'short', 
        day: 'numeric', 
        year: 'numeric' 
      });
      return `${startStr}–${endStr}`;
    }
  };

  const formatLocation = (location) => {
    if (!location) return 'TBD';
    if (typeof location === 'string') return location; // Legacy support
    return location.city && location.state ? `${location.city}, ${location.state}` : 'TBD';
  };



  return (
    <div 
      className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow cursor-pointer"
      onClick={() => onClick(job)}
    >
      {/* Title */}
      <h3 className="text-lg font-semibold text-gray-900 mb-3 line-clamp-2">
        {job.title}
      </h3>

      {/* Essential Details */}
      <div className="space-y-2 text-sm text-gray-600 mb-4">
        <div>
          <span className="font-medium">Location:</span> {formatLocation(job.location)}
        </div>
        <div>
          <span className="font-medium">Sport:</span> {job.sport}
        </div>
        <div>
          <span className="font-medium">Date:</span> {formatSchedule(job.schedule)}
        </div>
        <div>
          <span className="font-medium">Budget:</span> {job.budgetRange || job.budget || 'TBD'}
        </div>
      </div>

      {/* Footer */}
      <div className="flex justify-end pt-2 border-t border-gray-100">
        <span className="text-xs text-blue-600 hover:text-blue-800">View Details →</span>
      </div>
    </div>
  );
  };

export default JobCard; 