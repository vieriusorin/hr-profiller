import { UseFormReturn } from 'react-hook-form';
import { Opportunity, Role } from '@/shared/types';
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
  onSubmit: (opportunity: Opportunity) => Promise<void>;
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
  onSubmit: (role: Role) => Promise<void>;
  isSubmitting?: boolean;
  comment?: string;
  opportunity?: Opportunity;
}

export interface UseCreateOpportunityFormProps extends FormActions {
  onSubmit: (opportunity: Opportunity) => Promise<Opportunity>;
  initialData?: Partial<Opportunity>;
  mode?: 'create' | 'edit';
  isSubmitting?: boolean;
  comment?: string;
}

export interface UseRoleFormProps extends FormActions {
  mode?: 'create' | 'edit';
  initialData?: Partial<Role>;
  onSubmit: (role: Role) => Promise<void>;
  isSubmitting?: boolean;
  comment?: string;
}

export interface UseCreateOpportunityFormReturn extends UseFormBaseReturn {
  form: UseFormReturn<CreateOpportunityFormData>;
  handleSubmit: () => Promise<Opportunity>;
}

export interface UseRoleFormReturn extends UseFormBaseReturn {
  form: UseFormReturn<CreateRoleFormData>;
  handleSubmit: () => Promise<void>;
} 
