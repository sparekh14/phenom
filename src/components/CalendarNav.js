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
    <div className="mb-6">
      {/* Desktop and tablet layout */}
      {showNavigation ? (
        /* 3 column grid with navigation arrows */
        <div className="hidden sm:grid sm:grid-cols-3 sm:items-center sm:gap-4">
          {/* Left column - Title only */}
          <div className="flex items-center">
            <h2 className="text-xl font-semibold text-gray-900">
              {formatTitle()}
            </h2>
          </div>

          {/* Center column - Navigation arrows (always centered) */}
          <div className="flex items-center justify-center gap-2">
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

          {/* Right column - Empty (for balance) */}
          <div></div>
        </div>
      ) : (
        /* Single column layout for List View (no navigation arrows) */
        <div className="hidden sm:block">
          <div className="flex items-center">
            <h2 className="text-xl font-semibold text-gray-900">
              {formatTitle()}
            </h2>
          </div>
        </div>
      )}

      {/* Mobile layout - stacked vertically */}
      <div className="sm:hidden space-y-4">
        {/* Title only */}
        <div className="flex items-center justify-center">
          <h2 className="text-xl font-semibold text-gray-900">
            {formatTitle()}
          </h2>
        </div>

        {/* Navigation arrows - centered on mobile (only if not List View) */}
        {showNavigation && (
          <div className="flex items-center justify-center gap-2">
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
        )}
      </div>
    </div>
  );
};

export default CalendarNav; 