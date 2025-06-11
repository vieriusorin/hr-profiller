'use client';

import { useSession } from 'next-auth/react';
import { ReactNode } from 'react';
import { Permission, requirePermission, hasAnyPermission, UserRole } from '@/lib/rbac';
import { AlertTriangle, Shield } from 'lucide-react';

interface PermissionGuardProps {
  permission?: Permission;
  permissions?: Permission[];
  fallback?: ReactNode;
  showFallbackMessage?: boolean;
  requireAll?: boolean; // For multiple permissions, require all (AND) or any (OR)
  children: ReactNode;
}

export const PermissionGuard = ({
  permission,
  permissions = [],
  fallback,
  showFallbackMessage = false,
  requireAll = false,
  children,
}: PermissionGuardProps) => {
  const { data: session } = useSession();
  const userRole = (session?.user as any)?.role as UserRole;

  // Determine which permissions to check
  const permissionsToCheck = permission ? [permission] : permissions;

  if (permissionsToCheck.length === 0) {
    return <>{children}</>;
  }

  // Check permissions based on requireAll flag
  const hasAccess = requireAll
    ? permissionsToCheck.every(p => requirePermission(userRole, p))
    : hasAnyPermission(userRole || 'user', permissionsToCheck);

  if (hasAccess) {
    return <>{children}</>;
  }

  // Return fallback or default message
  if (fallback) {
    return <>{fallback}</>;
  }

  if (showFallbackMessage) {
    return (
      <div className='flex items-center gap-2 p-4 bg-gray-50 border border-gray-200 rounded-lg'>
        <Shield className='w-5 h-5 text-gray-400' />
        <div className='flex flex-col'>
          <p className='text-sm font-medium text-gray-600'>Access Restricted</p>
          <p className='text-xs text-gray-500'>
            You don't have permission to view this content.
          </p>
        </div>
      </div>
    );
  }

  return null;
};

// Hook for checking permissions in components
export const usePermissions = () => {
  const { data: session } = useSession();
  const userRole = (session?.user as any)?.role as UserRole;

  return {
    can: (permission: Permission) => requirePermission(userRole, permission),
    canAny: (permissions: Permission[]) => hasAnyPermission(userRole || 'user', permissions),
    canAll: (permissions: Permission[]) => permissions.every(p => requirePermission(userRole, p)),
    role: userRole,
    isAdmin: userRole === 'admin',
    isHRManager: userRole === 'hr_manager',
    isRecruiter: userRole === 'recruiter',
    isEmployee: userRole === 'employee',
    isUser: userRole === 'user',
  };
};

// Role indicator component
interface RoleIndicatorProps {
  role: UserRole;
  showDescription?: boolean;
  className?: string;
}

export const RoleIndicator = ({ role, showDescription = false, className = '' }: RoleIndicatorProps) => {
  const roleInfo = {
    admin: { name: 'Admin', color: 'bg-red-100 text-red-800', icon: Shield },
    hr_manager: { name: 'HR Manager', color: 'bg-blue-100 text-blue-800', icon: Shield },
    recruiter: { name: 'Recruiter', color: 'bg-yellow-100 text-yellow-800', icon: Shield },
    employee: { name: 'Employee', color: 'bg-purple-100 text-purple-800', icon: Shield },
    user: { name: 'User', color: 'bg-gray-100 text-gray-800', icon: Shield },
  }[role];

  if (!roleInfo) return null;

  const Icon = roleInfo.icon;

  return (
    <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${roleInfo.color} ${className}`}>
      <Icon className='w-3 h-3' />
      <span>{roleInfo.name}</span>
      {showDescription && (
        <span className='ml-1 opacity-75'>
          {role === 'admin' && '• Full Access'}
          {role === 'hr_manager' && '• HR Management'}
          {role === 'recruiter' && '• Recruitment Focus'}
          {role === 'employee' && '• Basic Access'}
          {role === 'user' && '• Limited Access'}
        </span>
      )}
    </div>
  );
}; 
