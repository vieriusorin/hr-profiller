'use client';

import { useQuery } from '@tanstack/react-query';
import { validatedOpportunityApi, ApiValidationError } from '@/shared/lib/api/validated-api';
import { queryKeys } from '@/shared/lib/query/keys';
import { OpportunityCard } from './opportunity-card/opportunity-card';
import { useState } from 'react';

const ValidationErrorDisplay = ({ 
  error, 
  onRetry,
  fallbackData
}: { 
  error: ApiValidationError | Error;
  onRetry?: () => void;
  fallbackData?: any[];
}) => {
  const [showDetails, setShowDetails] = useState(false);
  const isValidationError = error instanceof ApiValidationError;

  return (
    <div className='my-4 p-4 border border-red-200 bg-red-50 rounded-lg'>
      <div className='flex items-center justify-between mb-2'>
        <h3 className='font-medium text-red-800'>
          {isValidationError ? `Data Validation Error` : 'Error'}
        </h3>
        <div className='flex gap-2'>
          {isValidationError && (
            <button
              onClick={() => setShowDetails(!showDetails)}
              className='text-xs text-red-600 hover:text-red-800 underline'
            >
              {showDetails ? 'Hide Details' : 'Show Details'}
            </button>
          )}
          {onRetry && (
            <button
              onClick={onRetry}
              className='text-xs bg-red-100 hover:bg-red-200 text-red-700 px-2 py-1 rounded'
            >
              Retry
            </button>
          )}
        </div>
      </div>
      
      <p className='text-red-700 text-sm'>
        {isValidationError 
          ? `Failed to validate data from ${error.endpoint}: ${error.message}`
          : error.message || 'Something went wrong'
        }
      </p>

      {isValidationError && showDetails && (
        <details className='mt-3 bg-red-100 p-3 rounded border border-red-300'>
          <summary className='cursor-pointer text-sm font-medium text-red-800'>
            Validation Error Details
          </summary>
          <pre className='mt-2 text-xs text-red-700 overflow-auto'>
            {JSON.stringify(error.getFormattedErrors(), null, 2)}
          </pre>
        </details>
      )}

      {fallbackData && fallbackData.length > 0 && (
        <div className='mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded'>
          <p className='text-yellow-800 text-sm font-medium'>
            ⚠️ Showing {fallbackData.length} partially validated items
          </p>
          <p className='text-yellow-700 text-xs mt-1'>
            Some data may be incomplete or invalid. Please refresh to get the latest data.
          </p>
        </div>
      )}
    </div>
  );
};

// Loading component
const LoadingSpinner = () => (
  <div className='flex items-center justify-center p-8'>
    <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600'></div>
    <span className='ml-2 text-gray-600'>Loading opportunities...</span>
  </div>
);

