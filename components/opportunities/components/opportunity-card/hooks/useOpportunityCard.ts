import { useState, useCallback } from 'react';
import { UseOpportunityCardProps, UseOpportunityCardReturn } from '../types';

export const useOpportunityCard = ({
  opportunityId,
  onAddRole,
  onMoveToHold,
  onMoveToInProgress,
  onMoveToCompleted,
}: UseOpportunityCardProps): UseOpportunityCardReturn => {
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleExpanded = useCallback(() => {
    setIsExpanded(!isExpanded);
  }, [isExpanded]);

  const handleAddRole = useCallback(() => {
    onAddRole?.(opportunityId);
  }, [onAddRole, opportunityId]);

  const handleMoveToHold = useCallback(() => {
    onMoveToHold?.(opportunityId);
  }, [onMoveToHold, opportunityId]);

  const handleMoveToInProgress = useCallback(() => {
    onMoveToInProgress?.(opportunityId);
  }, [onMoveToInProgress, opportunityId]);

  const handleMoveToCompleted = useCallback(() => {
    onMoveToCompleted?.(opportunityId);
  }, [onMoveToCompleted, opportunityId]);

  return {
    isExpanded,
    toggleExpanded,
    handleAddRole,
    handleMoveToHold,
    handleMoveToInProgress,
    handleMoveToCompleted,
  };
}; 
