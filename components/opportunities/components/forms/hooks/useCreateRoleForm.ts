'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  createRoleSchema,
  CreateRoleFormData
} from '../schemas';

interface UseCreateRoleFormProps {
  onSubmit: (data: CreateRoleFormData) => Promise<void>;
  onCancel: () => void;
  isSubmitting?: boolean;
}

export const useCreateRoleForm = ({
  onSubmit,
  onCancel,
  isSubmitting = false,
}: UseCreateRoleFormProps) => {
  const form = useForm<CreateRoleFormData>({
    resolver: zodResolver(createRoleSchema),
    defaultValues: {
      roleName: '',
      requiredGrade: 'SE',
      allocation: 100,
      needsHire: false,
      comments: '',
      isActive: true,
      assignedMemberIds: [],
      newHireName: '',
    },
  });

  const handleSubmit = async () => {
    await form.handleSubmit(async (data: CreateRoleFormData) => {
      try {
        const newRole = {
          id: crypto.randomUUID(),
          ...data,
          status: 'Open' as const,
        };

        await onSubmit(newRole);
        form.reset();
      } catch (error) {
        console.error('Failed to create role:', error);
      }
    })();
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
