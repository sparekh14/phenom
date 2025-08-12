// Proposals localStorage helper module
import { uuid } from './utils';

/**
 * @typedef {Object} Proposal
 * @property {string} id - UUID
 * @property {string} jobId
 * @property {string} deliverables
 * @property {string} price
 * @property {string} portfolio
 * @property {string} [reference] - Optional reference
 * @property {string} turnaroundTime
 * @property {string} [notes] - Optional additional notes
 * @property {string} createdAt - ISO date string
 */

/**
 * Get proposals key for a job
 * @param {string} jobId - Job ID
 * @returns {string} localStorage key
 */
function getProposalsKey(jobId) {
  return `proposals:${jobId}`;
}

/**
 * Get all proposals for a job
 * @param {string} jobId - Job ID
 * @returns {Proposal[]} Array of proposals
 */
export function listProposals(jobId) {
  try {
    const key = getProposalsKey(jobId);
    const stored = localStorage.getItem(key);
    if (!stored) return [];
    
    const proposals = JSON.parse(stored);
    return Array.isArray(proposals) ? proposals : [];
  } catch (error) {
    console.error('Error reading proposals from localStorage:', error);
    return [];
  }
}

/**
 * Add a new proposal to a job
 * @param {string} jobId - Job ID
 * @param {Partial<Proposal>} proposalData - Proposal data (id, createdAt will be generated)
 * @returns {{ success: boolean, proposal?: Proposal, error?: string }}
 */
export function addProposal(jobId, proposalData) {
  try {
    const proposals = listProposals(jobId);
    
    // Generate required fields
    const id = uuid();
    const createdAt = new Date().toISOString();
    
    // Create complete proposal object
    const newProposal = {
      id,
      jobId,
      createdAt,
      ...proposalData
    };
    
    // Validate required fields
    const requiredFields = ['deliverables', 'price', 'portfolio', 'turnaroundTime'];
    const missingFields = requiredFields.filter(field => !newProposal[field] || !newProposal[field].trim());
    
    if (missingFields.length > 0) {
      return { 
        success: false, 
        error: `Missing required fields: ${missingFields.join(', ')}` 
      };
    }
    
    // Add to proposals array and save
    const updatedProposals = [...proposals, newProposal];
    const key = getProposalsKey(jobId);
    localStorage.setItem(key, JSON.stringify(updatedProposals));
    
    return { success: true, proposal: newProposal };
  } catch (error) {
    console.error('Error adding proposal:', error);
    return { 
      success: false, 
      error: 'Failed to save proposal. Please try again.' 
    };
  }
}

/**
 * Get a proposal by its ID
 * @param {string} jobId - Job ID
 * @param {string} proposalId - Proposal ID
 * @returns {Proposal|null} Proposal object or null if not found
 */
export function getProposalById(jobId, proposalId) {
  try {
    const proposals = listProposals(jobId);
    return proposals.find(proposal => proposal.id === proposalId) || null;
  } catch (error) {
    console.error('Error getting proposal by ID:', error);
    return null;
  }
}

/**
 * Update an existing proposal
 * @param {string} jobId - Job ID
 * @param {Proposal} updatedProposal - Complete proposal object with updates
 * @returns {{ success: boolean, proposal?: Proposal, error?: string }}
 */
export function updateProposal(jobId, updatedProposal) {
  try {
    const proposals = listProposals(jobId);
    const proposalIndex = proposals.findIndex(proposal => proposal.id === updatedProposal.id);
    
    if (proposalIndex === -1) {
      return { 
        success: false, 
        error: 'Proposal not found' 
      };
    }
    
    // Update the proposal
    proposals[proposalIndex] = { ...proposals[proposalIndex], ...updatedProposal };
    const key = getProposalsKey(jobId);
    localStorage.setItem(key, JSON.stringify(proposals));
    
    return { success: true, proposal: proposals[proposalIndex] };
  } catch (error) {
    console.error('Error updating proposal:', error);
    return { 
      success: false, 
      error: 'Failed to update proposal. Please try again.' 
    };
  }
}

/**
 * Delete a proposal (for testing/admin use)
 * @param {string} jobId - Job ID
 * @param {string} proposalId - Proposal ID
 * @returns {boolean} Success status
 */
export function deleteProposal(jobId, proposalId) {
  try {
    const proposals = listProposals(jobId);
    const filteredProposals = proposals.filter(proposal => proposal.id !== proposalId);
    const key = getProposalsKey(jobId);
    localStorage.setItem(key, JSON.stringify(filteredProposals));
    
    return true;
  } catch (error) {
    console.error('Error deleting proposal:', error);
    return false;
  }
}

/**
 * Clear all proposals for a job (for testing/admin use)
 * @param {string} jobId - Job ID
 * @returns {boolean} Success status
 */
export function clearJobProposals(jobId) {
  try {
    const key = getProposalsKey(jobId);
    localStorage.removeItem(key);
    return true;
  } catch (error) {
    console.error('Error clearing proposals:', error);
    return false;
  }
}

/**
 * Get proposal count for a job
 * @param {string} jobId - Job ID
 * @returns {number} Number of proposals
 */
export function getProposalCount(jobId) {
  try {
    const proposals = listProposals(jobId);
    return proposals.length;
  } catch (error) {
    console.error('Error getting proposal count:', error);
    return 0;
  }
} 