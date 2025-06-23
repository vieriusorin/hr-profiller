import { CreateOpportunityForm, CreateRoleForm, ValidationErrors } from '@/lib/types';

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

  if (opportunity.expectedEndDate && opportunity.expectedStartDate) {
    const startDate = new Date(opportunity.expectedStartDate);
    const endDate = new Date(opportunity.expectedEndDate);
    if (endDate <= startDate) {
      errors.expectedEndDate = 'Expected end date must be after start date';
    }
  }

  if (opportunity.probability && (opportunity.probability < 1 || opportunity.probability > 100)) {
    errors.probability = 'Probability must be between 1-100%';
  }

  return errors;
};

export const validateRole = (role: CreateRoleForm): ValidationErrors => {
  const errors: ValidationErrors = {};

  if (!role.roleName.trim()) {
    errors.roleName = 'Role name is required';
  }

  if (!role.jobGrade) {
    errors.jobGrade = 'Please select a job grade';
  }

  return errors;
};

export const hasValidationErrors = (errors: ValidationErrors): boolean => {
  return Object.keys(errors).length > 0;
}; 
