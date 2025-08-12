import React, { useState } from 'react';
import { addProposal } from '../../lib/proposals';

const ProviderForm = ({ jobId, onSuccess }) => {
  const [formData, setFormData] = useState({
    deliverables: '',
    price: '',
    portfolio: '',
    reference: '',
    turnaroundTime: '',
    notes: ''
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState(null);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const validateForm = () => {
    const newErrors = {};

    // Required fields
    const requiredFields = ['deliverables', 'price', 'portfolio', 'turnaroundTime'];
    requiredFields.forEach(field => {
      if (!formData[field] || !formData[field].trim()) {
        newErrors[field] = 'This field is required';
      }
    });

    // Portfolio URL validation
    if (formData.portfolio && formData.portfolio.trim()) {
      try {
        const url = formData.portfolio.startsWith('http') 
          ? formData.portfolio 
          : `https://${formData.portfolio}`;
        new URL(url);
      } catch {
        newErrors.portfolio = 'Please enter a valid portfolio URL';
      }
    }

    // Reference URL validation (optional)
    if (formData.reference && formData.reference.trim()) {
      try {
        const url = formData.reference.startsWith('http') 
          ? formData.reference 
          : `https://${formData.reference}`;
        new URL(url);
      } catch {
        newErrors.reference = 'Please enter a valid reference URL';
      }
    }

    // Field length validations
    if (formData.deliverables && formData.deliverables.length > 1000) {
      newErrors.deliverables = 'Deliverables must be 1000 characters or less';
    }

    if (formData.notes && formData.notes.length > 1000) {
      newErrors.notes = 'Notes must be 1000 characters or less';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Normalize URLs
      const normalizedData = {
        ...formData,
        portfolio: formData.portfolio.startsWith('http') 
          ? formData.portfolio 
          : `https://${formData.portfolio}`,
        reference: formData.reference && formData.reference.trim()
          ? (formData.reference.startsWith('http') 
              ? formData.reference 
              : `https://${formData.reference}`)
          : undefined
      };

      const result = addProposal(jobId, normalizedData);
      
      if (result.success) {
        showToast('Proposal sent successfully!', 'success');
        
        // Clear form
        setFormData({
          deliverables: '',
          price: '',
          portfolio: '',
          reference: '',
          turnaroundTime: '',
          notes: ''
        });
        
        if (onSuccess) {
          onSuccess(result.proposal);
        }
      } else {
        setErrors({ submit: result.error });
      }
    } catch (error) {
      console.error('Error submitting proposal:', error);
      setErrors({ submit: 'Failed to send proposal. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

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
        <h3 className="text-xl font-bold text-gray-900">Submit a Proposal</h3>
        <p className="text-gray-600 mt-2">Fill out the details below to submit your proposal for this job.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Submit Error */}
        {errors.submit && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <div className="text-red-800 text-sm">{errors.submit}</div>
          </div>
        )}

        {/* Deliverables */}
        <div>
          <label htmlFor="deliverables" className="block text-sm font-medium text-gray-700 mb-2">
            Deliverables *
          </label>
          <textarea
            id="deliverables"
            value={formData.deliverables}
            onChange={(e) => handleInputChange('deliverables', e.target.value)}
            rows={4}
            className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
              errors.deliverables ? 'border-red-300' : 'border-gray-300'
            }`}
            placeholder="What will you deliver? (e.g., 2-3 minute highlight video, 50+ edited photos, logo design with 3 concepts, etc.)"
            maxLength={1000}
          />
          {errors.deliverables && <p className="mt-1 text-sm text-red-600">{errors.deliverables}</p>}
          <p className="mt-1 text-xs text-gray-500">{formData.deliverables.length}/1000 characters</p>
        </div>

        {/* Price */}
        <div>
          <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-2">
            Price *
          </label>
          <input
            type="text"
            id="price"
            value={formData.price}
            onChange={(e) => handleInputChange('price', e.target.value)}
            className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
              errors.price ? 'border-red-300' : 'border-gray-300'
            }`}
            placeholder="e.g., $500 total, $200 per game, $50/hour"
          />
          {errors.price && <p className="mt-1 text-sm text-red-600">{errors.price}</p>}
        </div>

        {/* Portfolio */}
        <div>
          <label htmlFor="portfolio" className="block text-sm font-medium text-gray-700 mb-2">
            Portfolio *
          </label>
          <input
            type="text"
            id="portfolio"
            value={formData.portfolio}
            onChange={(e) => handleInputChange('portfolio', e.target.value)}
            className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
              errors.portfolio ? 'border-red-300' : 'border-gray-300'
            }`}
            placeholder="yourportfolio.com or https://yourportfolio.com"
          />
          {errors.portfolio && <p className="mt-1 text-sm text-red-600">{errors.portfolio}</p>}
        </div>

        {/* Reference */}
        <div>
          <label htmlFor="reference" className="block text-sm font-medium text-gray-700 mb-2">
            Reference (optional)
          </label>
          <input
            type="text"
            id="reference"
            value={formData.reference}
            onChange={(e) => handleInputChange('reference', e.target.value)}
            className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
              errors.reference ? 'border-red-300' : 'border-gray-300'
            }`}
            placeholder="Link to similar work or client reference"
          />
          {errors.reference && <p className="mt-1 text-sm text-red-600">{errors.reference}</p>}
        </div>

        {/* Turnaround Time */}
        <div>
          <label htmlFor="turnaroundTime" className="block text-sm font-medium text-gray-700 mb-2">
            Turnaround Time *
          </label>
          <input
            type="text"
            id="turnaroundTime"
            value={formData.turnaroundTime}
            onChange={(e) => handleInputChange('turnaroundTime', e.target.value)}
            className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
              errors.turnaroundTime ? 'border-red-300' : 'border-gray-300'
            }`}
            placeholder="e.g., 2-3 business days, 1 week, Same day delivery"
          />
          {errors.turnaroundTime && <p className="mt-1 text-sm text-red-600">{errors.turnaroundTime}</p>}
        </div>

        {/* Additional Notes */}
        <div>
          <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
            Additional Notes
          </label>
          <textarea
            id="notes"
            value={formData.notes}
            onChange={(e) => handleInputChange('notes', e.target.value)}
            rows={3}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            placeholder="Any additional information, questions, or special considerations..."
            maxLength={1000}
          />
          <p className="mt-1 text-xs text-gray-500">{formData.notes.length}/1000 characters</p>
        </div>

        {/* Submit Button */}
        <div className="pt-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full px-6 py-3 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isSubmitting ? 'Sending Proposal...' : 'Send Proposal'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProviderForm; 