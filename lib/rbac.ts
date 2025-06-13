export type UserRole = 'admin' | 'hr_manager' | 'recruiter' | 'employee' | 'user';

export type Permission =
  // Dashboard permissions
  | 'view_dashboard'
  | 'view_analytics'

  // Client permissions
  | 'view_clients'
  | 'create_clients'
  | 'edit_clients'
  | 'delete_clients'
  | 'view_client_financials'

  // Project permissions
  | 'view_projects'
  | 'create_projects'
  | 'edit_projects'
  | 'delete_projects'
  | 'view_project_financials'
  | 'assign_project_members'

  // Opportunity permissions
  | 'edit_opportunity'

  // Candidate permissions
  | 'view_candidates'
  | 'create_candidates'
  | 'edit_candidates'
  | 'delete_candidates'
  | 'view_candidate_salary'
  | 'schedule_interviews'

  // Employee permissions
  | 'view_employees'
  | 'create_employees'
  | 'edit_employees'
  | 'delete_employees'
  | 'view_employee_salary'
  | 'view_employee_performance'
  | 'manage_employee_roles'

  // Account permissions
  | 'view_account'
  | 'edit_account'
  | 'manage_users'
  | 'view_system_settings'
  | 'edit_system_settings';

export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  admin: [
    'view_dashboard',
    'view_analytics',
    'view_clients',
    'create_clients',
    'edit_clients',
    'delete_clients',
    'view_client_financials',
    'view_projects',
    'create_projects',
    'edit_projects',
    'delete_projects',
    'view_project_financials',
    'assign_project_members',
    'edit_opportunity',
    'view_candidates',
    'create_candidates',
    'edit_candidates',
    'delete_candidates',
    'view_candidate_salary',
    'schedule_interviews',
    'view_employees',
    'create_employees',
    'edit_employees',
    'delete_employees',
    'view_employee_salary',
    'view_employee_performance',
    'manage_employee_roles',
    'view_account',
    'edit_account',
    'manage_users',
    'view_system_settings',
    'edit_system_settings',
  ],

  hr_manager: [
    'view_dashboard',
    'view_analytics',
    'view_clients',
    'view_projects',
    'edit_projects',
    'assign_project_members',
    'view_candidates',
    'create_candidates',
    'edit_candidates',
    'delete_candidates',
    'view_candidate_salary',
    'schedule_interviews',
    'view_employees',
    'create_employees',
    'edit_employees',
    'view_employee_salary',
    'view_employee_performance',
    'manage_employee_roles',
    'view_account',
    'edit_account',
  ],

  recruiter: [
    'view_dashboard',
    'view_projects',
    'view_candidates',
    'create_candidates',
    'edit_candidates',
    'schedule_interviews',
    'view_employees',
    'view_account',
    'edit_account',
  ],

  employee: [
    'view_dashboard',
    'view_projects',
    'view_employees',
    'view_account',
    'edit_account',
  ],

  user: [
    'view_dashboard',
    'view_account',
    'edit_account',
  ],
};

export interface NavigationItem {
  title: string;
  url: string;
  icon: any;
  permission: Permission;
  description?: string;
}

export const hasPermission = (userRole: UserRole, permission: Permission): boolean => {
  return ROLE_PERMISSIONS[userRole]?.includes(permission) ?? false;
};

export const hasAnyPermission = (userRole: UserRole, permissions: Permission[]): boolean => {
  return permissions.some(permission => hasPermission(userRole, permission));
};

export const getRolePermissions = (userRole: UserRole): Permission[] => {
  return ROLE_PERMISSIONS[userRole] ?? [];
};

export const getFilteredNavigation = (userRole: UserRole, navigationItems: NavigationItem[]): NavigationItem[] => {
  return navigationItems.filter(item => hasPermission(userRole, item.permission));
};

export const ROLE_DISPLAY_INFO = {
  admin: {
    name: 'Administrator',
    description: 'Full system access with financial and management permissions',
    color: 'red',
  },
  hr_manager: {
    name: 'HR Manager',
    description: 'Human resources management without financial access',
    color: 'blue',
  },
  recruiter: {
    name: 'Recruiter',
    description: 'Focused on candidate recruitment and management',
    color: 'yellow',
  },
  employee: {
    name: 'Employee',
    description: 'Basic access to projects and employee directory',
    color: 'purple',
  },
  user: {
    name: 'User',
    description: 'Limited access for external or temporary users',
    color: 'gray',
  },
};

export const requirePermission = (userRole: UserRole | undefined, permission: Permission): boolean => {
  if (!userRole) return false;
  return hasPermission(userRole, permission);
};

export const usePermissions = (userRole: UserRole | undefined) => {
  return {
    can: (permission: Permission) => requirePermission(userRole, permission),
    canAny: (permissions: Permission[]) => userRole ? hasAnyPermission(userRole, permissions) : false,
    permissions: userRole ? getRolePermissions(userRole) : [],
  };
}; 