import React, { useState } from 'react';
import CustomerForm from './CustomerForm';
import { copyToClipboard } from '../../lib/utils';

const JobPost = ({ onNavigate, onBack }) => {
  const [postedJob, setPostedJob] = useState(null);
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const handleJobSuccess = (job) => {
    setPostedJob(job);
  };

  const handleCopyManageLink = async () => {
    const manageUrl = `${window.location.origin}/jobs/${postedJob.id}/manage?key=${postedJob.manageKey}`;
    const success = await copyToClipboard(manageUrl);
    if (success) {
      showToast('Manage link copied to clipboard!', 'success');
    } else {
      showToast('Failed to copy link', 'error');
    }
  };

  const handleViewJob = () => {
    onNavigate('job-detail', { job: postedJob });
  };

  const handlePostAnother = () => {
    setPostedJob(null);
  };

  if (postedJob) {
    // Success screen
    return (
      <div className="min-h-screen bg-gray-50 py-8">
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

        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
            {/* Success Icon */}
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-6">
              <svg className="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>

            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Job Posted Successfully!
            </h1>

            <p className="text-gray-600 mb-8">
              Your job "<strong>{postedJob.title}</strong>" has been posted and is now visible to providers.
            </p>

            {/* Job Details Summary */}
            <div className="bg-gray-50 rounded-lg p-6 mb-8 text-left">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Job Summary</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium text-gray-700">Category:</span> {postedJob.category}
                </div>
                <div>
                  <span className="font-medium text-gray-700">Sport:</span> {postedJob.sport}
                </div>
                <div>
                  <span className="font-medium text-gray-700">Budget:</span> {postedJob.budget}
                </div>
                <div>
                  <span className="font-medium text-gray-700">Status:</span> 
                  <span className="ml-1 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    {postedJob.status}
                  </span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={handleViewJob}
                  className="px-6 py-3 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
                >
                  View Job
                </button>
                
                <button
                  onClick={handlePostAnother}
                  className="px-6 py-3 bg-gray-100 text-gray-700 text-sm font-medium rounded-md hover:bg-gray-200 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
                >
                  Post Another Job
                </button>
              </div>

              {/* Manage Link */}
              <div className="pt-6 border-t border-gray-200">
                <h4 className="text-sm font-medium text-gray-900 mb-3">
                  Manage Proposals (Private Link)
                </h4>
                <p className="text-xs text-gray-600 mb-4">
                  Save this link to manage your job and view proposals. Keep it private!
                </p>
                
                <div className="bg-gray-100 rounded-lg p-4 mb-4">
                  <div className="flex items-center justify-between">
                    <code className="text-xs text-gray-700 truncate flex-1 mr-4">
                      {window.location.origin}/jobs/{postedJob.id}/manage?key={postedJob.manageKey}
                    </code>
                    <button
                      onClick={handleCopyManageLink}
                      className="flex-shrink-0 px-3 py-2 bg-blue-600 text-white text-xs font-medium rounded-md hover:bg-blue-700 transition-colors"
                    >
                      Copy Link
                    </button>
                  </div>
                </div>

                <button
                  onClick={() => onNavigate('job-manage', { 
                    jobId: postedJob.id, 
                    manageKey: postedJob.manageKey 
                  })}
                  className="text-sm text-blue-600 hover:text-blue-800 underline"
                >
                  Go to Manage Page →
                </button>
              </div>
            </div>

            {/* Back to Jobs */}
            <div className="pt-6 border-t border-gray-200 mt-8">
              <button
                onClick={onBack}
                className="text-sm text-gray-500 hover:text-gray-700 underline"
              >
                ← Back to Job Board
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Job posting form
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={onBack}
            className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-4"
          >
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Job Board
          </button>
        </div>

        {/* Form */}
        <CustomerForm 
          onSuccess={handleJobSuccess}
          onCancel={onBack}
        />
      </div>
    </div>
  );
};

export default JobPost; 