/* 
 * Example: Using Validated API with Zod Validation
 * 
 * This file demonstrates how to use the validated API wrapper
 * with proper error handling and fallback data display.
 */

'use client';

import { useState } from 'react';
import { validatedOpportunityApi, ApiValidationError } from '@/shared/lib/api/validated-api';
import { type Opportunity, type CreateOpportunityInput } from '@/shared/schemas/api-schemas';

// Example 1: Simple API call with validation
export const fetchOpportunitiesExample = async () => {
  try {
    const result = await validatedOpportunityApi.getInProgressOpportunities();
    
    if (result.success) {
      // ✅ Data is fully validated and type-safe
      console.log('Validated opportunities:', result.data);
      return result.data; // Type: Opportunity[]
    } else {
      // ❌ Validation failed
      console.error('Validation failed:', result.error);
      
      // Check if we have partially valid fallback data
      if (result.fallbackData && result.fallbackData.length > 0) {
        console.warn('Using fallback data with some invalid items filtered out');
        return result.fallbackData; // Type: Opportunity[]
      }
      
      // Handle different error types
      if (result.error instanceof ApiValidationError) {
        // Validation-specific error handling
        console.error('Field errors:', result.error.getFormattedErrors());
        console.error('Endpoint:', result.error.endpoint);
      }
      
      return [];
    }
  } catch (error) {
    console.error('Network or other error:', error);
    return [];
  }
};

// Example 2: Create operation with input validation
export const createOpportunityExample = async (inputData: CreateOpportunityInput) => {
  try {
    const result = await validatedOpportunityApi.createOpportunity(inputData);
    
    if (result.success) {
      console.log('✅ Created opportunity:', result.data);
      return { success: true, opportunity: result.data };
    } else {
      console.error('❌ Failed to create:', result.error);
      
      if (result.error instanceof ApiValidationError) {
        // Get field-specific errors for form display
        const formErrors = result.error.getFormattedErrors();
        return { 
          success: false, 
          errors: formErrors,
          message: result.error.message 
        };
      }
      
      return { 
        success: false, 
        message: result.error.message || 'Unknown error' 
      };
    }
  } catch (error) {
    return { 
      success: false, 
      message: 'Network error occurred' 
    };
  }
};

