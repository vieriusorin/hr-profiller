'use client';

import { useState, useEffect } from 'react';
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
import { Role, UpdateRole } from '@/lib/api-client';
import { OpportunityLevel } from '@/lib/backend-types/enums';
import { JobGrade } from '@/lib/backend-types/enums';

const mapRoleToFormData = (role: Partial<Role> | undefined): CreateRoleFormData => {
  if (!role) {
    return {
      roleName: '',
      requiredGrade: 'SE' as JobGrade,
      opportunityLevel: 'Medium' as OpportunityLevel,
      allocation: 100,
      needsHire: false,
      comments: '',
      assignedMemberIds: [],
      newHireName: '',
    };
  }

  const formData: CreateRoleFormData = {
    roleName: role.roleName || '',
    requiredGrade: (role.jobGrade as JobGrade) || 'SE',
    opportunityLevel: (role.level as OpportunityLevel) || 'Medium',
    allocation: role.allocation || 100,
    needsHire: role.status === 'Open',
    comments: role.notes || '',
    assignedMemberIds: role.assignedMembers?.map(member => member.id) || [],
    newHireName: '',
  };

  return formData;
};

export const useRoleForm = ({
  mode = 'create',
  initialData,
  onSubmit,
  onCancel,
  isSubmitting: externalIsSubmitting,
}: UseRoleFormProps): UseRoleFormReturn => {
  const [isSubmitting, setIsSubmitting] = useState(false);


  const defaultFormValues: CreateRoleFormData = {
    roleName: '',
    requiredGrade: 'SE' as JobGrade,
    opportunityLevel: 'Medium' as OpportunityLevel,
    allocation: 100,
    needsHire: false,
    comments: '',
    assignedMemberIds: [],
    newHireName: '',
  };

  const initialFormValues = mode === 'edit' && initialData
    ? mapRoleToFormData(initialData.data)
    : defaultFormValues;

  const form = useForm<CreateRoleFormData>({
    resolver: zodResolver(createRoleSchema),
    defaultValues: initialFormValues,
  });

  useEffect(() => {
    if (mode === 'edit' && initialData) {
      const formData = mapRoleToFormData(initialData.data);
      form.reset(formData);
      // Force a re-render by triggering form validation
      form.trigger();
    } else if (mode === 'create') {
      form.reset(defaultFormValues);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, initialData]);

  const handleSubmit = async () => {
    await form.handleSubmit(async (data: CreateRoleFormData) => {
      setIsSubmitting(true);

      try {
        const roleData: UpdateRole & { assignedMembers?: string[] } = {
          roleName: data.roleName,
          jobGrade: data.requiredGrade,
          level: data.opportunityLevel,
          allocation: data.allocation,
          status: mode === 'create' ? 'Open' as const : initialData?.data?.status,
          notes: data.comments,
          assignedMembers: data.needsHire ? [] : data.assignedMemberIds,
        };

        await onSubmit(roleData);
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