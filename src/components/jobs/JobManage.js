import React, { useState, useEffect } from 'react';
import { getJobById, updateJob } from '../../lib/jobs';
import { copyToClipboard, formatDate } from '../../lib/utils';
import ProposalList from './ProposalList';

const JobManage = ({ jobId, manageKey, onNavigate, onBack }) => {
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    loadJob();
  }, [jobId, manageKey]);

  const loadJob = () => {
    try {
      setLoading(true);
      setError(null);

      if (!jobId || !manageKey) {
        setError('Missing job ID or manage key');
        return;
      }

      const foundJob = getJobById(jobId);
      
      if (!foundJob) {
        setError('Job not found');
        return;
      }

      if (foundJob.manageKey !== manageKey) {
        setError('Invalid manage key');
        return;
      }

      setJob(foundJob);
    } catch (err) {
      console.error('Error loading job:', err);
      setError('Failed to load job');
    } finally {
      setLoading(false);
    }
  };

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const handleToggleStatus = () => {
    if (!job) return;

    const newStatus = job.status === 'Open' ? 'Closed' : 'Open';
    const result = updateJob({ ...job, status: newStatus });
    
    if (result.success) {
      setJob(result.job);
      showToast(`Job ${newStatus.toLowerCase()} successfully!`, 'success');
    } else {
      showToast(result.error, 'error');
    }
  };

  const handleCopyPublicLink = async () => {
    if (!job) return;
    
    const publicUrl = `${window.location.origin}/jobs/${job.slug}`;
    const success = await copyToClipboard(publicUrl);
    if (success) {
      showToast('Public job link copied to clipboard!', 'success');
    } else {
      showToast('Failed to copy link', 'error');
    }
  };

  const handleCopyManageLink = async () => {
    const manageUrl = `${window.location.origin}/jobs/${jobId}/manage?key=${manageKey}`;
    const success = await copyToClipboard(manageUrl);
    if (success) {
      showToast('Manage link copied to clipboard!', 'success');
    } else {
      showToast('Failed to copy link', 'error');
    }
  };

  const handleViewPublicJob = () => {
    onNavigate('job-detail', { job });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
              <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
              <div className="space-y-4">
                <div className="h-4 bg-gray-200 rounded w-full"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
            <svg className="mx-auto h-12 w-12 text-red-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 15.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
            <p className="text-gray-600 mb-6">
              {error === 'Invalid manage key' 
                ? 'You don\'t have permission to manage this job. Please check your manage link.'
                : error
              }
            </p>
            <button
              onClick={onBack}
              className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors"
            >
              Back to Job Board
            </button>
          </div>
        </div>
      </div>
    );
  }

  const getStatusColor = (status) => {
    return status === 'Open' 
      ? 'bg-green-100 text-green-800 border-green-200'
      : 'bg-red-100 text-red-800 border-red-200';
  };

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

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
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

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Manage Job</h1>
              <p className="mt-2 text-gray-600">
                Control your job status and review proposals
              </p>
            </div>
          </div>
        </div>

        {/* Job Summary */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div className="flex-1 mb-6 lg:mb-0">
              <div className="flex items-center space-x-3 mb-3">
                <div className={`inline-flex items-center px-2.5 py-1 rounded-full text-sm font-medium border ${getStatusColor(job.status)}`}>
                  {job.status}
                </div>
                <span className="text-sm text-gray-500">
                  Posted {formatDate(job.createdAt)}
                </span>
              </div>
              
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                {job.title}
              </h2>
              
              <div className="text-sm text-gray-600 space-y-1">
                                  <div>{job.category} • {job.sport} • {job.budgetRange || job.budget}</div>
                {job.location && (
                  <div>
                    {typeof job.location === 'string' 
                      ? job.location 
                      : `${job.location.city}, ${job.location.state}`
                    }
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleToggleStatus}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                  job.status === 'Open'
                    ? 'bg-red-100 text-red-700 hover:bg-red-200'
                    : 'bg-green-100 text-green-700 hover:bg-green-200'
                }`}
              >
                {job.status === 'Open' ? 'Close Job' : 'Reopen Job'}
              </button>
              
              <button
                onClick={handleViewPublicJob}
                className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors"
              >
                View Public Job
              </button>
            </div>
          </div>

          {/* Links Section */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <h3 className="text-sm font-medium text-gray-900 mb-4">Share Links</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Public Link */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-2">
                  Public Job Link
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={`${window.location.origin}/jobs/${job.slug}`}
                    readOnly
                    className="flex-1 px-3 py-2 text-xs bg-gray-50 border border-gray-300 rounded-md"
                  />
                  <button
                    onClick={handleCopyPublicLink}
                    className="px-3 py-2 bg-blue-600 text-white text-xs font-medium rounded-md hover:bg-blue-700 transition-colors"
                  >
                    Copy
                  </button>
                </div>
              </div>

              {/* Manage Link */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-2">
                  Manage Link (Keep Private)
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={`${window.location.origin}/jobs/${jobId}/manage?key=${manageKey}`}
                    readOnly
                    className="flex-1 px-3 py-2 text-xs bg-gray-50 border border-gray-300 rounded-md"
                  />
                  <button
                    onClick={handleCopyManageLink}
                    className="px-3 py-2 bg-gray-600 text-white text-xs font-medium rounded-md hover:bg-gray-700 transition-colors"
                  >
                    Copy
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Proposals */}
        <ProposalList 
          jobId={jobId} 
          onRefresh={refreshKey}
        />
      </div>
    </div>
  );
};

export default JobManage; 