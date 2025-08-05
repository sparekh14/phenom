import { parseISO } from 'date-fns';
import { zonedTimeToUtc, utcToZonedTime, format as formatTz } from 'date-fns-tz';

// Get user's timezone
export const getUserTimezone = () => {
  return Intl.DateTimeFormat().resolvedOptions().timeZone;
};

// Convert event time from its timezone to user's timezone
export const convertEventTime = (date, time, eventTimezone, userTimezone) => {
  try {
    // Create date-time string in event's timezone
    const dateTimeString = `${date}T${time}:00`;
    const eventDateTime = parseISO(dateTimeString);
    
    // Convert from event timezone to UTC, then to user timezone
    const eventInEventTz = zonedTimeToUtc(eventDateTime, eventTimezone);
    const eventInUserTz = utcToZonedTime(eventInEventTz, userTimezone);
    
    return {
      eventTime: eventDateTime,
      userTime: eventInUserTz,
      eventTimezone,
      userTimezone
    };
  } catch (error) {
    console.error('Error converting timezone:', error);
    return null;
  }
};

// Format time display showing both original and user timezone
export const formatTimeDisplay = (date, time, eventTimezone, userTimezone) => {
  const converted = convertEventTime(date, time, eventTimezone, userTimezone);
  
  if (!converted) {
    return `${time} ${eventTimezone}`;
  }
  
  const eventTimeStr = formatTz(converted.eventTime, 'HH:mm', { timeZone: eventTimezone });
  const userTimeStr = formatTz(converted.userTime, 'HH:mm', { timeZone: userTimezone });
  
  const eventTzAbbr = formatTz(converted.eventTime, 'zzz', { timeZone: eventTimezone });
  const userTzAbbr = formatTz(converted.userTime, 'zzz', { timeZone: userTimezone });
  
  if (eventTimezone === userTimezone) {
    return `${eventTimeStr} ${eventTzAbbr}`;
  }
  
  return `${eventTimeStr} ${eventTzAbbr} (${userTimeStr} ${userTzAbbr})`;
};

// Format date display
export const formatDateDisplay = (date, timezone) => {
  try {
    const dateObj = parseISO(`${date}T00:00:00`);
    return formatTz(dateObj, 'EEEE, MMMM d, yyyy', { timeZone: timezone });
  } catch (error) {
    console.error('Error formatting date:', error);
    return date;
  }
};

// Check if event is in user's timezone
export const isEventInUserTimezone = (eventTimezone, userTimezone) => {
  return eventTimezone === userTimezone;
}; 