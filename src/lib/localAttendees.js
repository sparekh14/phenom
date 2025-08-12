// localStorage helper for managing event attendees
// Stores data under key: attendees:<eventId>

/**
 * @typedef {Object} Attendee
 * @property {string} name
 * @property {"Photography" | "Videography"} role
 * @property {string} [portfolioUrl]
 * @property {string} createdAt
 */

// Get attendees for a specific event
export function getAttendees(eventId) {
  try {
    const key = `attendees:${eventId}`;
    const stored = localStorage.getItem(key);
    if (!stored) return [];
    
    const attendees = JSON.parse(stored);
    return Array.isArray(attendees) ? attendees : [];
  } catch (error) {
    console.error('Error reading attendees from localStorage:', error);
    return [];
  }
}

// Add attendee to event (handles deduplication)
export function addAttendee(eventId, attendee) {
  try {
    const existingAttendees = getAttendees(eventId);
    
    // Normalize inputs for comparison
    const normalizedName = attendee.name.trim().toLowerCase();
    const normalizedUrl = attendee.portfolioUrl?.trim().toLowerCase() || '';
    
    // Check for duplicates (case-insensitive name + portfolioUrl pair)
    const isDuplicate = existingAttendees.some(existing => {
      const existingName = existing.name.trim().toLowerCase();
      const existingUrl = existing.portfolioUrl?.trim().toLowerCase() || '';
      return existingName === normalizedName && existingUrl === normalizedUrl;
    });
    
    if (isDuplicate) {
      return { success: false, error: "You're already on this list." };
    }
    
    // Normalize portfolio URL - add https:// if missing scheme
    let normalizedPortfolioUrl = attendee.portfolioUrl?.trim() || undefined;
    if (normalizedPortfolioUrl && !normalizedPortfolioUrl.match(/^https?:\/\//)) {
      normalizedPortfolioUrl = `https://${normalizedPortfolioUrl}`;
    }
    
    // Create new attendee object
    const newAttendee = {
      name: attendee.name.trim(),
      role: attendee.role,
      portfolioUrl: normalizedPortfolioUrl,
      createdAt: new Date().toISOString()
    };
    
    // Add to list and save
    const updatedAttendees = [...existingAttendees, newAttendee];
    const key = `attendees:${eventId}`;
    localStorage.setItem(key, JSON.stringify(updatedAttendees));
    
    return { success: true, attendee: newAttendee };
  } catch (error) {
    console.error('Error adding attendee to localStorage:', error);
    return { success: false, error: 'Failed to save attendee. Please try again.' };
  }
}

// Clear all attendees for an event (for testing/admin use)
export function clearAttendees(eventId) {
  try {
    const key = `attendees:${eventId}`;
    localStorage.removeItem(key);
    return true;
  } catch (error) {
    console.error('Error clearing attendees from localStorage:', error);
    return false;
  }
}

 