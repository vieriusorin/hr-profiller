import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { UserRole } from '@/types/auth';

const UserProfile: React.FC = () => {
  const { 
    user, 
    isAuthenticated, 
    isLoading, 
    hasRole, 
    isAdmin, 
    isEmployee,
    backendToken 
  } = useAuth();

  if (isLoading) {
    return <div className='p-4'>Loading user profile...</div>;
  }

  if (!isAuthenticated || !user) {
    return <div className='p-4'>Please log in to view your profile.</div>;
  }

  return (
    <div className='max-w-md mx-auto bg-white rounded-lg shadow-md p-6'>
      <div className='flex items-center space-x-4'>
        <div className='w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold'>
          {user.name.charAt(0).toUpperCase()}
        </div>
        <div>
          <h2 className='text-xl font-semibold text-gray-900'>{user.name}</h2>
          <p className='text-gray-600'>{user.email}</p>
        </div>
      </div>
      
      <div className='mt-6 space-y-3'>
        <div className='flex justify-between'>
          <span className='text-gray-600'>User ID:</span>
          <span className='font-mono text-sm text-gray-900'>{user.id}</span>
        </div>
        
        <div className='flex justify-between'>
          <span className='text-gray-600'>Role:</span>
          <span className={`px-2 py-1 rounded text-sm font-medium ${
            isAdmin ? 'bg-red-100 text-red-800' :
            isEmployee ? 'bg-blue-100 text-blue-800' :
            'bg-gray-100 text-gray-800'
          }`}>
            {user.role}
          </span>
        </div>
        
        <div className='flex justify-between'>
          <span className='text-gray-600'>Status:</span>
          <span className={`px-2 py-1 rounded text-sm font-medium ${
            user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}>
            {user.isActive ? 'Active' : 'Inactive'}
          </span>
        </div>
        
        {user.createdAt && (
          <div className='flex justify-between'>
            <span className='text-gray-600'>Member since:</span>
            <span className='text-gray-900'>
              {new Date(user.createdAt).toLocaleDateString()}
            </span>
          </div>
        )}
      </div>
      
      {/* Role-based content */}
      <div className='mt-6 pt-6 border-t border-gray-200'>
        <h3 className='text-lg font-medium text-gray-900 mb-3'>Permissions</h3>
        <div className='space-y-2'>
          {hasRole('hr_manager' as UserRole) && (
            <div className='flex items-center text-green-600'>
              <svg className='w-4 h-4 mr-2' fill='currentColor' viewBox='0 0 20 20'>
                <path fillRule='evenodd' d='M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z' clipRule='evenodd' />
              </svg>
              HR Management Access
            </div>
          )}
          
          {hasRole('executive' as UserRole) && (
            <div className='flex items-center text-purple-600'>
              <svg className='w-4 h-4 mr-2' fill='currentColor' viewBox='0 0 20 20'>
                <path fillRule='evenodd' d='M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z' clipRule='evenodd' />
              </svg>
              Executive Dashboard Access
            </div>
          )}
          
          {hasRole('recruiter' as UserRole) && (
            <div className='flex items-center text-blue-600'>
              <svg className='w-4 h-4 mr-2' fill='currentColor' viewBox='0 0 20 20'>
                <path fillRule='evenodd' d='M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z' clipRule='evenodd' />
              </svg>
              Recruitment Tools Access
            </div>
          )}
          
          <div className='flex items-center text-gray-600'>
            <svg className='w-4 h-4 mr-2' fill='currentColor' viewBox='0 0 20 20'>
              <path fillRule='evenodd' d='M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z' clipRule='evenodd' />
            </svg>
            Basic Employee Access
          </div>
        </div>
      </div>
      
      {/* Debug info in development */}
      {process.env.NODE_ENV === 'development' && (
        <div className='mt-6 pt-6 border-t border-gray-200'>
          <h3 className='text-sm font-medium text-gray-500 mb-2'>Debug Info</h3>
          <div className='text-xs text-gray-400 space-y-1'>
            <div>Backend Token: {backendToken ? '✓ Available' : '✗ Missing'}</div>
            <div>Updated: {user.updatedAt ? new Date(user.updatedAt).toLocaleString() : 'N/A'}</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserProfile; 