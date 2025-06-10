import { UseFormReturn } from 'react-hook-form';
import { Opportunity, Role } from '@/shared/types';
import { CreateOpportunityFormData, CreateRoleFormData } from './schemas';


export interface FormActions {
  onCancel: () => void;
}

export interface UseFormBaseReturn {
  handleCancel: () => void;
  isSubmitting: boolean;
}

export interface CreateOpportunityFormProps extends FormActions {
  onSubmit: (opportunity: Opportunity) => Promise<Opportunity>;
}

export interface CreateRoleFormProps extends FormActions {
  onSubmit: (role: Role) => Promise<void>;
}

export interface UseCreateOpportunityFormProps extends FormActions {
  onSubmit: (opportunity: Opportunity) => Promise<Opportunity>;
}

export interface UseCreateRoleFormProps extends FormActions {
  onSubmit: (role: Role) => Promise<void>;
}

export interface UseCreateOpportunityFormReturn extends UseFormBaseReturn {
  form: UseFormReturn<CreateOpportunityFormData>;
  handleSubmit: () => Promise<void>;
}

export interface UseCreateRoleFormReturn extends UseFormBaseReturn {
  form: UseFormReturn<CreateRoleFormData>;
  handleSubmit: () => Promise<void>;
} 