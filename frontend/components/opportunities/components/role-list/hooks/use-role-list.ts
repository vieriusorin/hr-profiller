import { useState } from 'react';
import { Role } from '@/shared/types';

export const useRoleList = () => {
      const [selectedRole, setSelectedRole] = useState<Role | null>(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    const handleRoleClick = (role: Role) => {
        setSelectedRole(role);
        setIsEditModalOpen(true);
    };

    return {
        selectedRole,
        setSelectedRole,
        isEditModalOpen,
        setIsEditModalOpen,
        handleRoleClick,
    }
}