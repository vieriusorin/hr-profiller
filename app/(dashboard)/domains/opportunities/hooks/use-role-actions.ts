'use client';

import { useState } from 'react';
import { Role, RoleStatus, CreateRoleForm, ValidationErrors } from '../../../../shared/types';
import { OpportunityService } from '../services/opportunity-service';
import { validateRole, hasValidationErrors } from '../../../../shared/lib/helpers/validation';

export const useRoleActions = () => {
  const [newRole, setNewRole] = useState<CreateRoleForm>({
    roleName: '',
    requiredGrade: 'SE',
    comments: ''
  });
  const [roleErrors, setRoleErrors] = useState<ValidationErrors>({});

  const resetRoleForm = () => {
    setNewRole({
      roleName: '',
      requiredGrade: 'SE',
      comments: ''
    });
    setRoleErrors({});
  };

  const updateRoleForm = (updates: Partial<CreateRoleForm>) => {
    setNewRole(prev => ({ ...prev, ...updates }));
    // Clear specific errors when user starts typing
    const clearedErrors = { ...roleErrors };
    Object.keys(updates).forEach(key => {
      delete clearedErrors[key];
    });
    setRoleErrors(clearedErrors);
  };

  const validateAndCreateRole = (): Omit<Role, 'id'> | null => {
    const errors = validateRole(newRole);
    setRoleErrors(errors);
    
    if (hasValidationErrors(errors)) {
      return null;
    }
    
    // Return role data without ID - the mock API will generate the ID
    return OpportunityService.createRole(newRole);
  };

  const updateRoleStatus = (role: Role, newStatus: RoleStatus): Role => {
    return OpportunityService.updateRoleStatus(role, newStatus);
  };

  return {
    // State
    newRole,
    roleErrors,
    
    // Actions
    resetRoleForm,
    updateRoleForm,
    validateAndCreateRole,
    updateRoleStatus
  };
}; 
