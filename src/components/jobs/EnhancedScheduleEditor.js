import React, { useState } from 'react';
import { formatDateSafe } from '../../lib/utils';

/**
 * @typedef {Object} TimeSlot
 * @property {string} [start] - HH:mm format
 * @property {string} [end] - HH:mm format
 */

/**
 * @typedef {Object} ScheduleDay
 * @property {string} date - ISO yyyy-mm-dd format
 * @property {TimeSlot[]} times - Array of time slots
 */

const EnhancedScheduleEditor = ({ value = [], onChange, required = true }) => {
  const [editingDay, setEditingDay] = useState(-1);
  const [tempTime, setTempTime] = useState({ start: '', end: '' });

  const formatDate = (dateString) => {
    return formatDateSafe(dateString, { 
      weekday: 'long', 
      month: 'long', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatTime = (timeString) => {
    if (!timeString) return '';
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const getTodayISO = () => {
    return new Date().toISOString().split('T')[0];
  };

  const addDate = () => {
    const newSchedule = [...value, { date: getTodayISO(), times: [] }];
    onChange(newSchedule);
  };

  const removeDate = (dayIndex) => {
    if (value.length <= 1) return;
    const newSchedule = value.filter((_, index) => index !== dayIndex);
    onChange(newSchedule);
  };

  const updateDate = (dayIndex, newDate) => {
    const newSchedule = [...value];
    newSchedule[dayIndex] = { ...newSchedule[dayIndex], date: newDate };
    onChange(newSchedule);
  };

  const addTime = (dayIndex) => {
    const { start, end } = tempTime;
    
    // Validate end > start if both provided
    if (start && end && end <= start) {
      alert('End time must be after start time');
      return;
    }

    const newSchedule = [...value];
    const timeSlot = {};
    if (start) timeSlot.start = start;
    if (end) timeSlot.end = end;

    newSchedule[dayIndex].times.push(timeSlot);
    onChange(newSchedule);
    
    // Reset temp time and stop editing
    setTempTime({ start: '', end: '' });
    setEditingDay(-1);
  };

  const removeTime = (dayIndex, timeIndex) => {
    const newSchedule = [...value];
    newSchedule[dayIndex].times.splice(timeIndex, 1);
    onChange(newSchedule);
  };

  const cancelTimeEdit = () => {
    setTempTime({ start: '', end: '' });
    setEditingDay(-1);
  };

  // Initialize with one date if empty and required
  if (value.length === 0 && required) {
    addDate();
    return null;
  }

  return (
    <div className="space-y-4">
      {value.map((day, dayIndex) => (
        <div key={dayIndex} className="bg-white border border-gray-200 rounded-lg p-4">
          {/* Date Selection */}
          <div className="flex items-center gap-3 mb-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date
              </label>
              <input
                type="date"
                value={day.date}
                onChange={(e) => updateDate(dayIndex, e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>
            <div className="text-sm text-gray-600 pt-6">
              {formatDate(day.date)}
            </div>
            {value.length > 1 && (
              <button
                type="button"
                onClick={() => removeDate(dayIndex)}
                className="mt-6 p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-md"
                aria-label="Remove date"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            )}
          </div>

          {/* Time Slots */}
          <div className="space-y-3">
            {day.times.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Times
                </label>
                <div className="flex flex-wrap gap-2">
                  {day.times.map((timeSlot, timeIndex) => (
                    <div key={timeIndex} className="inline-flex items-center bg-blue-100 text-blue-800 text-sm px-3 py-1 rounded-full">
                      <span>
                        {timeSlot.start && timeSlot.end 
                          ? `${formatTime(timeSlot.start)} – ${formatTime(timeSlot.end)}`
                          : timeSlot.start 
                            ? `${formatTime(timeSlot.start)}+`
                            : timeSlot.end
                              ? `Until ${formatTime(timeSlot.end)}`
                              : 'Time TBD'
                        }
                      </span>
                      <button
                        type="button"
                        onClick={() => removeTime(dayIndex, timeIndex)}
                        className="ml-2 text-blue-600 hover:text-blue-800"
                        aria-label="Remove time"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Add Time Form */}
            {editingDay === dayIndex ? (
              <div className="bg-gray-50 border border-gray-200 rounded-md p-4 space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Start Time (optional)
                    </label>
                    <input
                      type="time"
                      value={tempTime.start}
                      onChange={(e) => setTempTime(prev => ({ ...prev, start: e.target.value }))}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      End Time (optional)
                    </label>
                    <input
                      type="time"
                      value={tempTime.end}
                      onChange={(e) => setTempTime(prev => ({ ...prev, end: e.target.value }))}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                  </div>
                </div>
                <p className="text-xs text-gray-500">
                  Leave times blank if not yet determined. You can add multiple time slots per day.
                </p>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => addTime(dayIndex)}
                    className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700"
                  >
                    Add Time
                  </button>
                  <button
                    type="button"
                    onClick={cancelTimeEdit}
                    className="px-4 py-2 bg-gray-300 text-gray-700 text-sm font-medium rounded-md hover:bg-gray-400"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setEditingDay(dayIndex)}
                className="text-sm text-blue-600 hover:text-blue-800 font-medium"
              >
                + Add another time
              </button>
            )}
          </div>
        </div>
      ))}

      <button
        type="button"
        onClick={addDate}
        className="w-full px-4 py-2 border-2 border-dashed border-gray-300 text-gray-600 rounded-lg hover:border-blue-300 hover:text-blue-600 transition-colors"
      >
        + Add another date
      </button>

      {required && value.length === 0 && (
        <p className="text-sm text-red-600">At least one date is required</p>
      )}
    </div>
  );
};

export default EnhancedScheduleEditor; 