// Example 3: React component with validation error handling
export const ValidatedOpportunityComponent = () => {
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(false);
  const [validationError, setValidationError] = useState<ApiValidationError | null>(null);
  const [hasFallbackData, setHasFallbackData] = useState(false);

  const loadOpportunities = async () => {
    setLoading(true);
    setValidationError(null);
    setHasFallbackData(false);

    try {
      const result = await validatedOpportunityApi.getInProgressOpportunities();
      
      if (result.success) {
        setOpportunities(result.data);
      } else {
        setValidationError(result.error as ApiValidationError);
        
        // Use fallback data if available
        if (result.fallbackData) {
          setOpportunities(result.fallbackData);
          setHasFallbackData(true);
        }
      }
    } catch (error) {
      console.error('Failed to load opportunities:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div>Loading opportunities...</div>;
  }

  return (
    <div className='space-y-4'>
      {/* Display validation error */}
      {validationError && (
        <div className='p-4 bg-red-50 border border-red-200 rounded'>
          <h3 className='font-medium text-red-800'>Data Validation Error</h3>
          <p className='text-red-700 text-sm mt-1'>
            Failed to validate data from {validationError.endpoint}
          </p>
          <details className='mt-2'>
            <summary className='cursor-pointer text-sm text-red-600'>
              View Error Details
            </summary>
            <pre className='text-xs mt-2 text-red-600 overflow-auto'>
              {JSON.stringify(validationError.getFormattedErrors(), null, 2)}
            </pre>
          </details>
          <button 
            onClick={loadOpportunities}
            className='mt-2 px-3 py-1 bg-red-100 text-red-700 text-sm rounded hover:bg-red-200'
          >
            Retry
          </button>
        </div>
      )}

      {/* Display fallback data warning */}
      {hasFallbackData && (
        <div className='p-3 bg-yellow-50 border border-yellow-200 rounded'>
          <p className='text-yellow-800 text-sm'>
            ⚠️ Showing partially validated data. Some items may be incomplete.
          </p>
        </div>
      )}

      {/* Display opportunities */}
      <div className='space-y-2'>
        {opportunities.map((opportunity) => (
          <div key={opportunity.id} className='p-3 border rounded'>
            <h4 className='font-medium'>{opportunity.opportunityName}</h4>
            <p className='text-sm text-gray-600'>Client: {opportunity.clientName}</p>
            <p className='text-sm text-gray-600'>Probability: {opportunity.probability}%</p>
            {hasFallbackData && (
              <span className='text-xs text-yellow-600'>⚠️ Partial data</span>
            )}
          </div>
        ))}
      </div>

      {opportunities.length === 0 && !loading && (
        <div className='text-center py-8 text-gray-500'>
          <p>No opportunities found</p>
          <button 
            onClick={loadOpportunities}
            className='mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700'
          >
            Load Opportunities
          </button>
        </div>
      )}
    </div>
  );
};

// Example 4: Form with validation error display
export const CreateOpportunityForm = () => {
  const [formData, setFormData] = useState<CreateOpportunityInput>({
    clientName: '',
    opportunityName: '',
    expectedStartDate: '',
    probability: 50,
  });
  
  const [errors, setErrors] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrors(null);

    const result = await createOpportunityExample(formData);
    
    if (result.success) {
      // Reset form on success
      setFormData({
        clientName: '',
        opportunityName: '',
        expectedStartDate: '',
        probability: 50,
      });
      alert('Opportunity created successfully!');
    } else {
      setErrors(result.errors || { _errors: [result.message] });
    }
    
    setIsSubmitting(false);
  };

  const getFieldError = (field: string) => {
    return errors?.[field]?._errors?.[0] || errors?.[field]?.[0];
  };

  return (
    <form onSubmit={handleSubmit} className='space-y-4 max-w-md'>
      <h3 className='font-medium text-lg'>Create Opportunity</h3>
      
      {/* General errors */}
      {errors?._errors && (
        <div className='p-3 bg-red-50 border border-red-200 rounded'>
          {errors._errors.map((error: string, index: number) => (
            <p key={index} className='text-red-700 text-sm'>{error}</p>
          ))}
        </div>
      )}

      {/* Client Name */}
      <div>
        <label className='block text-sm font-medium mb-1'>Client Name</label>
        <input
          type='text'
          value={formData.clientName}
          onChange={(e) => setFormData(prev => ({ ...prev, clientName: e.target.value }))}
          className={`w-full p-2 border rounded ${getFieldError('clientName') ? 'border-red-500' : 'border-gray-300'}`}
          required
        />
        {getFieldError('clientName') && (
          <p className='text-red-600 text-sm mt-1'>{getFieldError('clientName')}</p>
        )}
      </div>

      {/* Opportunity Name */}
      <div>
        <label className='block text-sm font-medium mb-1'>Opportunity Name</label>
        <input
          type='text'
          value={formData.opportunityName}
          onChange={(e) => setFormData(prev => ({ ...prev, opportunityName: e.target.value }))}
          className={`w-full p-2 border rounded ${getFieldError('opportunityName') ? 'border-red-500' : 'border-gray-300'}`}
          required
        />
        {getFieldError('opportunityName') && (
          <p className='text-red-600 text-sm mt-1'>{getFieldError('opportunityName')}</p>
        )}
      </div>

      {/* Expected Start Date */}
      <div>
        <label className='block text-sm font-medium mb-1'>Expected Start Date</label>
        <input
          type='date'
          value={formData.expectedStartDate}
          onChange={(e) => setFormData(prev => ({ ...prev, expectedStartDate: e.target.value }))}
          className={`w-full p-2 border rounded ${getFieldError('expectedStartDate') ? 'border-red-500' : 'border-gray-300'}`}
          required
        />
        {getFieldError('expectedStartDate') && (
          <p className='text-red-600 text-sm mt-1'>{getFieldError('expectedStartDate')}</p>
        )}
      </div>

      {/* Probability */}
      <div>
        <label className='block text-sm font-medium mb-1'>Probability (%)</label>
        <input
          type='number'
          min='0'
          max='100'
          value={formData.probability}
          onChange={(e) => setFormData(prev => ({ ...prev, probability: parseInt(e.target.value) || 0 }))}
          className={`w-full p-2 border rounded ${getFieldError('probability') ? 'border-red-500' : 'border-gray-300'}`}
        />
        {getFieldError('probability') && (
          <p className='text-red-600 text-sm mt-1'>{getFieldError('probability')}</p>
        )}
      </div>

      <button
        type='submit'
        disabled={isSubmitting}
        className='w-full py-2 px-4 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50'
      >
        {isSubmitting ? 'Creating...' : 'Create Opportunity'}
      </button>
    </form>
  );
};

// Example of how to use the validated API (simplified for demonstration)
export const ApiValidationExample = () => {
  return (
    <div className='p-6 space-y-6'>
      <h1 className='text-2xl font-bold'>Zod API Validation Examples</h1>
      
      <div className='space-y-4'>
        <h2 className='text-lg font-semibold'>Key Features Implemented:</h2>
        
        <div className='bg-green-50 p-4 rounded border border-green-200'>
          <h3 className='font-medium text-green-800'>✅ Comprehensive Zod Schemas</h3>
          <p className='text-green-700 text-sm mt-1'>
            Created reusable schemas for all API data types (Opportunity, Role, Member, etc.)
            with type inference to avoid duplicating TypeScript types.
          </p>
        </div>

        <div className='bg-blue-50 p-4 rounded border border-blue-200'>
          <h3 className='font-medium text-blue-800'>✅ Validated API Wrapper</h3>
          <p className='text-blue-700 text-sm mt-1'>
            Built validatedOpportunityApi that validates all server responses,
            provides fallback data for partial validation failures, and enhanced error reporting.
          </p>
        </div>

        <div className='bg-purple-50 p-4 rounded border border-purple-200'>
          <h3 className='font-medium text-purple-800'>✅ Enhanced Error Handling</h3>
          <p className='text-purple-700 text-sm mt-1'>
            ApiValidationError class with detailed field-level error reporting,
            graceful degradation with fallback data, and developer-friendly error display.
          </p>
        </div>

        <div className='bg-orange-50 p-4 rounded border border-orange-200'>
          <h3 className='font-medium text-orange-800'>✅ TanStack Query Integration</h3>
          <p className='text-orange-700 text-sm mt-1'>
            Updated query hooks to use validated API, with proper error states,
            validation error detection, and fallback data support.
          </p>
        </div>
      </div>

      <div className='border-t pt-6'>
        <h2 className='text-lg font-semibold mb-4'>Usage Pattern:</h2>
        
        <div className='bg-gray-100 p-4 rounded'>
          <pre className='text-sm overflow-x-auto'>{`
// 1. Import validated API and types
import { validatedOpportunityApi } from '@/shared/lib/api/validated-api';
import { type Opportunity } from '@/shared/schemas/api-schemas';

// 2. Use in TanStack Query
const { data, error } = useQuery({
  queryKey: ['opportunities'],
  queryFn: async () => {
    const result = await validatedOpportunityApi.getInProgressOpportunities();
    
    if (result.success) {
      return result.data; // Fully validated Opportunity[]
    }
    
    // Handle validation errors with fallback
    if (result.fallbackData) {
      console.warn('Using fallback data:', result.error);
      return result.fallbackData;
    }
    
    throw result.error;
  }
});

// 3. Handle errors in UI
if (error instanceof ApiValidationError) {
  // Show validation-specific error UI
  // Display field errors, retry options, etc.
}
          `}</pre>
        </div>
      </div>

      <div className='bg-yellow-50 p-4 rounded border border-yellow-200'>
        <h3 className='font-medium text-yellow-800'>🎯 Benefits</h3>
        <ul className='text-yellow-700 text-sm mt-2 space-y-1 list-disc list-inside'>
          <li>Type safety with runtime validation</li>
          <li>Automatic filtering of invalid data items</li>
          <li>Graceful degradation with fallback data</li>
          <li>Developer-friendly error messages</li>
          <li>Reusable validation logic across the app</li>
          <li>Enhanced debugging with detailed error reporting</li>
        </ul>
      </div>
    </div>
  );
}; 