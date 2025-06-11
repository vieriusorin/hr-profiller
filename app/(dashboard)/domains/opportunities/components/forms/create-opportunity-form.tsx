'use client';

import { Button } from '@/components/ui/button';
import { Range } from '@/components/ui/range';
import { FormField } from '@/shared/components/form-field/';
import { useCreateOpportunityForm } from './hooks/useCreateOpportunityForm';
import { CreateOpportunityFormProps } from './types';
import { Controller } from 'react-hook-form';

export const CreateOpportunityForm = ({ onSubmit, onCancel }: CreateOpportunityFormProps) => {
  const {
    form,
    handleSubmit,
    handleCancel,
    isSubmitting,
  } = useCreateOpportunityForm({ onSubmit, onCancel });

  const { control, formState: { errors } } = form;

  return (
    <div className='space-y-4'>
      <div className='space-y-4'>
        <Controller
          name='clientName'
          control={control}
          render={({ field }) => (
            <FormField
              label='Client Name'
              value={field.value}
              onChange={field.onChange}
              error={errors.clientName?.message}
              required
            />
          )}
        />

        <Controller
          name='opportunityName'
          control={control}
          render={({ field }) => (
            <FormField
              label='Opportunity Name'
              value={field.value}
              onChange={field.onChange}
              error={errors.opportunityName?.message}
              required
            />
          )}
        />

        <Controller
          name='expectedStartDate'
          control={control}
          render={({ field }) => (
            <FormField
              label='Expected Start Date'
              type='date'
              value={field.value ? new Date(field.value) : undefined}
              onChange={(date) => {
                const isoString = date instanceof Date ? date.toISOString().split('T')[0] : '';
                field.onChange(isoString);
              }}
              error={errors.expectedStartDate?.message}
              placeholder='Select start date'
              required
            />
          )}
        />

        <Controller
          name='probability'
          control={control}
          render={({ field }) => (
            <div className='space-y-2'>
              <label className='text-sm font-medium'>
                Probability
                <span className='text-red-500 ml-1'>*</span>
              </label>
              <Range
                value={field.value}
                onChange={field.onChange}
                min={0}
                max={100}
                step={10}
                showLabels={true}
                showValue={true}
                className="mt-2"
              />
              {errors.probability && (
                <div className='flex items-center gap-1 text-red-600 text-sm'>
                  <span className='h-3 w-3'>⚠</span>
                  {errors.probability.message}
                </div>
              )}
            </div>
          )}
        />
      </div>

      <div className='flex gap-2 justify-start'>
        <Button onClick={handleSubmit} disabled={isSubmitting}>
          {isSubmitting ? 'Creating...' : 'Create Opportunity'}
        </Button>
        <Button variant='outline' onClick={handleCancel} disabled={isSubmitting}>
          Cancel
        </Button>
      </div>
    </div>
  );
}; 
