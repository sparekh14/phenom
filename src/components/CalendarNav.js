import React from 'react';
import { format } from 'date-fns';

const CalendarNav = ({ currentDate, setCurrentDate, currentView, goToToday, navigateDate }) => {
  const formatTitle = () => {
    switch (currentView) {
      case 'month':
        return format(currentDate, 'MMMM yyyy');
      case 'week':
        const weekStart = new Date(currentDate);
        weekStart.setDate(currentDate.getDate() - currentDate.getDay());
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);
        return `${format(weekStart, 'MMM d')} - ${format(weekEnd, 'MMM d, yyyy')}`;
      case 'day':
        return format(currentDate, 'EEEE, MMMM d, yyyy');
      default:
        return '';
    }
  };

  const getNavigationLabel = (direction) => {
    switch (currentView) {
      case 'month':
        return direction === -1 ? 'Previous Month' : 'Next Month';
      case 'week':
        return direction === -1 ? 'Previous Week' : 'Next Week';
      case 'day':
        return direction === -1 ? 'Previous Day' : 'Next Day';
      default:
        return '';
    }
  };

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
      <div className="flex items-center gap-4">
        <h2 className="text-xl font-semibold text-gray-900">
          {formatTitle()}
        </h2>
        
        <button
          onClick={goToToday}
          className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors"
        >
          Today
        </button>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={() => navigateDate(-1)}
          className="p-2 rounded-md hover:bg-gray-100 transition-colors"
          title={getNavigationLabel(-1)}
        >
          <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        
        <button
          onClick={() => navigateDate(1)}
          className="p-2 rounded-md hover:bg-gray-100 transition-colors"
          title={getNavigationLabel(1)}
        >
          <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Keyboard shortcuts hint */}
      <div className="hidden lg:block text-xs text-gray-500">
        <div className="flex items-center gap-4">
          <span>←/→ Navigate</span>
          <span>T Today</span>
          <span>F Search</span>
          <span>Esc Close</span>
        </div>
      </div>
    </div>
  );
};

export default CalendarNav; 