import { useState } from 'react';

export const useRoleCardModal = () => {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const handleRoleNameClick = () => {
    setIsEditModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsEditModalOpen(false);
  };

  return {
    isEditModalOpen,
    handleRoleNameClick,
    handleCloseModal
  };
}; 