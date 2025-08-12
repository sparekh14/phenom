import React from 'react';
import ProviderForm from './ProviderForm';
import { formatDateSafe } from '../../lib/utils';

const JobDetail = ({ job, onNavigate, onBack }) => {
  const formatTime = (timeString) => {
    if (!timeString) return '';
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    return `${displayHour}:${minutes} ${ampm}`;
  };
  
  if (!job) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Job Not Found</h1>
            <p className="text-gray-600 mb-6">The job you're looking for doesn't exist.</p>
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

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'Video':
        return (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
        );
      case 'Photo':
        return (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        );
      case 'Video & Photo':
        return (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
          </svg>
        );
      case 'Design':
        return (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
          </svg>
        );
      case 'Editing':
        return (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        );
      default:
        return null;
    }
  };

  const getCategoryColor = (category) => {
    switch (category) {
      case 'Video': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'Photo': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Video & Photo': return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      case 'Design': return 'bg-green-100 text-green-800 border-green-200';
      case 'Editing': return 'bg-orange-100 text-orange-800 border-orange-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };





  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
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

        {/* Job Details */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 mb-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-6">
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-4">
                <div className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium border ${getCategoryColor(job.category)}`}>
                  {getCategoryIcon(job.category)}
                  <span className="ml-2">{job.category}</span>
                </div>
              </div>
              
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {job.title}
              </h1>
            </div>
          </div>

          {/* Job Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            {/* Left Column */}
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Job Details</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-700">Sport:</span>
                    <span className="text-gray-900">{job.sport}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-700">Gender:</span>
                    <span className="text-gray-900">{job.gender}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-700">Age:</span>
                    <span className="text-gray-900">{job.age}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-700">Budget:</span>
                    <span className="text-green-700 font-semibold">{job.budgetRange || job.budget}</span>
                  </div>
                  {job.location && (
                    <div className="flex justify-between">
                      <span className="font-medium text-gray-700">Location:</span>
                      <span className="text-gray-900">
                        {typeof job.location === 'string' 
                          ? job.location 
                          : `${job.location.city}, ${job.location.state}`
                        }
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Schedule</h3>
                <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                  {job.schedule && job.schedule.length > 0 ? (
                    job.schedule.map((day, index) => (
                      <div key={index} className="border-b border-gray-200 last:border-b-0 pb-2 last:pb-0">
                        <div className="font-medium text-gray-900 mb-1">
                          {formatDateSafe(day.date, { 
                            weekday: 'long', 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric' 
                          })}
                        </div>
                        {day.times && day.times.length > 0 ? (
                          <div className="flex flex-wrap gap-2">
                            {day.times.map((time, timeIndex) => (
                              <span key={timeIndex} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                {time.start && time.end 
                                  ? `${formatTime(time.start)} – ${formatTime(time.end)}`
                                  : time.start 
                                    ? `${formatTime(time.start)}+`
                                    : time.end
                                      ? `Until ${formatTime(time.end)}`
                                      : 'Time TBD'
                                }
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-gray-600 text-sm">All day</span>
                        )}
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-900">{job.dates || 'Schedule TBD'}</p>
                  )}
                </div>
              </div>

              {job.references && job.references.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">References</h3>
                  <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                    {Array.isArray(job.references) ? (
                      job.references.map((ref, index) => (
                        <div key={index}>
                          <a 
                            href={ref} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800 underline break-all"
                          >
                            {ref}
                          </a>
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-900 whitespace-pre-wrap">{job.references}</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Description */}
          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Description</h3>
            <div className="prose max-w-none">
              <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                {job.description}
              </p>
            </div>
          </div>
        </div>

        {/* Provider Form or Closed Message */}
        {job.status === 'Open' ? (
          <ProviderForm 
            jobId={job.id}
          />
        ) : (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
            <svg className="mx-auto h-12 w-12 text-red-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 15.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">This job is closed</h3>
            <p className="text-gray-600">This job is no longer accepting proposals.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default JobDetail; 