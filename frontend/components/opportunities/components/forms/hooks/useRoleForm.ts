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
import { CreateRole, Role } from '@/lib/api-client';
import { OpportunityLevel } from '@/lib/backend-types/enums';
import { JobGrade } from '@/lib/backend-types/enums';

const mapRoleToFormData = (role: Partial<Role> | undefined): Partial<CreateRoleFormData> | undefined => {
  if (!role) return undefined;

  return {
    roleName: role.roleName || '',
    requiredGrade: role.jobGrade as JobGrade,
    opportunityLevel: role.level as OpportunityLevel,
    allocation: role.allocation || 100,
    needsHire: role.status === 'Open',
    comments: role.notes || '',
    assignedMemberIds: role.assignedMembers?.map(member => member.id) || [],
    newHireName: '',
  };
};

export const useRoleForm = ({
  mode = 'create',
  initialData,
  onSubmit,
  onCancel,
  isSubmitting: externalIsSubmitting,
}: UseRoleFormProps): UseRoleFormReturn => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Transform the API role data to form data format
  const formDefaultValues = mapRoleToFormData(initialData) || {
    roleName: '',
    requiredGrade: 'SE',
    opportunityLevel: 'Medium',
    allocation: 100,
    needsHire: false,
    comments: '',
    assignedMemberIds: [],
    newHireName: '',
  };

  const form = useForm<CreateRoleFormData>({
    resolver: zodResolver(createRoleSchema),
    defaultValues: formDefaultValues,
  });

  const handleSubmit = async () => {
    await form.handleSubmit(async (data) => {
      setIsSubmitting(true);

      try {
        const roleData = {
          ...data,
          status: mode === 'create' ? 'Open' as const : initialData?.status,
          assignedMemberIds: data.needsHire ? [] : data.assignedMemberIds,
          newHireName: data.needsHire ? data.newHireName : '',
        };

        await onSubmit(roleData as unknown as CreateRole);
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