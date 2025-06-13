'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  UseCreateOpportunityFormProps,
  UseCreateOpportunityFormReturn
} from '../types';
import { createOpportunitySchema } from '../schemas';

export type CreateOpportunityFormData = {
  clientName: string;
  opportunityName: string;
  expectedStartDate: string;
  probability: number;
  comment?: string;
};

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
        clientName: initialData.clientName || '',
        opportunityName: initialData.opportunityName || '',
        expectedStartDate: initialData.expectedStartDate || '',
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
          id: crypto.randomUUID(),
          ...formData,
          createdAt: new Date().toISOString().split('T')[0],
          status: 'In Progress' as const,
          roles: [],
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
