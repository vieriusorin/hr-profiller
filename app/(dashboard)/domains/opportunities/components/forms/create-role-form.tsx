'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FormField } from '@/shared/components/form-field/';
import { GRADE_OPTIONS } from '@/shared/lib/constants/grades';
import { useCreateRoleForm } from './hooks/useCreateRoleForm';
import { CreateRoleFormProps } from './types';
import { Controller } from 'react-hook-form';

export const CreateRoleForm = ({ onSubmit, onCancel }: CreateRoleFormProps) => {
  const {
    form,
    isSubmitting,
    handleSubmit,
    handleCancel
  } = useCreateRoleForm({ onSubmit, onCancel });

  const { control, formState: { errors } } = form;

  return (
    <div className='space-y-4'>
      <Controller
        name='roleName'
        control={control}
        render={({ field }) => (
          <FormField 
            label='Role Name' 
            value={field.value}
            onChange={field.onChange}
            placeholder='e.g., Senior Frontend Developer'
            error={errors.roleName?.message}
            required
          />
        )}
      />
      
      <div className='space-y-2'>
        <label className='text-sm font-medium'>
          Required Grade
          <span className='text-red-500 ml-1'>*</span>
        </label>
        <Controller
          name='requiredGrade'
          control={control}
          render={({ field }) => (
            <Select 
              value={field.value} 
              onValueChange={field.onChange}
            >
              <SelectTrigger className={errors.requiredGrade ? 'border-red-500' : ''}>
                <SelectValue placeholder='Select required grade' />
              </SelectTrigger>
              <SelectContent>
                {GRADE_OPTIONS.map(grade => (
                  <SelectItem key={grade.value} value={grade.value}>
                    {grade.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
        {errors.requiredGrade && (
          <div className='flex items-center gap-1 text-red-600 text-sm'>
            <span className='h-3 w-3'>⚠</span>
            {errors.requiredGrade.message}
          </div>
        )}
      </div>
      
      <div className='space-y-2'>
        <label className='text-sm font-medium'>
          Needs Hire?
          <span className='text-red-500 ml-1'>*</span>
        </label>
        <Controller
          name='needsHire'
          control={control}
          render={({ field }) => (
            <Select 
              value={field.value} 
              onValueChange={field.onChange}
            >
              <SelectTrigger className={errors.needsHire ? 'border-red-500' : ''}>
                <SelectValue placeholder='Select if hire is needed' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='No'>No</SelectItem>
                <SelectItem value='Yes'>Yes</SelectItem>
              </SelectContent>
            </Select>
          )}
        />
        {errors.needsHire && (
          <div className='flex items-center gap-1 text-red-600 text-sm'>
            <span className='h-3 w-3'>⚠</span>
            {errors.needsHire.message}
          </div>
        )}
      </div>
      
      <Controller
        name='comments'
        control={control}
        render={({ field }) => (
          <FormField 
            label='Comments (Optional)' 
            value={field.value}
            onChange={field.onChange}
            placeholder='Additional requirements or notes...'
            type='textarea'
            rows={3}
            error={errors.comments?.message}
          />
        )}
      />
      
      <div className='flex justify-end gap-2'>
        <Button 
          type='button' 
          variant='outline' 
          onClick={handleCancel}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button 
          onClick={handleSubmit}
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Adding...' : 'Add Role'}
        </Button>
      </div>
    </div>
  );
}; 