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

  // Check if navigation arrows should be shown (not in List View)
  const showNavigation = currentView !== 'list';

  return (
    <div>
      {/* Simplified layout for toolbar integration */}
      {showNavigation ? (
        /* Navigation with arrows and title */
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigateDate(-1)}
            className="p-2 rounded-md hover:bg-gray-100 transition-colors h-9 w-9 flex items-center justify-center"
            title={getNavigationLabel(-1)}
          >
            <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          
          <h2 className="text-lg font-semibold text-gray-900 whitespace-nowrap">
            {formatTitle()}
          </h2>
          
          <button
            onClick={() => navigateDate(1)}
            className="p-2 rounded-md hover:bg-gray-100 transition-colors h-9 w-9 flex items-center justify-center"
            title={getNavigationLabel(1)}
          >
            <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      ) : (
        /* Title only for List View */
        <div className="flex items-center justify-center">
          <h2 className="text-lg font-semibold text-gray-900">
            {formatTitle()}
          </h2>
        </div>
      )}
    </div>
  );
};

export default CalendarNav; 