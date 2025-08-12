// Jobs localStorage helper module
import { uuid, slugify } from './utils';

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
 * @typedef {Object} Location
 * @property {string} city - City name
 * @property {string} state - 2-letter state code
 */

/**
 * @typedef {Object} Job
 * @property {string} id - UUID
 * @property {string} slug - URL slug from title
 * @property {string} title
 * @property {"Video"|"Photo"|"Video & Photo"|"Design"|"Editing"} category
 * @property {string} sport - From SPORTS constant
 * @property {"Boys"|"Girls"|"Co-Ed"} gender
 * @property {"Middle School"|"High School"|"Collegiate"} age
 * @property {string} budgetRange - From BUDGET_RANGES constant
 * @property {ScheduleDay[]} schedule - Array of scheduled days
 * @property {Location} location - City and state object
 * @property {string[]} references - Array of validated URLs
 * @property {string} description
 * @property {string} createdAt - ISO date string
 * @property {"Open"|"Closed"} status
 * @property {string} manageKey - Secret token for manage link
 */

const JOBS_KEY = 'jobs';

/**
 * Get all jobs from localStorage
 * @returns {Job[]} Array of jobs
 */
export function listJobs() {
  try {
    const stored = localStorage.getItem(JOBS_KEY);
    if (!stored) return [];
    
    const jobs = JSON.parse(stored);
    return Array.isArray(jobs) ? jobs : [];
  } catch (error) {
    console.error('Error reading jobs from localStorage:', error);
    return [];
  }
}

/**
 * Get a job by its slug
 * @param {string} slug - Job slug
 * @returns {Job|null} Job object or null if not found
 */
export function getJobBySlug(slug) {
  try {
    const jobs = listJobs();
    return jobs.find(job => job.slug === slug) || null;
  } catch (error) {
    console.error('Error getting job by slug:', error);
    return null;
  }
}

/**
 * Get a job by its ID
 * @param {string} id - Job ID
 * @returns {Job|null} Job object or null if not found
 */
export function getJobById(id) {
  try {
    const jobs = listJobs();
    return jobs.find(job => job.id === id) || null;
  } catch (error) {
    console.error('Error getting job by ID:', error);
    return null;
  }
}

/**
 * Add a new job
 * @param {Partial<Job>} jobData - Job data (id, slug, createdAt, manageKey will be generated)
 * @returns {{ success: boolean, job?: Job, error?: string }}
 */
export function addJob(jobData) {
  try {
    const jobs = listJobs();
    
    // Generate required fields
    const id = uuid();
    const slug = slugify(jobData.title || '');
    const manageKey = uuid();
    const createdAt = new Date().toISOString();
    
    // Check for duplicate slug
    if (jobs.some(job => job.slug === slug)) {
      return { 
        success: false, 
        error: 'A job with this title already exists. Please use a different title.' 
      };
    }
    
    // Create complete job object
    const newJob = {
      id,
      slug,
      manageKey,
      createdAt,
      status: 'Open',
      ...jobData
    };
    
    // Validate required fields
    const requiredFields = ['title', 'category', 'sport', 'gender', 'age', 'budgetRange', 'description'];
    const missingFields = requiredFields.filter(field => !newJob[field] || (typeof newJob[field] === 'string' && !newJob[field].trim()));
    
    if (missingFields.length > 0) {
      return { 
        success: false, 
        error: `Missing required fields: ${missingFields.join(', ')}` 
      };
    }
    
    // Schedule validation
    if (!newJob.schedule || !Array.isArray(newJob.schedule) || newJob.schedule.length === 0) {
      return { 
        success: false, 
        error: 'At least one scheduled date is required' 
      };
    }
    
    // Location is required for Video/Photo categories
    const requiresLocation = ['Video', 'Photo', 'Video & Photo'].includes(newJob.category);
    if (requiresLocation) {
      if (!newJob.location || typeof newJob.location !== 'object') {
        return { 
          success: false, 
          error: 'Location is required for Video, Photo, and Video & Photo jobs' 
        };
      }
      if (!newJob.location.city || !newJob.location.city.trim()) {
        return { 
          success: false, 
          error: 'City is required for Video, Photo, and Video & Photo jobs' 
        };
      }
      if (!newJob.location.state || !newJob.location.state.trim()) {
        return { 
          success: false, 
          error: 'State is required for Video, Photo, and Video & Photo jobs' 
        };
      }
    }
    
    // Add to jobs array and save
    const updatedJobs = [...jobs, newJob];
    localStorage.setItem(JOBS_KEY, JSON.stringify(updatedJobs));
    
    return { success: true, job: newJob };
  } catch (error) {
    console.error('Error adding job:', error);
    return { 
      success: false, 
      error: 'Failed to save job. Please try again.' 
    };
  }
}

/**
 * Update an existing job
 * @param {Job} updatedJob - Complete job object with updates
 * @returns {{ success: boolean, job?: Job, error?: string }}
 */
export function updateJob(updatedJob) {
  try {
    const jobs = listJobs();
    const jobIndex = jobs.findIndex(job => job.id === updatedJob.id);
    
    if (jobIndex === -1) {
      return { 
        success: false, 
        error: 'Job not found' 
      };
    }
    
    // Update the job
    jobs[jobIndex] = { ...jobs[jobIndex], ...updatedJob };
    localStorage.setItem(JOBS_KEY, JSON.stringify(jobs));
    
    return { success: true, job: jobs[jobIndex] };
  } catch (error) {
    console.error('Error updating job:', error);
    return { 
      success: false, 
      error: 'Failed to update job. Please try again.' 
    };
  }
}

/**
 * Delete a job (for testing/admin use)
 * @param {string} jobId - Job ID
 * @returns {boolean} Success status
 */
export function deleteJob(jobId) {
  try {
    const jobs = listJobs();
    const filteredJobs = jobs.filter(job => job.id !== jobId);
    localStorage.setItem(JOBS_KEY, JSON.stringify(filteredJobs));
    
    // Also clean up proposals for this job
    localStorage.removeItem(`proposals:${jobId}`);
    
    return true;
  } catch (error) {
    console.error('Error deleting job:', error);
    return false;
  }
}

/**
 * Clear all jobs (for testing/admin use)
 * @returns {boolean} Success status
 */
export function clearAllJobs() {
  try {
    localStorage.removeItem(JOBS_KEY);
    
    // Also clear all proposals
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.startsWith('proposals:')) {
        localStorage.removeItem(key);
      }
    });
    
    return true;
  } catch (error) {
    console.error('Error clearing jobs:', error);
    return false;
  }
} 