'use client';

import { useState } from 'react';
import { Role } from '@/lib/api-client';
import { OpportunityService } from '../services/opportunity-service';
import { validateRole, hasValidationErrors } from '@/shared/lib/helpers/validation';
import { CreateRoleForm, RoleStatus, ValidationErrors } from '@/lib/types';

export const useRoleActions = () => {
  const [newRole, setNewRole] = useState<CreateRoleForm>({
    roleName: '',
    jobGrade: 'SE',
    allocation: 100,
    notes: '',
    opportunityId: '',
    status: 'Open'
  });
  const [roleErrors, setRoleErrors] = useState<ValidationErrors>({});

  const resetRoleForm = () => {
    setNewRole({
      roleName: '',
      jobGrade: 'SE',
      allocation: 100,
      notes: '',
      opportunityId: '',
      status: 'Open'
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
