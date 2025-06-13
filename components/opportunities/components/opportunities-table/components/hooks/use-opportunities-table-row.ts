import React from 'react';
import { UseOpportunitiesTableRowCallbacks } from '../types';
import { Role } from '@/shared/types';


export const useOpportunitiesTableRow = (callbacks: UseOpportunitiesTableRowCallbacks) => {
  const { onAddRole, onUpdateRole, onMoveToHold, onMoveToInProgress, onMoveToCompleted } = callbacks;

  const handleAddRole = React.useCallback((opportunityId: string) => {
    onAddRole?.(opportunityId);
  }, [onAddRole]);

  const handleUpdateRole = React.useCallback(
    (opportunityId: string, roleId: string, updates: string) => {
      onUpdateRole?.(opportunityId, roleId, updates);
    },
    [onUpdateRole]
  );

  const handleMoveToHold = React.useCallback(
    (opportunityId: string) => {
      onMoveToHold?.(opportunityId);
    },
    [onMoveToHold]
  );

  const handleMoveToInProgress = React.useCallback(
    (opportunityId: string) => {
      onMoveToInProgress?.(opportunityId);
    },
    [onMoveToInProgress]
  );

  const handleMoveToCompleted = React.useCallback(
    (opportunityId: string) => {
      onMoveToCompleted?.(opportunityId);
    },
    [onMoveToCompleted]
  );

  return {
    handleAddRole,
    handleUpdateRole,
    handleMoveToHold,
    handleMoveToInProgress,
    handleMoveToCompleted,
  } as const;
};
