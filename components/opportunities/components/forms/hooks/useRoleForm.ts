'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { 
  UseRoleFormProps, 
  UseRoleFormReturn 
} from '../types';
import { 
  createRoleSchema, 
  CreateRoleFormData 
} from '../schemas';
import { Role } from '@/shared/types';

export const useRoleForm = ({
  mode = 'create',
  initialData,
  onSubmit,
  onCancel,
  isSubmitting: externalIsSubmitting,
}: UseRoleFormProps): UseRoleFormReturn => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<CreateRoleFormData>({
    resolver: zodResolver(createRoleSchema),
    defaultValues: initialData || {
      roleName: '',
      requiredGrade: 'SE',
      allocation: 100,
      needsHire: false,
      comments: '',
    },
  });

  const handleSubmit = async () => {
    await form.handleSubmit(async (data) => {
      setIsSubmitting(true);

      try {
        const roleData = {
          ...data,
          status: mode === 'create' ? 'Open' as const : initialData?.status,
          assignedMember: mode === 'create' ? null : initialData?.assignedMember,
        };

        await onSubmit(roleData as Role);
        if (mode === 'create') {
          form.reset();
        }
      } catch (error) {
        console.error(`Failed to ${mode} role:`, error);
      } finally {
        setIsSubmitting(false);
      }
    })();
  };

  const handleCancel = () => {
    if (mode === 'create') {
      form.reset();
    }
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