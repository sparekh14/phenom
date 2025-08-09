import React, { useState, useEffect } from 'react';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, isSameDay, parseISO } from 'date-fns';
import EventTile from './EventTile';
import DayCell from './DayCell';
import { getColorBySport } from '../utils/colors';
import { getLocationDisplay } from '../utils/displayHelpers';

import useMediaQuery from '../hooks/useMediaQuery';

const CalendarGrid = ({ view, events, currentDate, timezone, onEventClick, onDayClick }) => {
  const [isLoading, setIsLoading] = useState(true);
  const isMobile = useMediaQuery('(max-width: 640px)');

  useEffect(() => {
    setIsLoading(false);
  }, []);
  
  // Filter events for the current date/period
  const getEventsForDate = (date) => {
    return events.filter(event => {
      const eventDate = parseISO(event.start_date);
      return isSameDay(eventDate, date);
    }).sort((a, b) => a.name.localeCompare(b.name)); // Sort by name since no time
  };

  const renderMonthView = () => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    const rows = [];
    let days = [];
    let day = startDate;

    // Header row
    const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const headerRow = (
      <div key="header" className="grid grid-cols-7 gap-1 mb-2">
        {daysOfWeek.map(dayName => (
          <div key={dayName} className="p-2 text-center text-sm font-medium text-gray-700">
            {dayName}
          </div>
        ))}
      </div>
    );

    while (day <= endDate) {
      for (let i = 0; i < 7; i++) {
        days.push(
          <DayCell
            key={day.toString()}
            day={day}
            monthStart={monthStart}
            events={events}
            timezone={timezone}
            onEventClick={onEventClick}
            onDayClick={onDayClick}
          />
        );
        day = addDays(day, 1);
      }
      rows.push(
        <div key={day.toString()} className="grid grid-cols-7 gap-1">
          {days}
        </div>
      );
      days = [];
    }

    return (
      <div className="bg-white rounded-lg shadow-md">
        {headerRow}
        <div className="space-y-1">
          {rows}
        </div>
      </div>
    );
  };

  const renderWeekView = () => {
    const startDate = startOfWeek(currentDate);
    const days = [];
    
    for (let i = 0; i < 7; i++) {
      const day = addDays(startDate, i);
      const dayEvents = getEventsForDate(day);
      const isToday = isSameDay(day, new Date());
      
      days.push(
        <div key={day.toString()} className="flex-1 min-w-0" onClick={() => onDayClick(day)}>
          <div className={`text-center p-2 border-b ${isToday ? 'bg-blue-50 text-blue-600' : 'text-gray-700'}`}>
            <div className="text-xs font-medium">{format(day, 'EEE')}</div>
            <div className={`text-lg font-semibold ${isToday ? 'text-blue-600' : 'text-gray-900'}`}>
              {format(day, 'd')}
            </div>
          </div>
          <div className="p-2 space-y-2 min-h-[400px]">
            {dayEvents.slice(0, 2).map(event => (
              <EventTile
                key={event.id}
                event={event}
                timezone={timezone}
                onClick={(e) => {
                  e.stopPropagation();
                  onEventClick(event);
                }}
                showTime={true}
              />
            ))}
            {dayEvents.length > 2 && (
              <div
                className="text-xs text-blue-500 hover:underline cursor-pointer text-center pt-1"
                onClick={(e) => {
                  e.stopPropagation();
                  onDayClick(day);
                }}
              >
                +{dayEvents.length - 2} more
              </div>
            )}
          </div>
        </div>
      );
    }

    return (
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="flex divide-x divide-gray-200">
          {days}
        </div>
      </div>
    );
  };

  const renderDayView = () => {
    const dayEvents = getEventsForDate(currentDate);
    const isToday = isSameDay(currentDate, new Date());

    return (
      <div className="bg-white rounded-lg shadow-md">
        <div className={`text-center py-3 px-4 border-b ${isToday ? 'bg-blue-50' : ''}`}>
          <p className="text-sm text-gray-600">{dayEvents.length} events</p>
        </div>
        <div className="max-h-[70vh] overflow-y-auto">
          {dayEvents.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <svg className="mx-auto h-8 w-8 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p className="mt-1 text-sm">No events scheduled for this day</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {dayEvents.map(event => (
                <EventTile
                  key={event.id}
                  event={event}
                  timezone={timezone}
                  onClick={() => onEventClick(event)}
                  showTime={true}
                  detailed={true}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  if (isLoading) {
    return <div className="text-center p-8">Loading...</div>;
  }

  // Mobile responsive: show list view on small screens for calendar views
  if (isMobile && view !== 'list') {
    const allEventsInPeriod = events.filter(event => {
      const eventDate = parseISO(event.start_date);
      const start = view === 'month' ? startOfMonth(currentDate) : 
                   view === 'week' ? startOfWeek(currentDate) : currentDate;
      const end = view === 'month' ? endOfMonth(currentDate) : 
                 view === 'week' ? endOfWeek(currentDate) : currentDate;
      
      return eventDate >= start && eventDate <= end;
    }).sort((a, b) => {
      return a.start_date.localeCompare(b.start_date);
    });

    return (
      <div className="bg-white rounded-lg shadow-md">
        <div className="p-4 border-b">
          <h3 className="font-semibold text-gray-900">Events</h3>
          <p className="text-sm text-gray-600">{allEventsInPeriod.length} events found</p>
        </div>
        <div className="divide-y divide-gray-200">
          {allEventsInPeriod.map(event => (
            <div
              key={event.id}
              onClick={() => onEventClick(event)}
              className="p-4 hover:bg-gray-50 cursor-pointer"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">{event.name}</h4>
                  <p className="text-sm text-gray-600 mt-1">
                    {event.end_date && event.end_date !== event.start_date 
                      ? `${format(parseISO(event.start_date), 'MMM d, yyyy')} – ${format(parseISO(event.end_date), 'MMM d, yyyy')}`
                      : format(parseISO(event.start_date), 'MMM d, yyyy')
                    }
                  </p>
                  <p className="text-sm text-gray-500">{getLocationDisplay(event.location)}</p>
                </div>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getColorBySport(event.sport)}`}>
                  {event.sport}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  switch (view) {
    case 'month':
      return renderMonthView();
    case 'week':
      return renderWeekView();
    case 'day':
      return renderDayView();
    default:
      return null;
  }
};

export default CalendarGrid; 