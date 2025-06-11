'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { 
  UseCreateOpportunityFormProps, 
  UseCreateOpportunityFormReturn 
} from '../types';
import { 
  createOpportunitySchema, 
  CreateOpportunityFormData 
} from '../schemas';

export const useCreateOpportunityForm = ({
  onSubmit,
  onCancel,
}: UseCreateOpportunityFormProps): UseCreateOpportunityFormReturn => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<CreateOpportunityFormData>({
    resolver: zodResolver(createOpportunitySchema),
    defaultValues: {
      clientName: '',
      opportunityName: '',
      expectedStartDate: '',
      probability: 50,
    },
  });

  const handleSubmit = async () => {
    const isValid = await form.trigger();
    if (!isValid) return;

    const formData = form.getValues();
    setIsSubmitting(true);

    try {
      const newOpportunity = {
        id: crypto.randomUUID(),
        ...formData,
        createdAt: new Date().toISOString().split('T')[0],
        status: 'In Progress' as const,
        roles: [],
      };

      await onSubmit(newOpportunity);
      form.reset();
    } catch (error) {
      console.error('Failed to create opportunity:', error);
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
    isSubmitting,
  };
}; 
