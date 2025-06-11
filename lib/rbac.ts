// Role-based access control system
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

// Role definitions with their permissions
export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  admin: [
    // Full access to everything
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
    // HR management with limited financial access
    'view_dashboard',
    'view_analytics',
    'view_clients', // Can see clients but not financials
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
    // Focused on recruitment activities
    'view_dashboard',
    'view_projects', // Read-only project access
    'view_candidates',
    'create_candidates',
    'edit_candidates',
    'schedule_interviews',
    'view_employees', // Limited employee view
    'view_account',
    'edit_account',
  ],
  
  employee: [
    // Basic employee access
    'view_dashboard',
    'view_projects', // Can see projects they're assigned to
    'view_employees', // Limited view of colleagues
    'view_account',
    'edit_account',
  ],
  
  user: [
    // Minimal access - similar to current 'user' role
    'view_dashboard',
    'view_account',
    'edit_account',
  ],
};

// Navigation items with required permissions
export interface NavigationItem {
  title: string;
  url: string;
  icon: any;
  permission: Permission;
  description?: string;
}

// Check if user has specific permission
export const hasPermission = (userRole: UserRole, permission: Permission): boolean => {
  return ROLE_PERMISSIONS[userRole]?.includes(permission) ?? false;
};

// Check if user has any of the specified permissions
export const hasAnyPermission = (userRole: UserRole, permissions: Permission[]): boolean => {
  return permissions.some(permission => hasPermission(userRole, permission));
};

// Get all permissions for a role
export const getRolePermissions = (userRole: UserRole): Permission[] => {
  return ROLE_PERMISSIONS[userRole] ?? [];
};

// Filter navigation items based on user permissions
export const getFilteredNavigation = (userRole: UserRole, navigationItems: NavigationItem[]): NavigationItem[] => {
  return navigationItems.filter(item => hasPermission(userRole, item.permission));
};

// Role display names and descriptions
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

// Middleware helper to check permissions
export const requirePermission = (userRole: UserRole | undefined, permission: Permission): boolean => {
  if (!userRole) return false;
  return hasPermission(userRole, permission);
};

// Hook-friendly permission checker
export const usePermissions = (userRole: UserRole | undefined) => {
  return {
    can: (permission: Permission) => requirePermission(userRole, permission),
    canAny: (permissions: Permission[]) => userRole ? hasAnyPermission(userRole, permissions) : false,
    permissions: userRole ? getRolePermissions(userRole) : [],
  };
}; 