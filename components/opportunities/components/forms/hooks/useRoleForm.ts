'use client';

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
  const form = useForm<CreateRoleFormData>({
    resolver: zodResolver(createRoleSchema),
    defaultValues: {
      roleName: initialData?.roleName || '',
      requiredGrade: initialData?.requiredGrade || 'SE',
      allocation: initialData?.allocation || 100,
      isActive: true,
      needsHire: initialData?.needsHire || false,
      comments: initialData?.comments || '',
      assignedMemberIds: initialData?.assignedMemberIds || [],
      newHireName: initialData?.newHireName || '',
    },
  });

  const handleSubmit = async () => {
    await form.handleSubmit(async (formData: CreateRoleFormData) => {
      try {
        const roleData: Role = {
          id: initialData?.id || crypto.randomUUID(),
          roleName: formData.roleName,
          requiredGrade: formData.requiredGrade,
          allocation: formData.allocation,
          needsHire: formData.needsHire,
          status: mode === 'create' ? 'Open' as const : initialData?.status || 'Open',
          comments: formData.comments,
          assignedMemberIds: formData.needsHire ? [] : formData.assignedMemberIds,
          newHireName: formData.needsHire ? formData.newHireName : '',
          isActive: true,
        };

        await onSubmit(roleData);
        if (mode === 'create') {
          form.reset();
        }
      } catch (error) {
        console.error(`Failed to ${mode} role:`, error);
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
    isSubmitting: externalIsSubmitting ?? false,
    isDirty: form.formState.isDirty,
  };
}; 