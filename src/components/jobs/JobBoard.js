import React, { useState } from 'react';
import JobsIndex from './JobsIndex';
import JobPost from './JobPost';
import JobDetail from './JobDetail';
import JobManage from './JobManage';

const JobBoard = () => {
  const [currentView, setCurrentView] = useState('index');
  const [viewData, setViewData] = useState({});

  const handleNavigate = (view, data = {}) => {
    setCurrentView(view);
    setViewData(data);
  };

  const handleBack = () => {
    setCurrentView('index');
    setViewData({});
  };

  const renderView = () => {
    switch (currentView) {
      case 'index':
        return <JobsIndex onNavigate={handleNavigate} />;
      
      case 'post-job':
        return <JobPost onNavigate={handleNavigate} onBack={handleBack} />;
      
      case 'job-detail':
        return (
          <JobDetail 
            job={viewData.job}
            onNavigate={handleNavigate} 
            onBack={handleBack} 
          />
        );
      
      case 'job-manage':
        return (
          <JobManage 
            jobId={viewData.jobId}
            manageKey={viewData.manageKey}
            onNavigate={handleNavigate} 
            onBack={handleBack} 
          />
        );
      
      default:
        return <JobsIndex onNavigate={handleNavigate} />;
    }
  };

  return (
    <div className="job-board">
      {renderView()}
    </div>
  );
};

export default JobBoard; 