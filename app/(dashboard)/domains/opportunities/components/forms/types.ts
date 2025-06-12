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
  onSubmit: (opportunity: Opportunity) => Promise<Opportunity>;
}

export interface RoleFormProps extends FormActions {
  mode?: 'create' | 'edit';
  initialData?: Partial<Role>;
  onSubmit: (role: Role) => Promise<void>;
  isSubmitting?: boolean;
}

export interface UseCreateOpportunityFormProps extends FormActions {
  onSubmit: (opportunity: Opportunity) => Promise<Opportunity>;
}

export interface UseRoleFormProps extends FormActions {
  mode?: 'create' | 'edit';
  initialData?: Partial<Role>;
  onSubmit: (role: Role) => Promise<void>;
  isSubmitting?: boolean;
}

export interface UseCreateOpportunityFormReturn extends UseFormBaseReturn {
  form: UseFormReturn<CreateOpportunityFormData>;
  handleSubmit: () => Promise<void>;
}

export interface UseRoleFormReturn extends UseFormBaseReturn {
  form: UseFormReturn<CreateRoleFormData>;
  handleSubmit: () => Promise<void>;
} 
