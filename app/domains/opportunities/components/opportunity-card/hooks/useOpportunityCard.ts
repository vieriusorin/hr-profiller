import { useState } from 'react';
import { UseOpportunityCardProps, UseOpportunityCardReturn } from '../types';

export const useOpportunityCard = ({
  opportunityId,
  onAddRole,
  onMoveToHold,
  onMoveToInProgress,
}: UseOpportunityCardProps): UseOpportunityCardReturn => {
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  const handleAddRole = () => {
    onAddRole?.(opportunityId);
  };

  const handleMoveToHold = () => {
    onMoveToHold?.(opportunityId);
  };

  const handleMoveToInProgress = () => {
    onMoveToInProgress?.(opportunityId);
  };

  return {
    isExpanded,
    toggleExpanded,
    handleAddRole,
    handleMoveToHold,
    handleMoveToInProgress,
  };
}; 