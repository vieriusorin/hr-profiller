import { useState, useCallback } from 'react';
import { useOpportunityFilters } from '@/components/opportunities/hooks/useOpportunityFilters';
import { useInfiniteOpportunities, useCreateOpportunity, useUpdateOpportunity } from '@/lib/hooks/use-opportunities';
import { useCreateRole, useUpdateRole } from '@/lib/hooks/use-roles';
import {
  type Opportunity,
  type OpportunityFilters,
} from '@/lib/types';
import { type UseDashboardReturn } from '../types';
import { toast } from 'react-hot-toast';
import type { CreateRole, UpdateRole, CreateOpportunity } from '@/lib/api-client';
import type { CreateOpportunityForm } from '@/lib/types';

export const useDashboard = (): UseDashboardReturn => {
  const [showNewOpportunityDialog, setShowNewOpportunityDialog] = useState(false);
  const [showNewRoleDialog, setShowNewRoleDialog] = useState(false);
  const [selectedOpportunityId, setSelectedOpportunityId] = useState<string | null>(null);

  const { filters } = useOpportunityFilters();
  const apiFilters = {
    client: filters.client || undefined,
    grades: filters.grades.length > 0 ? filters.grades.join(',') : undefined,
    needsHire: filters.needsHire === 'all' ? undefined : filters.needsHire,
    probability:
      filters.probability[0] !== 0 || filters.probability[1] !== 100
        ? `${filters.probability[0]}-${filters.probability[1]}`
        : undefined,
  };

  const inProgressQuery = useInfiniteOpportunities({
    status: 'In Progress',
    ...apiFilters,
  });

  const onHoldQuery = useInfiniteOpportunities({
    status: 'On Hold',
    ...apiFilters,
  });

  const completedQuery = useInfiniteOpportunities({
    status: 'Done',
    ...apiFilters,
  });

  const inProgressOpportunities = inProgressQuery.data?.pages.flatMap(page => page.data) ?? [];
  const onHoldOpportunities = onHoldQuery.data?.pages.flatMap(page => page.data) ?? [];
  const completedOpportunities = completedQuery.data?.pages.flatMap(page => page.data) ?? [];

  const createOpportunityMutation = useCreateOpportunity();
  const updateOpportunityMutation = useUpdateOpportunity();
  const createRoleMutation = useCreateRole();
  const updateRoleMutation = useUpdateRole();

  const isLoading = inProgressQuery.isLoading || onHoldQuery.isLoading || completedQuery.isLoading;
  const isRefetching = inProgressQuery.isFetching || onHoldQuery.isFetching || completedQuery.isFetching;
  const error = inProgressQuery.error || onHoldQuery.error || completedQuery.error;

  const handleAddRole = useCallback((opportunityId: string) => {
    setSelectedOpportunityId(opportunityId);
    setShowNewRoleDialog(true);
  }, []);

  const handleCreateRole = useCallback(async (roleData: UpdateRole) => {
    if (!roleData || !selectedOpportunityId) return;

    try {
      const loadingToast = toast.loading('Creating role...');

      const opportunity = inProgressOpportunities.find((opp: Opportunity) => opp.id === selectedOpportunityId);
      if (!opportunity) {
        toast.error('Opportunity not found');
        return;
      }

      const createRoleData: CreateRole = {
        ...roleData,
        opportunityId: selectedOpportunityId,
        roleName: roleData.roleName || 'Untitled Role',
        status: roleData.status || 'Open'
      };

      await createRoleMutation.mutateAsync(createRoleData);

      toast.dismiss(loadingToast);
      toast.success(`Role "${createRoleData.roleName}" created successfully!`);
      setShowNewRoleDialog(false);
      setSelectedOpportunityId(null);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create role';
      toast.error(`Failed to create role: ${errorMessage}`);
      console.error('Failed to create role:', error);
    }
  }, [inProgressOpportunities, selectedOpportunityId, createRoleMutation]);

  const handleUpdateRole = useCallback(async (opportunityId: string, roleId: string, status: string) => {
    try {
      const opportunity = inProgressOpportunities.find((opp: Opportunity) => opp.id === opportunityId);
      if (!opportunity) {
        toast.error('Opportunity not found');
        return;
      }

      const roleName = 'Role';

      await updateRoleMutation.mutateAsync({
        id: roleId,
        data: { status: status as any }
      });

      toast.success(`${roleName} status updated to ${status}`);

      // TODO: Add logic to automatically move opportunity to completed
      // when all roles are in final states (Won, Lost, Staffed)
      // This would require fetching roles separately via the roles API
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update role status';
      toast.error(`Failed to update role status: ${errorMessage}`);
      console.error('Failed to update role status:', error);
    }
  }, [inProgressOpportunities, updateRoleMutation]);


  const handleCreateOpportunity = useCallback(async (opportunityData: CreateOpportunityForm): Promise<Opportunity> => {
    const loadingToast = toast.loading('Creating opportunity...');

    try {
      const createData: CreateOpportunity = {
        opportunityName: opportunityData.opportunityName,
        clientName: opportunityData.clientName,
        expectedStartDate: opportunityData.expectedStartDate || null,
        expectedEndDate: opportunityData.expectedEndDate || null,
        probability: opportunityData.probability || null,
        status: opportunityData.status || 'In Progress',
        comment: opportunityData.comment || null
      };

      const response = await createOpportunityMutation.mutateAsync(createData);

      toast.dismiss(loadingToast);
      toast.success(`Opportunity "${opportunityData.opportunityName}" created successfully!`);
      setShowNewOpportunityDialog(false);

      return response.data;
    } catch (error: unknown) {
      toast.dismiss(loadingToast);
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      toast.error(`Failed to create opportunity: ${errorMessage}`);
      throw error;
    }
  }, [createOpportunityMutation]);

  const handleMoveToHold = useCallback(async (opportunityId: string) => {
    const opportunity = inProgressOpportunities.find((opp: Opportunity) => opp.id === opportunityId);
    if (!opportunity) return;

    const loadingToast = toast.loading('Moving to hold...');

    try {
      const updateData: any = {
        status: 'On Hold'
      };

      await updateOpportunityMutation.mutateAsync({
        id: opportunityId,
        data: updateData
      });

      toast.dismiss(loadingToast);
      toast.success(`"${opportunity.opportunityName}" moved to hold`);
    } catch (error: unknown) {
      toast.dismiss(loadingToast);
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      toast.error(`Failed to move opportunity: ${errorMessage}`);
    }
  }, [inProgressOpportunities, updateOpportunityMutation]);

  // Handle moving opportunity to in progress
  const handleMoveToInProgress = useCallback(async (opportunityId: string) => {
    const opportunity = onHoldOpportunities.find((opp: Opportunity) => opp.id === opportunityId);
    if (!opportunity) return;

    const loadingToast = toast.loading('Moving to in progress...');

    try {
      const updateData: any = {
        status: 'In Progress'
      };

      await updateOpportunityMutation.mutateAsync({
        id: opportunityId,
        data: updateData
      });

      toast.dismiss(loadingToast);
      toast.success(`"${opportunity.opportunityName}" moved back to in progress`);
    } catch (error: unknown) {
      toast.dismiss(loadingToast);
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      toast.error(`Failed to move opportunity: ${errorMessage}`);
    }
  }, [onHoldOpportunities, updateOpportunityMutation]);

  const handleMoveToCompleted = useCallback(async (opportunityId: string) => {
    const opportunity = inProgressOpportunities.find((opp: Opportunity) => opp.id === opportunityId) ||
      onHoldOpportunities.find((opp: Opportunity) => opp.id === opportunityId);
    if (!opportunity) return;

    const loadingToast = toast.loading('Moving to completed...');

    try {
      const updateData: any = {
        status: 'Done'
      };

      await updateOpportunityMutation.mutateAsync({
        id: opportunityId,
        data: updateData
      });

      toast.dismiss(loadingToast);
      toast.success(`"${opportunity.opportunityName}" moved to completed`);
    } catch (error: unknown) {
      toast.dismiss(loadingToast);
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      toast.error(`Failed to move opportunity: ${errorMessage}`);
    }
  }, [inProgressOpportunities, onHoldOpportunities, updateOpportunityMutation]);

  const openNewOpportunityDialog = useCallback(() => setShowNewOpportunityDialog(true), []);
  const closeNewOpportunityDialog = useCallback(() => setShowNewOpportunityDialog(false), []);
  const closeNewRoleDialogAndReset = useCallback(() => {
    setShowNewRoleDialog(false);
    setSelectedOpportunityId(null);
  }, []);

  // Filter opportunities function
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const filterOpportunities = useCallback((opportunities: Opportunity[], filters: OpportunityFilters): Opportunity[] => {
    // This function is no longer used by the new pagination logic but keeping for interface compatibility
    return opportunities;
  }, []);

  return {
    opportunities: inProgressOpportunities,
    onHoldOpportunities,
    completedOpportunities,
    filterOpportunities,
    filters,
    loading: isLoading,
    isRefetching,
    error,
    showNewOpportunityDialog,
    showNewRoleDialog,
    selectedOpportunityId,
    isAddingRole: createRoleMutation.isPending,
    handleCreateRole,
    handleCreateOpportunity,
    openNewOpportunityDialog,
    closeNewOpportunityDialog,
    closeNewRoleDialog: closeNewRoleDialogAndReset,
    closeNewRoleDialogAndReset,
    handleAddRole,
    handleUpdateRole,
    handleMoveToHold,
    handleMoveToInProgress,
    handleMoveToCompleted,

    // In Progress
    fetchNextPageInProgress: inProgressQuery.fetchNextPage,
    hasNextPageInProgress: inProgressQuery.hasNextPage,
    isFetchingNextPageInProgress: inProgressQuery.isFetchingNextPage,

    // On Hold
    fetchNextPageOnHold: onHoldQuery.fetchNextPage,
    hasNextPageOnHold: onHoldQuery.hasNextPage,
    isFetchingNextPageOnHold: onHoldQuery.isFetchingNextPage,

    // Completed
    fetchNextPageCompleted: completedQuery.fetchNextPage,
    hasNextPageCompleted: completedQuery.hasNextPage,
    isFetchingNextPageCompleted: completedQuery.isFetchingNextPage,
  };
}; 