// Main component demonstrating validated API usage
export const ValidatedOpportunitiesList = () => {
  const {
    data: opportunities,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: queryKeys.opportunities.inProgress(),
    queryFn: async () => {
      const result = await validatedOpportunityApi.getInProgressOpportunities();
      
      if (result.success) {
        console.log('✅ Successfully validated opportunities data');
        return {
          data: result.data,
          hasValidationError: false,
          fallbackData: null,
          validationError: null,
        };
      }
      
      // Handle validation errors with fallback
      console.warn('⚠️ Validation failed, checking for fallback data:', result.error);
      
      return {
        data: result.fallbackData || [],
        hasValidationError: true,
        fallbackData: result.fallbackData,
        validationError: result.error,
      };
    },
    retry: (failureCount, error) => {
      // Don't retry validation errors, only network errors
      if (error instanceof ApiValidationError) {
        return false;
      }
      return failureCount < 3;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error && !(error instanceof ApiValidationError)) {
    return (
      <ValidationErrorDisplay 
        error={error}
        onRetry={() => refetch()}
      />
    );
  }

  const validatedData = opportunities?.data || [];
  const hasValidationError = opportunities?.hasValidationError || false;
  const validationError = opportunities?.validationError || null;
  const fallbackData = opportunities?.fallbackData || null;

  return (
    <div className='space-y-4'>
      {hasValidationError && validationError && (
        <ValidationErrorDisplay 
          error={validationError}
          onRetry={() => refetch()}
          fallbackData={fallbackData}
        />
      )}
      
      {validatedData.length === 0 ? (
        <div className='text-center py-8 text-gray-500'>
          <p>No opportunities found</p>
          {hasValidationError && (
            <p className='text-sm mt-2'>
              This could be due to data validation issues. Try refreshing.
            </p>
          )}
        </div>
      ) : (
        <div className='grid gap-4'>
          {validatedData.map((opportunity) => (
            <div key={opportunity.id} className='relative'>
              {/* Add visual indicator for items that might have validation issues */}
              {hasValidationError && (
                <div className='absolute top-2 right-2 w-3 h-3 bg-yellow-400 rounded-full' 
                     title='This item may have validation issues' />
              )}
              <OpportunityCard
                opportunity={opportunity}
                onAddRole={() => {}}
                onMoveToHold={() => {}}
                onUpdateRole={() => {}}
                hideActions={hasValidationError} // Disable actions if data is questionable
              />
            </div>
          ))}
        </div>
      )}
      
      {/* Summary info */}
      <div className='mt-6 p-3 bg-gray-50 rounded text-sm text-gray-600'>
        <div className='flex justify-between items-center'>
          <span>
            Showing {validatedData.length} opportunities
          </span>
          <div className='flex items-center gap-4'>
            {hasValidationError && (
              <span className='text-yellow-600 font-medium'>
                ⚠️ Validation Issues
              </span>
            )}
            <button
              onClick={() => refetch()}
              className='text-blue-600 hover:text-blue-800 underline'
            >
              Refresh Data
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Example of handling form submissions with validation
export const CreateOpportunityWithValidation = () => {
  const [formData, setFormData] = useState({
    clientName: '',
    opportunityName: '',
    expectedStartDate: '',
    probability: 50,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationError, setValidationError] = useState<ApiValidationError | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setValidationError(null);

    try {
      const result = await validatedOpportunityApi.createOpportunity(formData);
      
      if (result.success) {
        console.log('✅ Opportunity created successfully:', result.data);
        // Reset form
        setFormData({
          clientName: '',
          opportunityName: '',
          expectedStartDate: '',
          probability: 50,
        });
      } else {
        console.error('❌ Failed to create opportunity:', result.error);
        if (result.error instanceof ApiValidationError) {
          setValidationError(result.error);
        }
      }
    } catch (error) {
      console.error('❌ Unexpected error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className='space-y-4 p-4 border rounded'>
      <h3 className='font-medium'>Create New Opportunity (with Validation)</h3>
      
      {validationError && (
        <ValidationErrorDisplay 
          error={validationError}
          onRetry={() => setValidationError(null)}
        />
      )}

      {/* Form fields would go here */}
      <div className='space-y-2'>
        <input
          type='text'
          placeholder='Client Name'
          value={formData.clientName}
          onChange={(e) => setFormData(prev => ({ ...prev, clientName: e.target.value }))}
          className='w-full p-2 border rounded'
          required
        />
        <input
          type='text'
          placeholder='Opportunity Name'
          value={formData.opportunityName}
          onChange={(e) => setFormData(prev => ({ ...prev, opportunityName: e.target.value }))}
          className='w-full p-2 border rounded'
          required
        />
        <input
          type='date'
          value={formData.expectedStartDate}
          onChange={(e) => setFormData(prev => ({ ...prev, expectedStartDate: e.target.value }))}
          className='w-full p-2 border rounded'
          required
        />
        <input
          type='number'
          min='0'
          max='100'
          value={formData.probability}
          onChange={(e) => setFormData(prev => ({ ...prev, probability: parseInt(e.target.value) }))}
          className='w-full p-2 border rounded'
        />
      </div>

      <button
        type='submit'
        disabled={isSubmitting}
        className='px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50'
      >
        {isSubmitting ? 'Creating...' : 'Create Opportunity'}
      </button>
    </form>
  );
}; 