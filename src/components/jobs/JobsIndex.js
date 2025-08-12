import React, { useState, useEffect } from 'react';
import { listJobs } from '../../lib/jobs';
import JobCard from './JobCard';
import JobFilters from './JobFilters';

const JobsIndex = ({ onNavigate }) => {
  const [jobs, setJobs] = useState([]);
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [filters, setFilters] = useState({
    categories: [],
    sport: ''
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadJobs();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [jobs, filters]);

  const loadJobs = () => {
    try {
      setLoading(true);
      const allJobs = listJobs();
      // Sort by newest first
      const sortedJobs = allJobs.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      setJobs(sortedJobs);
    } catch (error) {
      console.error('Error loading jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...jobs];

    // Category filter
    if (filters.categories && filters.categories.length > 0) {
      filtered = filtered.filter(job => filters.categories.includes(job.category));
    }

    // Sport filter (exact match for select)
    if (filters.sport && filters.sport.trim()) {
      filtered = filtered.filter(job => 
        job.sport === filters.sport
      );
    }





    setFilteredJobs(filtered);
  };

  const handleJobClick = (job) => {
    onNavigate('job-detail', { job });
  };

  const handlePostJob = () => {
    onNavigate('post-job');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
              <div className="lg:col-span-1">
                <div className="h-64 bg-gray-200 rounded"></div>
              </div>
              <div className="lg:col-span-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {[1, 2, 3, 4].map(i => (
                    <div key={i} className="h-64 bg-gray-200 rounded"></div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Desktop: Title + Post Job Button */}
      <div className="hidden md:block">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Job Board</h1>
              <p className="mt-2 text-gray-600">Find opportunities in sports content creation</p>
            </div>
            <button
              onClick={handlePostJob}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Post a Job
            </button>
          </div>
        </div>
      </div>

      {/* Mobile: Post Job Button */}
      <div className="block md:hidden">
        <div className="container mx-auto px-4 mt-4">
          <button
            onClick={handlePostJob}
            className="w-full inline-flex items-center justify-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Post a Job
          </button>
        </div>
      </div>

      {/* Job listings */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">

        {/* Content */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <JobFilters 
              filters={filters} 
              onFiltersChange={setFilters} 
            />
          </div>

          {/* Jobs Grid */}
          <div className="lg:col-span-3">
            {filteredJobs.length === 0 ? (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2V6" />
                </svg>
                <h3 className="mt-4 text-lg font-medium text-gray-900">
                  {jobs.length === 0 ? 'No jobs posted yet' : 'No jobs match your filters'}
                </h3>
                <p className="mt-2 text-gray-500">
                  {jobs.length === 0 
                    ? 'Be the first to post a job opportunity!' 
                    : 'Try adjusting your filters to see more results.'
                  }
                </p>
                {jobs.length === 0 && (
                  <button
                    onClick={handlePostJob}
                    className="mt-4 inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors"
                  >
                    Post the First Job
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredJobs.map(job => (
                  <JobCard 
                    key={job.id} 
                    job={job} 
                    onClick={handleJobClick}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobsIndex; 