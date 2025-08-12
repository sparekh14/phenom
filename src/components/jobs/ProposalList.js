import React, { useState, useEffect } from 'react';
import { listProposals } from '../../lib/proposals';
import { formatDate, copyToClipboard } from '../../lib/utils';

const ProposalList = ({ jobId, onRefresh }) => {
  const [proposals, setProposals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    loadProposals();
  }, [jobId, onRefresh]);

  const loadProposals = () => {
    try {
      setLoading(true);
      const jobProposals = listProposals(jobId);
      // Sort by newest first
      const sortedProposals = jobProposals.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      setProposals(sortedProposals);
    } catch (error) {
      console.error('Error loading proposals:', error);
      showToast('Error loading proposals', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleCopy = async (text, label) => {
    const success = await copyToClipboard(text);
    if (success) {
      showToast(`${label} copied to clipboard!`, 'success');
    } else {
      showToast(`Failed to copy ${label.toLowerCase()}`, 'error');
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-4">
            {[1, 2].map(i => (
              <div key={i} className="border border-gray-200 rounded-lg p-4">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-2 rounded-md shadow-lg transition-opacity ${
          toast.type === 'success' 
            ? 'bg-green-600 text-white' 
            : 'bg-red-600 text-white'
        }`}>
          {toast.message}
        </div>
      )}

      <div className="mb-6">
        <h3 className="text-xl font-bold text-gray-900">
          Proposals ({proposals.length})
        </h3>
        {proposals.length > 0 && (
          <p className="text-gray-600 mt-2">Newest proposals appear first.</p>
        )}
      </div>

      {proposals.length === 0 ? (
        <div className="text-center py-12">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h3 className="mt-4 text-sm font-medium text-gray-900">No proposals yet</h3>
          <p className="mt-2 text-sm text-gray-500">
            Proposals will appear here when providers submit them.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {proposals.map((proposal, index) => (
            <div key={proposal.id} className="border border-gray-200 rounded-lg p-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-1 rounded-full">
                    Proposal #{index + 1}
                  </div>
                  <span className="text-sm text-gray-500">
                    {formatDate(proposal.createdAt)}
                  </span>
                </div>
                
                {/* Quick Copy Buttons */}
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleCopy(proposal.price, 'Price')}
                    className="text-xs text-gray-500 hover:text-blue-600 bg-gray-100 hover:bg-blue-50 px-2 py-1 rounded transition-colors"
                    title="Copy price"
                  >
                    Copy Price
                  </button>
                  <button
                    onClick={() => handleCopy(proposal.portfolio, 'Portfolio')}
                    className="text-xs text-gray-500 hover:text-blue-600 bg-gray-100 hover:bg-blue-50 px-2 py-1 rounded transition-colors"
                    title="Copy portfolio URL"
                  >
                    Copy Portfolio
                  </button>
                </div>
              </div>

              {/* Content Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left Column */}
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Deliverables</h4>
                    <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-md">
                      {proposal.deliverables}
                    </p>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Price</h4>
                    <p className="text-sm font-semibold text-green-700 bg-green-50 p-3 rounded-md">
                      {proposal.price}
                    </p>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Turnaround Time</h4>
                    <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-md">
                      {proposal.turnaroundTime}
                    </p>
                  </div>
                </div>

                {/* Right Column */}
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Portfolio</h4>
                    <div className="flex items-center space-x-2">
                      <a
                        href={proposal.portfolio}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:text-blue-800 underline truncate flex-1"
                      >
                        {proposal.portfolio}
                      </a>
                      <button
                        onClick={() => window.open(proposal.portfolio, '_blank')}
                        className="text-blue-600 hover:text-blue-800 flex-shrink-0"
                        title="Open portfolio"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      </button>
                    </div>
                  </div>

                  {proposal.reference && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 mb-2">Reference</h4>
                      <div className="flex items-center space-x-2">
                        <a
                          href={proposal.reference}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-blue-600 hover:text-blue-800 underline truncate flex-1"
                        >
                          {proposal.reference}
                        </a>
                        <button
                          onClick={() => window.open(proposal.reference, '_blank')}
                          className="text-blue-600 hover:text-blue-800 flex-shrink-0"
                          title="Open reference"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  )}

                  {proposal.notes && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 mb-2">Additional Notes</h4>
                      <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-md">
                        {proposal.notes}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Contact Actions */}
              <div className="mt-6 pt-4 border-t border-gray-200">
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => handleCopy(`${proposal.deliverables}\n\nPrice: ${proposal.price}\nTurnaround: ${proposal.turnaroundTime}\nPortfolio: ${proposal.portfolio}${proposal.reference ? `\nReference: ${proposal.reference}` : ''}${proposal.notes ? `\n\nNotes: ${proposal.notes}` : ''}`, 'Full proposal')}
                    className="text-sm bg-blue-600 text-white px-3 py-2 rounded-md hover:bg-blue-700 transition-colors"
                  >
                    Copy Full Proposal
                  </button>
                  
                  <a
                    href={`mailto:?subject=Re: Job Proposal&body=Hi,%0D%0A%0D%0AThank you for your proposal. I'd like to discuss the details further.%0D%0A%0D%0AProposal Summary:%0D%0ADeliverables: ${encodeURIComponent(proposal.deliverables)}%0D%0APrice: ${encodeURIComponent(proposal.price)}%0D%0ATurnaround: ${encodeURIComponent(proposal.turnaroundTime)}%0D%0A%0D%0ABest regards`}
                    className="text-sm bg-gray-100 text-gray-700 px-3 py-2 rounded-md hover:bg-gray-200 transition-colors"
                  >
                    Email Template
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProposalList; 