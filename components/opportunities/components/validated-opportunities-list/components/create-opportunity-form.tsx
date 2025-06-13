'use client';

import { useState } from 'react';
import { ApiValidationError } from '@/shared/lib/api/validated-api';
import { validatedOpportunityApi } from '@/shared/lib/api/validated-api';
import { ValidationErrorDisplay } from './validation-error-display';

interface CreateOpportunityFormData {
  clientName: string;
  opportunityName: string;
  expectedStartDate: string;
  probability: number;
}

export const CreateOpportunityForm = () => {
  const [formData, setFormData] = useState<CreateOpportunityFormData>({
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
      const result = await validatedOpportunityApi.createOpportunity({
        ...formData,
        createdAt: new Date().toISOString(),
      });
      
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