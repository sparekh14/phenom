/**
 * Display helper utilities for consistent handling of null/empty values
 */

/**
 * Get display value for a field, showing "N/A" for null/empty values
 * @param {any} value - The value to display
 * @param {string} defaultValue - Default value to show if null/empty (defaults to "N/A")
 * @returns {string} - Display value
 */
export const getDisplayValue = (value, defaultValue = 'N/A') => {
  if (value === null || value === undefined || value === '') {
    return defaultValue;
  }
  
  // Convert to string and trim
  const stringValue = String(value).trim();
  
  // Check for common "empty" values
  const emptyValues = ['null', 'undefined', 'none', 'n/a', 'na', 'not available'];
  if (emptyValues.includes(stringValue.toLowerCase())) {
    return defaultValue;
  }
  
  return stringValue;
};

/**
 * Get display value for age field
 * @param {string} age - Age value
 * @returns {string} - Display value
 */
export const getAgeDisplay = (age) => {
  return getDisplayValue(age, 'N/A');
};

/**
 * Get display value for gender field
 * @param {string} gender - Gender value
 * @returns {string} - Display value
 */
export const getGenderDisplay = (gender) => {
  return getDisplayValue(gender, 'N/A');
};

/**
 * Get display value for event type field
 * @param {string} eventType - Event type value
 * @returns {string} - Display value
 */
export const getEventTypeDisplay = (eventType) => {
  return getDisplayValue(eventType, 'N/A');
};

/**
 * Get display value for location field
 * @param {string} location - Location value
 * @returns {string} - Display value
 */
export const getLocationDisplay = (location) => {
  return getDisplayValue(location, 'N/A');
};

/**
 * Get CSS class for display value
 * @param {string} value - The value to check
 * @param {string} defaultClass - Default CSS class for normal values
 * @param {string} emptyClass - CSS class for empty/null values
 * @returns {string} - CSS class
 */
export const getDisplayClass = (value, defaultClass = 'text-sm text-gray-900', emptyClass = 'text-sm text-gray-400 italic') => {
  const displayValue = getDisplayValue(value);
  return displayValue === 'N/A' ? emptyClass : defaultClass;
}; 