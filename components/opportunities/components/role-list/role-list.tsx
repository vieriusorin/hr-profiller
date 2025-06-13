'use client';


import { EditRoleModal } from '../modals/edit-role-modal';
import { useRoleList } from './hooks/use-role-list';
import { RoleListProps } from './types';

export const RoleList = ({ roles, opportunityId }: RoleListProps) => {
const {
  selectedRole,
  setSelectedRole,
  isEditModalOpen,
  setIsEditModalOpen,
  handleRoleClick,
} = useRoleList()

  return (
    <div className='space-y-4'>
      {roles.map((role) => (
        <div
          key={role.id}
          className='p-4 border rounded-lg cursor-pointer hover:bg-gray-50'
          onClick={() => handleRoleClick(role)}
        >
          <div className='flex justify-between items-start'>
            <div>
              <h3 className='font-medium'>{role.roleName}</h3>
              <p className='text-sm text-gray-500'>Grade: {role.requiredGrade}</p>
              <p className='text-sm text-gray-500'>Allocation: {role.allocation}%</p>
              {role.comments && (
                <p className='text-sm text-gray-500 mt-2'>{role.comments}</p>
              )}
            </div>
            <span className={`px-2 py-1 text-xs rounded-full ${
              role.status === 'Open' ? 'bg-yellow-100 text-yellow-800' :
              role.status === 'Staffed' ? 'bg-green-100 text-green-800' :
              role.status === 'Won' ? 'bg-blue-100 text-blue-800' :
              'bg-red-100 text-red-800'
            }`}>
              {role.status}
            </span>
          </div>
        </div>
      ))}

      {selectedRole && (
        <EditRoleModal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setSelectedRole(null);
          }}
          opportunityId={opportunityId}
          role={selectedRole}
        />
      )}
    </div>
  );
}; 