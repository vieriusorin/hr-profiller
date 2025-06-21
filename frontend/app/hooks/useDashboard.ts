import { useState, useCallback } from 'react';
import { useOpportunityFilters } from '@/components/opportunities/hooks/useOpportunityFilters';
import { useOpportunities } from '@/lib/hooks/use-opportunities';
import { useCreateOpportunity, useUpdateOpportunity } from '@/lib/hooks/use-opportunities';
import { useCreateRole, useUpdateRole } from '@/lib/hooks/use-roles';
import {
  type Opportunity,
  type OpportunityFilters,
} from '@/lib/types';
import { type UseDashboardReturn } from '../types';
import { toast } from 'react-hot-toast';
import type { CreateRole } from '@/lib/api-client';

export const useDashboard = (): UseDashboardReturn => {
  // Local state for dialogs
  const [showNewOpportunityDialog, setShowNewOpportunityDialog] = useState(false);
  const [showNewRoleDialog, setShowNewRoleDialog] = useState(false);
  const [selectedOpportunityId, setSelectedOpportunityId] = useState<string | null>(null);

  const { filters } = useOpportunityFilters();

  // Convert filters to API parameters
  const apiFilters = {
    client: filters.client || undefined,
    grades: filters.grades.length > 0 ? filters.grades.join(',') : undefined,
    needsHire: filters.needsHire === 'all' ? undefined : filters.needsHire,
    probability:
      filters.probability[0] !== 0 || filters.probability[1] !== 100
        ? `${filters.probability[0]}-${filters.probability[1]}`
        : undefined,
  };

  console.log('useDashboard - filters:', filters);
  console.log('useDashboard - apiFilters:', apiFilters);

  // TEMPORARY: Use regular queries instead of infinite queries to test
  const inProgressQuery = useOpportunities({
    status: 'In Progress',
    limit: 50, // Get more results
    ...apiFilters,
  });

  const onHoldQuery = useOpportunities({
    status: 'On Hold',
    limit: 50,
    ...apiFilters,
  });

  const completedQuery = useOpportunities({
    status: 'Done',
    limit: 50,
    ...apiFilters,
  });

  // Extract opportunities from regular query responses
  const inProgressOpportunities = inProgressQuery.data?.data ?? [];
  const onHoldOpportunities = onHoldQuery.data?.data ?? [];
  const completedOpportunities = completedQuery.data?.data ?? [];

  console.log('useDashboard - inProgressOpportunities:', inProgressOpportunities);
  console.log('useDashboard - onHoldOpportunities:', onHoldOpportunities);
  console.log('useDashboard - completedOpportunities:', completedOpportunities);

  // Mutations
  const createOpportunityMutation = useCreateOpportunity();
  const updateOpportunityMutation = useUpdateOpportunity();
  const createRoleMutation = useCreateRole();
  const updateRoleMutation = useUpdateRole();

  // Loading and error states
  const isLoading = inProgressQuery.isLoading || onHoldQuery.isLoading || completedQuery.isLoading;
  const isRefetching = inProgressQuery.isFetching || onHoldQuery.isFetching || completedQuery.isFetching;
  const error = inProgressQuery.error || onHoldQuery.error || completedQuery.error;

  // Handle adding a role to an opportunity
  const handleAddRole = useCallback((opportunityId: string) => {
    setSelectedOpportunityId(opportunityId);
    setShowNewRoleDialog(true);
  }, []);

  // Handle creating a new role
  const handleCreateRole = useCallback(async (roleData: CreateRole) => {
    if (!roleData || !selectedOpportunityId) return;

    try {
      const loadingToast = toast.loading('Creating role...');

      // Ensure the opportunity exists
      const opportunity = inProgressOpportunities.find((opp: Opportunity) => opp.id === selectedOpportunityId);
      if (!opportunity) {
        toast.error('Opportunity not found');
        return;
      }

      await createRoleMutation.mutateAsync({
        ...roleData,
        opportunityId: selectedOpportunityId
      });

      toast.dismiss(loadingToast);
      toast.success(`Role "${roleData.roleName}" created successfully!`);
      setShowNewRoleDialog(false);
      setSelectedOpportunityId(null);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create role';
      toast.error(`Failed to create role: ${errorMessage}`);
      console.error('Failed to create role:', error);
    }
  }, [inProgressOpportunities, selectedOpportunityId, createRoleMutation]);

  // Handle updating a role status
  const handleUpdateRole = useCallback(async (opportunityId: string, roleId: string, status: string) => {
    try {
      const opportunity = inProgressOpportunities.find((opp: Opportunity) => opp.id === opportunityId);
      if (!opportunity) {
        toast.error('Opportunity not found');
        return;
      }

      // We don't have role details in the opportunity object, so we'll use a generic name
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

  // Handle creating a new opportunity
  const handleCreateOpportunity = useCallback(async (opportunityData: Opportunity): Promise<Opportunity> => {
    const loadingToast = toast.loading('Creating opportunity...');

    try {
      // Transform the data to match CreateOpportunity schema
      const createData: any = { // Changed from CreateOpportunity to any as CreateOpportunity is removed
        opportunityName: opportunityData.opportunityName,
        clientName: opportunityData.clientName || '',
        expectedStartDate: opportunityData.expectedStartDate || null,
        expectedEndDate: opportunityData.expectedEndDate || null,
        probability: opportunityData.probability || null,
        status: opportunityData.status,
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

  // Handle moving opportunity to hold
  const handleMoveToHold = useCallback(async (opportunityId: string) => {
    const opportunity = inProgressOpportunities.find((opp: Opportunity) => opp.id === opportunityId);
    if (!opportunity) return;

    const loadingToast = toast.loading('Moving to hold...');

    try {
      const updateData: any = { // Changed from UpdateOpportunity to any as UpdateOpportunity is removed
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
      const updateData: any = { // Changed from UpdateOpportunity to any as UpdateOpportunity is removed
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

  // Handle moving opportunity to completed
  const handleMoveToCompleted = useCallback(async (opportunityId: string) => {
    const opportunity = inProgressOpportunities.find((opp: Opportunity) => opp.id === opportunityId) ||
      onHoldOpportunities.find((opp: Opportunity) => opp.id === opportunityId);
    if (!opportunity) return;

    const loadingToast = toast.loading('Moving to completed...');

    try {
      const updateData: any = { // Changed from UpdateOpportunity to any as UpdateOpportunity is removed
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

  // Dialog handlers
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
    // Data
    opportunities: inProgressOpportunities,
    onHoldOpportunities,
    completedOpportunities,
    filterOpportunities,
    filters,

    // Loading states
    loading: isLoading,
    isRefetching,
    error,

    // Dialog states
    showNewOpportunityDialog,
    showNewRoleDialog,
    selectedOpportunityId,
    isAddingRole: createRoleMutation.isPending,

    // Handlers
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

    // TEMPORARY: Mock pagination for regular queries
    fetchNextPageInProgress: () => { },
    hasNextPageInProgress: false,
    isFetchingNextPageInProgress: false,
    fetchNextPageOnHold: () => { },
    hasNextPageOnHold: false,
    isFetchingNextPageOnHold: false,
    fetchNextPageCompleted: () => { },
    hasNextPageCompleted: false,
    isFetchingNextPageCompleted: false,
  };
}; 
