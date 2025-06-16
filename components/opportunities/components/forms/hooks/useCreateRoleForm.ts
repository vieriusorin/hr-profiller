'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import {
  createRoleSchema,
  CreateRoleFormData
} from '../schemas';

export const useCreateRoleForm = ({
  onSubmit,
  onCancel,
}: {
  onSubmit: (data: CreateRoleFormData) => Promise<void>;
  onCancel: () => void;
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<CreateRoleFormData>({
    resolver: zodResolver(createRoleSchema),
    defaultValues: {
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
        const newRole = {
          id: crypto.randomUUID(),
          ...data,
          status: 'Open' as const,
          assignedMemberId: null,
        };

        await onSubmit(newRole);
        form.reset();
      } catch (error) {
        console.error('Failed to create role:', error);
      } finally {
        setIsSubmitting(false);
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
  };
}; 
