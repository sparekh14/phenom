/**
 * Website validation utilities
 */

/**
 * Check if a website URL is valid and external
 * @param {string} url - The URL to validate
 * @returns {boolean} - True if the URL is valid and external
 */
export const isValidExternalWebsite = (url) => {
  if (!url || typeof url !== 'string') {
    return false;
  }

  // Remove whitespace
  url = url.trim();
  
  // Check if it's empty or just whitespace
  if (!url || url === '') {
    return false;
  }

  // Check if it's "N/A" or similar placeholder values
  const placeholderValues = ['n/a', 'na', 'not available', 'none', 'null', 'undefined'];
  if (placeholderValues.includes(url.toLowerCase())) {
    return false;
  }

  try {
    // Try to create a URL object
    const urlObj = new URL(url);
    
    // Check if it has a valid protocol (http or https)
    if (!urlObj.protocol || !['http:', 'https:'].includes(urlObj.protocol)) {
      return false;
    }
    
    // Check if it has a hostname
    if (!urlObj.hostname || urlObj.hostname === '') {
      return false;
    }
    
    // Check if it's not just a relative path or internal redirect
    if (urlObj.hostname === 'localhost' || 
        urlObj.hostname === '127.0.0.1' || 
        urlObj.hostname.includes('localhost') ||
        urlObj.pathname === '/' ||
        urlObj.pathname === '') {
      return false;
    }
    
    // Check for common internal redirect patterns
    const internalPatterns = [
      /^\/$/, // Just root path
      /^\/#/, // Hash-only URLs
      /^\/\?/, // Query-only URLs
      /^javascript:/, // JavaScript URLs
      /^mailto:/, // Email links
      /^tel:/, // Phone links
    ];
    
    for (const pattern of internalPatterns) {
      if (pattern.test(url)) {
        return false;
      }
    }
    
    return true;
  } catch (error) {
    // If URL parsing fails, it's not a valid URL
    return false;
  }
};

/**
 * Get display text for website column
 * @param {string} url - The URL to check
 * @returns {string} - "Visit" if valid external URL, "N/A" otherwise
 */
export const getWebsiteDisplayText = (url) => {
  return isValidExternalWebsite(url) ? 'Visit' : 'N/A';
};

/**
 * Get CSS class for website column
 * @param {string} url - The URL to check
 * @returns {string} - CSS class for styling
 */
export const getWebsiteDisplayClass = (url) => {
  if (isValidExternalWebsite(url)) {
    return 'text-blue-600 hover:text-blue-800 underline text-sm cursor-pointer';
  }
  return 'text-sm text-gray-400 italic';
}; 