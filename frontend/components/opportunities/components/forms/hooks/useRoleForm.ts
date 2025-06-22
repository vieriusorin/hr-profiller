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
import { CreateRole, Role } from '@/lib/api-client';
import { OpportunityLevel } from '@/lib/backend-types/enums';
import { JobGrade } from '@/lib/backend-types/enums';

const mapRoleToFormData = (role: Partial<{ data: Role }> | undefined): CreateRoleFormData => {

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
    roleName: role.data?.roleName || '',
    requiredGrade: (role.data?.jobGrade as JobGrade) || 'SE',
    opportunityLevel: (role.data?.level as OpportunityLevel) || 'Medium',
    allocation: role.data?.allocation || 100,
    needsHire: role.data?.status === 'Open',
    comments: role.data?.notes || '',
    assignedMemberIds: role.data?.assignedMembers?.map(member => member.id) || [],
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


  // Always start with default values for form initialization
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

  // If we have initialData at mount time, use it immediately
  const initialFormValues = mode === 'edit' && initialData
    ? mapRoleToFormData(initialData)
    : defaultFormValues;

  const form = useForm<CreateRoleFormData>({
    resolver: zodResolver(createRoleSchema),
    defaultValues: initialFormValues,
  });

  // Handle form population when initialData becomes available or changes
  useEffect(() => {
    if (mode === 'edit' && initialData) {
      const formData = mapRoleToFormData(initialData);

      // Use setTimeout to ensure this runs after React's render cycle
      setTimeout(() => {

        // Set each field individually to ensure proper form state updates
        form.setValue('roleName', formData.roleName, { shouldDirty: false });
        form.setValue('requiredGrade', formData.requiredGrade, { shouldDirty: false });
        form.setValue('opportunityLevel', formData.opportunityLevel, { shouldDirty: false });
        form.setValue('allocation', formData.allocation, { shouldDirty: false });
        form.setValue('needsHire', formData.needsHire, { shouldDirty: false });
        form.setValue('comments', formData.comments, { shouldDirty: false });
        form.setValue('assignedMemberIds', formData.assignedMemberIds, { shouldDirty: false });
        form.setValue('newHireName', formData.newHireName, { shouldDirty: false });

        // Also reset the form to ensure all state is properly updated
        form.reset(formData);

        // Force a re-render by triggering form validation
        form.trigger();
      }, 1000); // Slightly longer delay to ensure DOM is ready
    } else if (mode === 'create') {
      // Reset to default values for create mode
      form.reset(defaultFormValues);
    }
  }, [mode, initialData?.id, initialData?.roleName, initialData?.jobGrade, initialData?.level]);

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