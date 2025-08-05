// src/components/DayCell.js
import React from 'react';
import { format, isSameMonth, isSameDay, parseISO } from 'date-fns';
import EventTile from './EventTile';

const DayCell = ({ day, monthStart, events, timezone, onEventClick, onDayClick }) => {
  const dayEvents = events.filter(event => isSameDay(parseISO(event.start_date), day));
  const isCurrentMonth = isSameMonth(day, monthStart);
  const isToday = isSameDay(day, new Date());
  const dateFormat = "d";

  return (
    <div
      className={`min-h-[100px] p-2 border border-gray-200 cursor-pointer ${
        isCurrentMonth ? 'bg-white' : 'bg-gray-50'
      } ${isToday ? 'ring-2 ring-blue-500' : ''}`}
      onClick={() => onDayClick(day)}
    >
      <div className={`text-sm font-medium mb-1 ${
        isCurrentMonth ? (isToday ? 'text-blue-600' : 'text-gray-900') : 'text-gray-400'
      }`}>
        {format(day, dateFormat)}
      </div>
      <div className="space-y-1">
        {dayEvents.slice(0, 2).map(event => (
          <EventTile
            key={event.id}
            event={event}
            timezone={timezone}
            onClick={(e) => {
              e.stopPropagation();
              onEventClick(event);
            }}
            compact={true}
          />
        ))}
        {dayEvents.length > 2 && (
          <div
            className="text-xs text-blue-500 hover:underline cursor-pointer"
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
};

export default DayCell;
