import { useState } from 'react';
import { getStartDateUrgency, getUrgencyConfig, getUrgencyTooltip } from '@/shared/lib/helpers/date-urgency';
import { FlattenedRow } from '../types';

export const useOpportunityRow = (row: FlattenedRow) => {
  const [isEditOpportunityModalOpen, setIsEditOpportunityModalOpen] = useState(false);
  
  const urgency = getStartDateUrgency(row.expectedStartDate);
  const urgencyConfig = getUrgencyConfig(urgency);
  const tooltip = getUrgencyTooltip(row.expectedStartDate);

  return {
    isEditOpportunityModalOpen,
    setIsEditOpportunityModalOpen,
    urgencyConfig,
    tooltip
  };
}; 