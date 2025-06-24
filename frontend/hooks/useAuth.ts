import { useSession } from 'next-auth/react';
import { ExtendedSession, ExtendedUser, UserRole } from '@/types/auth';

export const useAuth = () => {
  const { data: session, status, update } = useSession();
  
  // Type-safe session data
  const typedSession = session as ExtendedSession | null;
  const user = typedSession?.user as ExtendedUser | undefined;
  
  // Authentication state
  const isAuthenticated = status === 'authenticated' && !!user;
  const isLoading = status === 'loading';
  const isUnauthenticated = status === 'unauthenticated';
  
  // User role utilities
  const hasRole = (role: UserRole): boolean => {
    return user?.role === role;
  };
  
  const hasAnyRole = (roles: UserRole[]): boolean => {
    return roles.some(role => hasRole(role));
  };
  
  // Permission checks
  const isAdmin = hasRole('hr_manager'); // Assuming hr_manager is admin role
  const isEmployee = hasRole('employee');
  const isExecutive = hasRole('executive');
  const isRecruiter = hasRole('recruiter');
  const isTeamLead = hasRole('team_lead');
  
  // Backend token for API calls
  const backendToken = typedSession?.backendToken;
  
  return {
    // Session data
    session: typedSession,
    user,
    status,
    
    // Authentication state
    isAuthenticated,
    isLoading,
    isUnauthenticated,
    
    // Role utilities
    hasRole,
    hasAnyRole,
    
    // Permission checks
    isAdmin,
    isEmployee,
    isExecutive,
    isRecruiter,
    isTeamLead,
    
    // Backend integration
    backendToken,
    
    // Session management
    updateSession: update,
  };
};

// Type guard for components
export const requireAuth = (user: ExtendedUser | undefined): user is ExtendedUser => {
  return !!user && user.isActive;
};

// HOC for protecting routes
export const withAuth = <P extends object>(
  Component: React.ComponentType<P>,
  requiredRoles?: UserRole[]
) => {
  return function AuthenticatedComponent(props: P) {
    const { isAuthenticated, hasAnyRole, user } = useAuth();
    
    if (!isAuthenticated || !requireAuth(user)) {
      return <div>Access denied. Please log in.</div>;
    }
    
    if (requiredRoles && !hasAnyRole(requiredRoles)) {
      return <div>Access denied. Insufficient permissions.</div>;
    }
    
    return <Component {...props} />;
  };
}; 