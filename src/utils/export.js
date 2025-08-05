import { createEvent } from 'ics';

// Generate Google Calendar URL
export const generateGoogleCalendarUrl = (event, userTimezone) => {
  try {
    // Format dates for Google Calendar all-day events (YYYYMMDD format)
    const startDate = event.start_date.replace(/-/g, '');
    const endDateObj = new Date(event.end_date);
    endDateObj.setDate(endDateObj.getDate() + 1); // Add 1 day for all-day events
    const endDate = endDateObj.toISOString().substr(0, 10).replace(/-/g, '');
    
    const params = new URLSearchParams({
      action: 'TEMPLATE',
      text: event.name,
      dates: `${startDate}/${endDate}`,
      details: `Sport: ${event.sport || 'N/A'}\\nAge Group: ${event.age || 'N/A'}\\nGender: ${event.gender || 'N/A'}\\nEvent Type: ${event.event_type || 'N/A'}`,
      location: event.location || '',
      sprop: 'website:youth-sports-calendar'
    });
    
    return `https://calendar.google.com/calendar/render?${params.toString()}`;
  } catch (error) {
    console.error('Error generating Google Calendar URL:', error);
    return '#';
  }
};

// Generate ICS file content for a single event
export const generateICSContent = (event, userTimezone) => {
  try {
    const startDate = new Date(event.start_date);
    const endDate = new Date(event.end_date);
    endDate.setDate(endDate.getDate() + 1); // Add 1 day for all-day events
    
    const icsEvent = {
      title: event.name,
      description: `Sport: ${event.sport || 'N/A'}\\nAge Group: ${event.age || 'N/A'}\\nGender: ${event.gender || 'N/A'}\\nEvent Type: ${event.event_type || 'N/A'}`,
      location: event.location || '',
      start: [
        startDate.getFullYear(),
        startDate.getMonth() + 1,
        startDate.getDate()
      ],
      end: [
        endDate.getFullYear(),
        endDate.getMonth() + 1,
        endDate.getDate()
      ],
      status: 'CONFIRMED',
      uid: event.id,
      allDay: true
    };
    
    return createEvent(icsEvent);
  } catch (error) {
    console.error('Error generating ICS content:', error);
    return { error: error.message };
  }
};

// Download ICS file for a single event
export const downloadICSFile = (event, userTimezone) => {
  try {
    const result = generateICSContent(event, userTimezone);
    
    if (!result || result.error) {
      console.error('Error generating ICS:', result ? result.error : 'Invalid event data');
      console.error('Problematic event:', event);
      alert('Could not generate the .ics file. The event data might be incomplete or invalid.');
      return;
    }
    
    const blob = new Blob([result.value], { type: 'text/calendar;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${event.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.ics`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
  } catch (error) {
    console.error('An unexpected error occurred while generating the ICS file:', error);
    console.error('Problematic event:', event);
    alert('An unexpected error occurred. Please check the console for more details.');
  }
};

// Download ICS file for multiple events
export const downloadMultipleEventsICS = (events, userTimezone) => {
  try {
    let icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Youth Sports Calendar//EN
CALSCALE:GREGORIAN
METHOD:PUBLISH
`;

    let eventCount = 0;
    events.forEach(event => {
      try {
        const result = generateICSContent(event, userTimezone);
        if (result && !result.error) {
          const veventMatch = result.value.match(/BEGIN:VEVENT[\s\S]*?END:VEVENT/);
          if (veventMatch) {
            icsContent += veventMatch[0] + '\n';
            eventCount++;
          }
        } else {
          console.error('Problematic event:', event);
        }
      } catch (error) {
        console.error('An unexpected error occurred for an event:', event, error);
      }
    });
    
    if (eventCount === 0) {
      alert('Could not generate the .ics file. No valid events found.');
      return;
    }
    
    icsContent += 'END:VCALENDAR';
    
    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'youth_sports_events.ics';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
  } catch (error) {
    console.error('An unexpected error occurred while generating the multiple-event ICS file:', error);
    alert('An unexpected error occurred. Please check the console for more details.');
  }
}; 