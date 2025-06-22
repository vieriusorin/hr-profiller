import { UseFormReturn } from 'react-hook-form';
import { Opportunity, Role, UpdateRole } from '@/lib/api-client';
import { CreateOpportunityForm } from '@/lib/types';
import { CreateOpportunityFormData, CreateRoleFormData } from './schemas';

export interface FormActions {
  onCancel: () => void;
}

export interface UseFormBaseReturn {
  handleCancel: () => void;
  isSubmitting: boolean;
  isDirty: boolean;
}

export interface CreateOpportunityFormProps extends FormActions {
  onSubmit: (opportunity: CreateOpportunityForm) => Promise<Opportunity | void>;
  onCancel: () => void;
  initialData?: Partial<Opportunity>;
  mode?: 'create' | 'edit';
  isSubmitting?: boolean;
  comment?: string;
  disabled?: boolean;
}

export interface RoleFormProps extends FormActions {
  mode?: 'create' | 'edit';
  initialData?: Partial<Role>;
  onSubmit: (role: UpdateRole) => Promise<void>;
  isSubmitting?: boolean;
  comment?: string;
  opportunity?: Opportunity;
}

export interface UseCreateOpportunityFormProps extends FormActions {
  onSubmit: (opportunity: CreateOpportunityForm) => Promise<Opportunity>;
  initialData?: Partial<Opportunity>;
  mode?: 'create' | 'edit';
  isSubmitting?: boolean;
  comment?: string;
}

export interface UseRoleFormProps extends FormActions {
  mode?: 'create' | 'edit';
  initialData?: { success: boolean; data: Partial<Role> };
  onSubmit: (role: UpdateRole) => Promise<void>;
  isSubmitting?: boolean;
  comment?: string;
}

export interface UseCreateOpportunityFormReturn extends UseFormBaseReturn {
  form: UseFormReturn<CreateOpportunityFormData>;
  handleSubmit: () => Promise<void>;
}

export interface UseRoleFormReturn extends UseFormBaseReturn {
  form: UseFormReturn<CreateRoleFormData>;
  handleSubmit: () => Promise<void>;
} 
