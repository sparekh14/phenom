import React, { useState, useEffect } from 'react';
import { getAttendees, addAttendee } from '../lib/localAttendees';

const CreatorsAttending = ({ eventId }) => {
  const [attendees, setAttendees] = useState([]);
  const [toast, setToast] = useState(null);
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    role: 'Photography',
    portfolioUrl: ''
  });

  // Load attendees on mount and when eventId changes
  useEffect(() => {
    loadAttendees();
  }, [eventId]);

  const loadAttendees = () => {
    try {
      const eventAttendees = getAttendees(eventId);
      setAttendees(eventAttendees);
    } catch (error) {
      console.error('Error loading attendees:', error);
      showToast('Error loading attendees', 'error');
    }
  };

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.name.trim()) {
      showToast('Name is required', 'error');
      return;
    }

    // Basic URL validation if provided
    if (formData.portfolioUrl && formData.portfolioUrl.trim()) {
      const urlToTest = formData.portfolioUrl.startsWith('http') 
        ? formData.portfolioUrl 
        : `https://${formData.portfolioUrl}`;
      
      try {
        new URL(urlToTest);
      } catch {
        showToast('Please enter a valid portfolio URL', 'error');
        return;
      }
    }

    // Add attendee
    const result = addAttendee(eventId, {
      name: formData.name,
      role: formData.role,
      portfolioUrl: formData.portfolioUrl || undefined
    });

    if (result.success) {
      showToast('Added to attending!', 'success');
      setFormData({ name: '', role: 'Photography', portfolioUrl: '' });
      loadAttendees(); // Refresh the list
    } else {
      showToast(result.error, 'error');
    }
  };

  return (
    <div className="space-y-6">
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

      {/* For Creators Section */}
      <div className="border-t border-gray-200 pt-6">
        <div className="mb-4">
          <h3 className="text-lg font-bold text-gray-900">For Creators</h3>
          <p className="text-sm text-gray-600">Add yourself so customers can view and contact you.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name Field */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Name *
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="Your name"
            />
          </div>

          {/* Role Field */}
          <div>
            <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
              Role *
            </label>
            <select
              id="role"
              name="role"
              value={formData.role}
              onChange={handleInputChange}
              required
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            >
              <option value="Photography">Photography</option>
              <option value="Videography">Videography</option>
            </select>
          </div>

          {/* Portfolio URL Field */}
          <div>
            <label htmlFor="portfolioUrl" className="block text-sm font-medium text-gray-700 mb-1">
              Portfolio URL (optional)
            </label>
            <input
              type="text"
              id="portfolioUrl"
              name="portfolioUrl"
              value={formData.portfolioUrl}
              onChange={handleInputChange}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="yourportfolio.com or https://yourportfolio.com"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
          >
            I'm Going
          </button>
        </form>
      </div>

      {/* Creators Attending List */}
      <div className="border-t border-gray-200 pt-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">
          Creators Attending ({attendees.length})
        </h3>

        {attendees.length === 0 ? (
          <p className="text-sm text-gray-500 py-4">No creators have marked attendance yet.</p>
        ) : (
          <div className="space-y-3">
            {attendees.map((attendee, index) => (
              <div key={`${attendee.name}-${index}`} className="flex items-center justify-between py-2">
                <div className="flex items-center space-x-3">
                  <div>
                    <span className="text-sm font-medium text-gray-900">
                      {attendee.name}
                    </span>
                    <span className="text-sm text-gray-500"> • {attendee.role}</span>
                  </div>
                </div>
                {attendee.portfolioUrl && (
                  <a
                    href={attendee.portfolioUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 transition-colors"
                    title="View Portfolio"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CreatorsAttending; 