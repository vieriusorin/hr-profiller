'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  CreateOpportunityFormData,
  UseCreateOpportunityFormReturn
} from '../types';
import { createOpportunitySchema } from '../schemas';

export const useCreateOpportunityForm = ({
  onSubmit,
  onCancel,
  initialData,
  mode = 'create',
  isSubmitting: externalIsSubmitting,
}: any): UseCreateOpportunityFormReturn => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const form = useForm<CreateOpportunityFormData>({
    resolver: zodResolver(createOpportunitySchema),
    defaultValues: initialData
      ? {
          clientName: initialData.clientName ?? '',
          opportunityName: initialData.opportunityName ?? '',
          expectedStartDate: initialData.expectedStartDate || '',
          expectedEndDate: initialData.expectedEndDate || '',
          probability: initialData.probability ?? 0,
          comment: initialData.comment || '',
      }
      : undefined,
  });

  const handleSubmit = async () => {
    const isValid = await form.trigger();
    if (!isValid) return;

    const formData = form.getValues();
    setIsSubmitting(true);

    try {
      if (mode === 'edit') {
        await onSubmit(formData);
      } else {
        const newOpportunity = {
          ...formData,
          status: 'In Progress' as const,
          expectedStartDate: formData.expectedStartDate || null,
          expectedEndDate: formData.expectedEndDate || null,
        };
        
        await onSubmit(newOpportunity);
        form.reset();
      }
    } catch (error) {
      console.error(`Failed to ${mode} opportunity:`, error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    form.reset();
    onCancel();
  };

  return {
    form,
    handleSubmit,
    handleCancel,
    isSubmitting: externalIsSubmitting !== undefined ? externalIsSubmitting : isSubmitting,
    isDirty: form.formState.isDirty,
  };
}; 
