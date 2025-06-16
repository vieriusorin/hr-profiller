'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  UseCreateOpportunityFormReturn
} from '../types';
import { createOpportunitySchema, CreateOpportunityFormData } from '../schemas';
import { Opportunity } from '@/shared/types';

interface UseCreateOpportunityFormProps {
  onSubmit: (data: Opportunity | CreateOpportunityFormData) => Promise<void>;
  onCancel: () => void;
  initialData?: Partial<CreateOpportunityFormData>;
  mode?: 'create' | 'edit';
  isSubmitting?: boolean;
}

export const useCreateOpportunityForm = ({
  onSubmit,
  onCancel,
  initialData,
  mode = 'create',
  isSubmitting = false,
}: UseCreateOpportunityFormProps): UseCreateOpportunityFormReturn => {
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
      : {
        clientName: '',
        opportunityName: '',
        expectedStartDate: '',
        probability: 0,
        comment: '',
      },
  });

  const handleSubmit = async () => {
    const isValid = await form.trigger();
    if (!isValid) return;

    const formData = form.getValues();

    try {
      if (mode === 'edit') {
        await onSubmit(formData);
      } else {
        const newOpportunity: Opportunity = {
          id: crypto.randomUUID(),
          ...formData,
          createdAt: new Date().toISOString().split('T')[0],
          status: 'In Progress' as const,
          roles: [],
          isActive: true,
          expectedEndDate: undefined,
          activatedAt: undefined,
        };
        await onSubmit(newOpportunity);
        form.reset();
      }
    } catch (error) {
      console.error(`Failed to ${mode} opportunity:`, error);
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
    isSubmitting,
    isDirty: form.formState.isDirty,
  };
}; 
