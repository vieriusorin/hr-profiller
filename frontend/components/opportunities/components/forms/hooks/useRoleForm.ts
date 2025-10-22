'use client';

import { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  UseRoleFormReturn,
  RoleFormProps
} from '../types';
import {
  createRoleSchema,
  CreateRoleFormData
} from '../schemas';
import { Role, UpdateRole, apiClient } from '@/lib/api-client';
import { OpportunityLevel } from '@/lib/backend-types/enums';
import { JobGrade } from '@/lib/backend-types/enums';

const mapRoleToFormData = (role: Role | undefined): CreateRoleFormData => {
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
    requiredGrade: role.jobGrade as JobGrade || 'SE',
    opportunityLevel: role.level as OpportunityLevel || 'Medium',
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
}: RoleFormProps): UseRoleFormReturn => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<CreateRoleFormData>({
    resolver: zodResolver(createRoleSchema),
    defaultValues: mapRoleToFormData(initialData as unknown as Role),
  });

  useEffect(() => {
    if (mode === 'edit' && initialData?.data) {
      const formData = mapRoleToFormData(initialData as unknown as Role);
      form.reset(formData);
      // Force a re-render by triggering form validation
      form.trigger();
    } else if (mode === 'create') {
      form.reset(mapRoleToFormData(undefined));
    }
  }, [form, mode, initialData]);

  const handleSubmit = useCallback(async (data: CreateRoleFormData) => {
    if (isSubmitting || externalIsSubmitting) return;
    setIsSubmitting(true);

    try {
      const roleData: UpdateRole = {
        roleName: data.roleName,
        jobGrade: data.requiredGrade,
        level: data.opportunityLevel,
        allocation: data.allocation,
        status: 'Open',
        notes: data.comments,
      };

      // First update/create the role
      const response = await onSubmit(roleData);

      // Then update assigned members if needed
      if (response?.data?.id) {
        const roleId = response.data.id;
        const currentAssignedIds = initialData?.data?.assignedMembers?.map(member => member.id) || [];
        const newAssignedIds = data.assignedMemberIds || [];

        // Only update if there are changes
        if (JSON.stringify(currentAssignedIds.sort()) !== JSON.stringify(newAssignedIds.sort())) {
          await apiClient.roles.updateAssignedMembers(roleId, newAssignedIds);
        }
      }

      return response;
    } catch (error) {
      console.error('Failed to submit role:', error);
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  }, [initialData, onSubmit, isSubmitting, externalIsSubmitting]);

  const handleCancel = useCallback(() => {
    if (isSubmitting || externalIsSubmitting) return;
    form.reset();
    onCancel?.();
  }, [form, onCancel, isSubmitting, externalIsSubmitting]);

  return {
    form,
    handleSubmit: form.handleSubmit(handleSubmit),
    handleCancel,
    isSubmitting: externalIsSubmitting || isSubmitting,
    isDirty: form.formState.isDirty,
  };
}; 