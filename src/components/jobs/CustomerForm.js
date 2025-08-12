import React, { useState } from 'react';
import { addJob } from '../../lib/jobs';
import { SPORTS } from '../../constants/sports';
import { BUDGET_RANGES } from '../../constants/budgets';
import { CATEGORIES, REMOTE_CATEGORIES } from '../../constants/categories';
import EnhancedScheduleEditor from './EnhancedScheduleEditor';

const CustomerForm = ({ onSuccess, onCancel }) => {
  const [formData, setFormData] = useState({
    category: 'Video & Photo',
    sport: '',
    gender: '',
    age: '',
    budgetRange: '',
    schedule: [],
    location: { city: '', state: '' },
    references: [''],
    description: ''
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const genders = ['Boys', 'Girls', 'Co-Ed'];
  const ages = ['Middle School', 'High School', 'Collegiate'];
  const budgetRanges = [
    '$0–$150',
    '$150–$300', 
    '$300–$500',
    '$500–$750',
    '$750–$1,000',
    '$1,000+'
  ];

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleLocationChange = (field, value) => {
    setFormData(prev => ({ 
      ...prev, 
      location: { ...prev.location, [field]: value }
    }));
    // Clear location errors
    if (errors.city || errors.state) {
      setErrors(prev => ({ 
        ...prev, 
        city: '', 
        state: '' 
      }));
    }
  };

  const handleScheduleChange = (newSchedule) => {
    setFormData(prev => ({ ...prev, schedule: newSchedule }));
    if (errors.schedule) {
      setErrors(prev => ({ ...prev, schedule: '' }));
    }
  };

  const addReference = () => {
    setFormData(prev => ({
      ...prev,
      references: [...prev.references, '']
    }));
  };

  const updateReference = (index, value) => {
    const newReferences = [...formData.references];
    newReferences[index] = value;
    setFormData(prev => ({ ...prev, references: newReferences }));
    
    // Clear reference error for this index
    if (errors[`reference_${index}`]) {
      setErrors(prev => ({ ...prev, [`reference_${index}`]: '' }));
    }
  };

  const removeReference = (index) => {
    if (formData.references.length <= 1) return; // Keep at least one
    const newReferences = formData.references.filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, references: newReferences }));
  };

  const validateUrl = (url) => {
    if (!url.trim()) return true; // Empty is OK for optional fields
    try {
      // Auto-prepend https:// if missing
      const normalizedUrl = url.startsWith('http://') || url.startsWith('https://') 
        ? url 
        : `https://${url}`;
      new URL(normalizedUrl);
      return normalizedUrl;
    } catch {
      return false;
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Required dropdowns
    if (!formData.category) {
      newErrors.category = 'Category is required';
    }
    if (!formData.sport) {
      newErrors.sport = 'Sport is required';
    }
    if (!formData.gender) {
      newErrors.gender = 'Gender is required';
    }
    if (!formData.age) {
      newErrors.age = 'Age is required';
    }
    if (!formData.budgetRange) {
      newErrors.budgetRange = 'Budget range is required';
    }
    if (!formData.description?.trim()) {
      newErrors.description = 'Description is required';
    }

    const isRemote = REMOTE_CATEGORIES.includes(formData.category);

    // Schedule validation (only for on-site categories)
    if (!isRemote && (!formData.schedule || formData.schedule.length === 0)) {
      newErrors.schedule = 'At least one date is required for on-site jobs';
    }

    // Location validation for on-site categories
    if (!isRemote) {
      if (!formData.location.city?.trim()) {
        newErrors.city = 'City is required for on-site jobs';
      }
      if (!formData.location.state?.trim()) {
        newErrors.state = 'State is required for on-site jobs';
      }
    }

    // References validation
    formData.references.forEach((ref, index) => {
      if (ref.trim()) { // Only validate non-empty references
        const validated = validateUrl(ref.trim());
        if (validated === false) {
          newErrors[`reference_${index}`] = 'Please enter a valid URL';
        }
      }
    });

    // Description length
    if (formData.description && formData.description.length > 2000) {
      newErrors.description = 'Description must be 2000 characters or less';
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
      const isRemote = REMOTE_CATEGORIES.includes(formData.category);

      // Process references - normalize URLs and filter out empty ones
      const processedReferences = formData.references
        .filter(ref => ref.trim())
        .map(ref => {
          const validated = validateUrl(ref.trim());
          return validated === false ? ref.trim() : validated;
        });

      // Build the new job object
      const jobData = {
        title: formData.category, // Auto-generate title from category
        category: formData.category,
        sport: formData.sport,
        gender: formData.gender,
        age: formData.age,
        budgetRange: formData.budgetRange,
        remote: isRemote,
        schedule: isRemote ? [] : formData.schedule,
        location: isRemote ? null : {
          city: formData.location.city.trim(),
          state: formData.location.state.trim().toUpperCase()
        },
        references: processedReferences,
        description: formData.description.trim()
      };

      const result = addJob(jobData);
      
      if (result.success) {
        onSuccess(result.job);
      } else {
        setErrors({ submit: result.error });
      }
    } catch (error) {
      console.error('Error submitting job:', error);
      setErrors({ submit: 'Failed to post job. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const isRemote = REMOTE_CATEGORIES.includes(formData.category);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Post a Job</h2>
        <p className="text-gray-600 mt-2">Fill out the details below to post your job opportunity.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Submit Error */}
        {errors.submit && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <div className="text-red-800 text-sm">{errors.submit}</div>
          </div>
        )}

        {/* Project Details Section */}
        <div className="space-y-6">
          <div className="border-b border-gray-200 pb-2">
            <h3 className="text-lg font-semibold text-gray-900">Project Details</h3>
            <p className="text-sm text-gray-600">Basic information about your project</p>
          </div>

          {/* Category */}
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
              Category *
            </label>
            <select
              id="category"
              value={formData.category}
              onChange={(e) => handleInputChange('category', e.target.value)}
              className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                errors.category ? 'border-red-300' : 'border-gray-300'
              }`}
            >
              {CATEGORIES.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
            {errors.category && <p className="mt-1 text-sm text-red-600">{errors.category}</p>}
            {isRemote && (
              <p className="mt-1 text-sm text-blue-600">This category is automatically marked as Remote work</p>
            )}
          </div>

          {/* Sport */}
          <div>
            <label htmlFor="sport" className="block text-sm font-medium text-gray-700 mb-2">
              Sport *
            </label>
            <select
              id="sport"
              value={formData.sport}
              onChange={(e) => handleInputChange('sport', e.target.value)}
              className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                errors.sport ? 'border-red-300' : 'border-gray-300'
              }`}
            >
              <option value="">Select a sport</option>
              {SPORTS.map(sport => (
                <option key={sport} value={sport}>{sport}</option>
              ))}
            </select>
            {errors.sport && <p className="mt-1 text-sm text-red-600">{errors.sport}</p>}
          </div>

          {/* Gender & Age Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="gender" className="block text-sm font-medium text-gray-700 mb-2">
                Gender *
              </label>
              <select
                id="gender"
                value={formData.gender}
                onChange={(e) => handleInputChange('gender', e.target.value)}
                className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                  errors.gender ? 'border-red-300' : 'border-gray-300'
                }`}
              >
                <option value="">Select gender</option>
                {genders.map(gender => (
                  <option key={gender} value={gender}>{gender}</option>
                ))}
              </select>
              {errors.gender && <p className="mt-1 text-sm text-red-600">{errors.gender}</p>}
            </div>

            <div>
              <label htmlFor="age" className="block text-sm font-medium text-gray-700 mb-2">
                Age Group *
              </label>
              <select
                id="age"
                value={formData.age}
                onChange={(e) => handleInputChange('age', e.target.value)}
                className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                  errors.age ? 'border-red-300' : 'border-gray-300'
                }`}
              >
                <option value="">Select age group</option>
                {ages.map(age => (
                  <option key={age} value={age}>{age}</option>
                ))}
              </select>
              {errors.age && <p className="mt-1 text-sm text-red-600">{errors.age}</p>}
            </div>
          </div>

          {/* Budget */}
          <div>
            <label htmlFor="budgetRange" className="block text-sm font-medium text-gray-700 mb-2">
              Budget Range *
            </label>
            <select
              id="budgetRange"
              value={formData.budgetRange}
              onChange={(e) => handleInputChange('budgetRange', e.target.value)}
              className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                errors.budgetRange ? 'border-red-300' : 'border-gray-300'
              }`}
            >
              <option value="">Select budget range</option>
              {budgetRanges.map(range => (
                <option key={range} value={range}>{range}</option>
              ))}
            </select>
            {errors.budgetRange && <p className="mt-1 text-sm text-red-600">{errors.budgetRange}</p>}
          </div>
        </div>

        {/* Event Details Section (conditional) */}
        {!isRemote && (
          <div className="space-y-6">
            <div className="border-b border-gray-200 pb-2">
              <h3 className="text-lg font-semibold text-gray-900">Event Details</h3>
              <p className="text-sm text-gray-600">When and where the work will take place</p>
            </div>

            {/* Schedule */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Schedule *
              </label>
              <EnhancedScheduleEditor
                value={formData.schedule}
                onChange={handleScheduleChange}
                required={true}
              />
              {errors.schedule && <p className="mt-1 text-sm text-red-600">{errors.schedule}</p>}
            </div>

            {/* Location */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Location *
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="city" className="block text-sm font-medium text-gray-600 mb-1">
                    City
                  </label>
                  <input
                    type="text"
                    id="city"
                    placeholder="e.g., Boston"
                    value={formData.location.city}
                    onChange={(e) => handleLocationChange('city', e.target.value)}
                    className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                      errors.city ? 'border-red-300' : 'border-gray-300'
                    }`}
                  />
                  {errors.city && <p className="mt-1 text-sm text-red-600">{errors.city}</p>}
                </div>
                <div>
                  <label htmlFor="state" className="block text-sm font-medium text-gray-600 mb-1">
                    State
                  </label>
                  <input
                    type="text"
                    id="state"
                    placeholder="e.g., MA"
                    value={formData.location.state}
                    onChange={(e) => handleLocationChange('state', e.target.value)}
                    className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                      errors.state ? 'border-red-300' : 'border-gray-300'
                    }`}
                    maxLength={2}
                  />
                  {errors.state && <p className="mt-1 text-sm text-red-600">{errors.state}</p>}
                  <p className="mt-1 text-xs text-gray-500">2-letter state code</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Additional Information Section */}
        <div className="space-y-6">
          <div className="border-b border-gray-200 pb-2">
            <h3 className="text-lg font-semibold text-gray-900">Additional Information</h3>
            <p className="text-sm text-gray-600">References and project description</p>
          </div>

          {/* References */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              References (Optional)
            </label>
            <div className="space-y-3">
              {formData.references.map((ref, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    type="url"
                    placeholder="https://example.com/portfolio"
                    value={ref}
                    onChange={(e) => updateReference(index, e.target.value)}
                    className={`flex-1 px-3 py-2 border rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                      errors[`reference_${index}`] ? 'border-red-300' : 'border-gray-300'
                    }`}
                  />
                  {formData.references.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeReference(index)}
                      className="px-3 py-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-md border border-red-300"
                    >
                      Remove
                    </button>
                  )}
                </div>
              ))}
              {formData.references.map((_, index) => (
                errors[`reference_${index}`] && (
                  <p key={`error_${index}`} className="text-sm text-red-600">{errors[`reference_${index}`]}</p>
                )
              ))}
            </div>
            <button
              type="button"
              onClick={addReference}
              className="mt-3 text-sm text-blue-600 hover:text-blue-800 font-medium"
            >
              + Add another reference
            </button>
            <p className="mt-1 text-xs text-gray-500">Add portfolio examples or reference materials. https:// will be added automatically if missing.</p>
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              Project Description *
            </label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              rows={6}
              className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                errors.description ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="Provide detailed information about what you need, deliverables, timeline, and any specific requirements..."
              maxLength={2000}
            />
            {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description}</p>}
            <p className="mt-1 text-xs text-gray-500">{formData.description.length}/2000 characters</p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-gray-200">
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 px-6 py-3 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isSubmitting ? 'Posting Job...' : 'Post Job'}
          </button>
          
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-3 bg-gray-100 text-gray-700 text-sm font-medium rounded-md hover:bg-gray-200 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
            >
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default CustomerForm; 