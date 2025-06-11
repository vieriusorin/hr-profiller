import React from 'react';

interface UseOpportunitiesTableRowCallbacks {
  onAddRole?: (opportunityId: string) => void;
  onUpdateRole?: (opportunityId: string, roleId: string, status: string) => void;
  onMoveToHold?: (opportunityId: string) => void;
  onMoveToInProgress?: (opportunityId: string) => void;
  onMoveToCompleted?: (opportunityId: string) => void;
}

export const useOpportunitiesTableRow = (callbacks: UseOpportunitiesTableRowCallbacks) => {
  const { onAddRole, onUpdateRole, onMoveToHold, onMoveToInProgress, onMoveToCompleted } = callbacks;

  const handleAddRole = React.useCallback((opportunityId: string) => {
    onAddRole?.(opportunityId);
  }, [onAddRole]);

  const handleUpdateRole = React.useCallback(
    (opportunityId: string, roleId: string, status: string) => {
      onUpdateRole?.(opportunityId, roleId, status);
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
