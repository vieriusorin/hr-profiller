import { OpportunityActionCallbacks } from '@/components/opportunities/types';
import { useQuery } from '@tanstack/react-query';
import React, { useContext } from 'react';
import {
  getStartDateUrgency,
  getUrgencyConfig,
  getUrgencyTooltip,
} from '@/shared/lib/helpers/date-urgency';
import { OpportunitiesContext } from '@/components/opportunities/components/opportunities-table/opportunities-table';
import { Employee } from '@/shared/types/employees';
import { FlattenedRow } from '@/components/opportunities/components/opportunities-table/types';

const fetchEmployees = async (): Promise<Employee[]> => {
  const res = await fetch('/api/employees');
  if (!res.ok) {
    throw new Error('Failed to fetch employees');
  }
  return res.json();
};

export const useOpportunitiesTableRow = (
  row: FlattenedRow,
  callbacks: OpportunityActionCallbacks
) => {
  const {
    onAddRole,
    onUpdateRole,
    onMoveToHold,
    onMoveToInProgress,
    onMoveToCompleted,
  } = callbacks;

  const { opportunities } = useContext(OpportunitiesContext) || {
    opportunities: [],
  };
  const fullOpportunity = opportunities.find(
    (opp) => opp.id === row.opportunityId
  );

  const { data: employees = [] } = useQuery<Employee[]>({
    queryKey: ['employees'],
    queryFn: fetchEmployees,
  });

  const urgency = getStartDateUrgency(row.expectedStartDate);
  const urgencyConfig = getUrgencyConfig(urgency);
  const tooltip = getUrgencyTooltip(row.expectedStartDate);

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
    fullOpportunity,
    employees,
    urgencyConfig,
    tooltip,
  } as const;
}; 