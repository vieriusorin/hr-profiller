'use client';

import { useState } from 'react';
import { Role, RoleStatus, CreateRoleForm, ValidationErrors } from '../../../../shared/types';
import { OpportunityService } from '../services/opportunity-service';
import { validateRole, hasValidationErrors } from '../../../../shared/lib/helpers/validation';

export const useRoleActions = () => {
  const [newRole, setNewRole] = useState<CreateRoleForm>({
    roleName: '',
    requiredGrade: 'SE',
    allocation: 100,
    comments: ''
  });
  const [roleErrors, setRoleErrors] = useState<ValidationErrors>({});

  const resetRoleForm = () => {
    setNewRole({
      roleName: '',
      requiredGrade: 'SE',
      allocation: 100,
      comments: ''
    });
    setRoleErrors({});
  };

  const updateRoleForm = (updates: Partial<CreateRoleForm>) => {
    setNewRole((prev: CreateRoleForm) => ({ ...prev, ...updates }));
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
    
    return OpportunityService.createRole(newRole);
  };

  const updateRoleStatus = (role: Role, newStatus: RoleStatus): Role => {
    return OpportunityService.updateRoleStatus(role, newStatus);
  };

  return {
    newRole,
    roleErrors,
    resetRoleForm,
    updateRoleForm,
    validateAndCreateRole,
    updateRoleStatus
  };
}; 
