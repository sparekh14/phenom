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

/**
 * @typedef {ScheduleDay[]} JobSchedule
 */

const ScheduleEditor = ({ value = [], onChange, required = true }) => {
  const [editingTime, setEditingTime] = useState({ dayIndex: -1, timeIndex: -1, start: '', end: '' });

  const formatDate = (dateString) => {
    return formatDateSafe(dateString, { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric' 
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
    if (value.length <= 1) return; // Don't allow removing the last date
    const newSchedule = value.filter((_, index) => index !== dayIndex);
    onChange(newSchedule);
  };

  const updateDate = (dayIndex, newDate) => {
    const newSchedule = [...value];
    newSchedule[dayIndex] = { ...newSchedule[dayIndex], date: newDate };
    onChange(newSchedule);
  };

  const startEditingTime = (dayIndex) => {
    setEditingTime({ dayIndex, timeIndex: -1, start: '', end: '' });
  };

  const startEditingExistingTime = (dayIndex, timeIndex) => {
    const timeSlot = value[dayIndex].times[timeIndex];
    setEditingTime({ 
      dayIndex, 
      timeIndex, 
      start: timeSlot.start || '', 
      end: timeSlot.end || '' 
    });
  };

  const saveTime = () => {
    const { dayIndex, timeIndex, start, end } = editingTime;
    
    // Validate end > start if both provided
    if (start && end && end <= start) {
      alert('End time must be after start time');
      return;
    }

    const newSchedule = [...value];
    const timeSlot = {};
    if (start) timeSlot.start = start;
    if (end) timeSlot.end = end;

    if (timeIndex === -1) {
      // Adding new time
      newSchedule[dayIndex].times.push(timeSlot);
    } else {
      // Editing existing time
      newSchedule[dayIndex].times[timeIndex] = timeSlot;
    }

    onChange(newSchedule);
    setEditingTime({ dayIndex: -1, timeIndex: -1, start: '', end: '' });
  };

  const cancelEditingTime = () => {
    setEditingTime({ dayIndex: -1, timeIndex: -1, start: '', end: '' });
  };

  const removeTime = (dayIndex, timeIndex) => {
    const newSchedule = [...value];
    newSchedule[dayIndex].times.splice(timeIndex, 1);
    onChange(newSchedule);
  };

  const renderTimeChip = (timeSlot, dayIndex, timeIndex) => {
    const { start, end } = timeSlot;
    let display = '';
    
    if (start && end) {
      display = `${formatTime(start)} – ${formatTime(end)}`;
    } else if (start) {
      display = `${formatTime(start)} – ?`;
    } else if (end) {
      display = `? – ${formatTime(end)}`;
    } else {
      display = 'Time TBD';
    }

    return (
      <div key={timeIndex} className="inline-flex items-center bg-blue-100 text-blue-800 text-sm px-2 py-1 rounded-md">
        <span 
          className="cursor-pointer hover:text-blue-900"
          onClick={() => startEditingExistingTime(dayIndex, timeIndex)}
        >
          {display}
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
    );
  };

  // Initialize with one date if empty and required
  if (value.length === 0 && required) {
    addDate();
    return null;
  }

  return (
    <div className="space-y-3">
      {value.map((day, dayIndex) => (
        <div key={dayIndex} className="bg-white border border-gray-200 rounded-md p-4">
          <div className="flex items-center gap-3 mb-3">
            <input
              type="date"
              value={day.date}
              onChange={(e) => updateDate(dayIndex, e.target.value)}
              className="h-9 px-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <span className="text-sm text-gray-600">
              {formatDate(day.date)}
            </span>
            {value.length > 1 && (
              <button
                type="button"
                onClick={() => removeDate(dayIndex)}
                className="ml-auto text-red-600 hover:text-red-800"
                aria-label="Remove date"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            )}
          </div>

          {/* Time slots */}
          <div className="space-y-2">
            {day.times.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {day.times.map((timeSlot, timeIndex) => 
                  renderTimeChip(timeSlot, dayIndex, timeIndex)
                )}
              </div>
            )}

            {/* Add/Edit time form */}
            {editingTime.dayIndex === dayIndex ? (
              <div className="bg-gray-50 border border-gray-200 rounded-md p-3 space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Start Time
                    </label>
                    <input
                      type="time"
                      value={editingTime.start}
                      onChange={(e) => setEditingTime(prev => ({ ...prev, start: e.target.value }))}
                      className="w-full h-9 px-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      End Time
                    </label>
                    <input
                      type="time"
                      value={editingTime.end}
                      onChange={(e) => setEditingTime(prev => ({ ...prev, end: e.target.value }))}
                      className="w-full h-9 px-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={saveTime}
                    className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700"
                  >
                    Save
                  </button>
                  <button
                    type="button"
                    onClick={cancelEditingTime}
                    className="px-3 py-1.5 bg-gray-300 text-gray-700 text-sm rounded-md hover:bg-gray-400"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => startEditingTime(dayIndex)}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                + Add time
              </button>
            )}
          </div>
        </div>
      ))}

      <button
        type="button"
        onClick={addDate}
        className="text-sm text-blue-600 hover:text-blue-800"
      >
        + Add another date
      </button>

      {required && value.length === 0 && (
        <p className="text-sm text-red-600">At least one date is required</p>
      )}
    </div>
  );
};

export default ScheduleEditor; 