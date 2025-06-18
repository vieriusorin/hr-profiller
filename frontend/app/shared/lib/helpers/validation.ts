import { CreateOpportunityForm, CreateRoleForm, ValidationErrors } from '../../types';

export const validateOpportunity = (opportunity: CreateOpportunityForm): ValidationErrors => {
  const errors: ValidationErrors = {};
  
  if (!opportunity.clientName.trim()) {
    errors.clientName = 'Client name is required';
  }
  
  if (!opportunity.opportunityName.trim()) {
    errors.opportunityName = 'Opportunity name is required';
  }
  
  if (!opportunity.expectedStartDate) {
    errors.expectedStartDate = 'Expected start date is required';
  }
  
  if (opportunity.probability < 1 || opportunity.probability > 100) {
    errors.probability = 'Probability must be between 1-100%';
  }
  
  return errors;
};

export const validateRole = (role: CreateRoleForm): ValidationErrors => {
  const errors: ValidationErrors = {};
  
  if (!role.roleName.trim()) {
    errors.roleName = 'Role name is required';
  }
  
  if (!role.requiredGrade) {
    errors.requiredGrade = 'Please select a grade';
  }
  
  return errors;
};

export const hasValidationErrors = (errors: ValidationErrors): boolean => {
  return Object.keys(errors).length > 0;
}; 
