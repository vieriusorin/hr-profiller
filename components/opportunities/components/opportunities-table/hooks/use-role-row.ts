import { useState } from 'react';
import { getStartDateUrgency, getUrgencyConfig } from '@/shared/lib/helpers/date-urgency';
import { FlattenedRow } from '../types';

export const useRoleRow = (row: FlattenedRow) => {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  
  const urgency = getStartDateUrgency(row.expectedStartDate);
  const urgencyConfig = getUrgencyConfig(urgency);

  const handleRoleNameClick = () => {
    setIsEditModalOpen(true);
  };

  return {
    isEditModalOpen,
    setIsEditModalOpen,
    urgencyConfig,
    handleRoleNameClick
  };
}; 