import { useState } from 'react';
import { useOpportunities } from '@/components/opportunities/hooks/use-opportunities-query';
import { useOpportunityFilters } from '@/components/opportunities/hooks/useOpportunityFilters';
import { UseDashboardReturn } from '../types';
import type { CreateRoleForm, Opportunity } from '@/shared/types';
import toast from 'react-hot-toast';
import { Role } from '@/shared/schemas/api-schemas';

export const useDashboard = (): UseDashboardReturn => {
  const {
    opportunities,
    onHoldOpportunities,
    completedOpportunities,
    loading,
    error,
    addOpportunity,
    addRole,
    moveToOnHold,
    moveToInProgress,
    moveToCompleted,
    updateRoleStatus,
    filterOpportunities,
    isRefetching,
    isAddingRole,
    fetchNextPageInProgress,
    hasNextPageInProgress,
    isFetchingNextPageInProgress,
    fetchNextPageOnHold,
    hasNextPageOnHold,
    isFetchingNextPageOnHold,
    fetchNextPageCompleted,
    hasNextPageCompleted,
    isFetchingNextPageCompleted
  } = useOpportunities();

  const { filters } = useOpportunityFilters();

  const [showNewOpportunityDialog, setShowNewOpportunityDialog] = useState(false);
  const [showNewRoleDialog, setShowNewRoleDialog] = useState(false);
  const [selectedOpportunityId, setSelectedOpportunityId] = useState<string | null>(null);

  if (error) {
    throw error;
  }

  const handleAddRole = (opportunityId: string) => {
    setSelectedOpportunityId(opportunityId);
    setShowNewRoleDialog(true);
  };

  const handleCreateRole = async (roleData: CreateRoleForm) => {
    if (!roleData || !selectedOpportunityId) return;

    try {
      const loadingToast = toast.loading('Creating role...');

      // Ensure the opportunity object is fully populated
      const opportunity = opportunities.find((opp: Opportunity) => opp.id === selectedOpportunityId);
      if (!opportunity) {
        toast.error('Opportunity not found');
        return;
      }

      await new Promise<void>((resolve, reject) => {
        addRole(
          {
            opportunityId: selectedOpportunityId,
            roleData: {
              ...roleData,
              needsHire: roleData.needsHire
            }
          },
          {
            onSuccess: () => {
              toast.dismiss(loadingToast);
              toast.success(`Role "${roleData.roleName}" created successfully!`);
              setShowNewRoleDialog(false);
              resolve();
            },
            onError: (error: Error) => {
              toast.dismiss(loadingToast);
              toast.error(`Failed to create role: ${error.message}`);
              reject(error);
            }
          }
        );
      });
    } catch (error) {
      console.error('Failed to create role:', error);
    }
  };

  const handleUpdateRole = async (opportunityId: string, roleId: string, status: string) => {
    const opportunity = opportunities.find((opp: Opportunity) => opp.id === opportunityId) ||
      onHoldOpportunities.find((opp: Opportunity) => opp.id === opportunityId);

    if (opportunity) {
      const role = opportunity.roles.find((r: Role) => r.id === roleId);
      const roleName = role?.roleName || 'Role';

      try {
        // First, update the role status via API
        const updatedOpportunity = await updateRoleStatus(opportunityId, roleId, status);

        // Check if the opportunity should be moved to completed
        // Move to completed when all roles are in a final state (Won, Lost, or Staffed)
        const updatedRoles = updatedOpportunity.roles;
        const shouldMoveToCompleted = updatedRoles.length > 0 &&
          updatedRoles.every((role: Role) => role.status === 'Won' || role.status === 'Lost' || role.status === 'Staffed');

        if (shouldMoveToCompleted) {
          // Move to completed
          const fromStatus = opportunities.find((opp: Opportunity) => opp.id === opportunityId) ? 'in-progress' : 'on-hold';

          try {
            await moveToCompleted(opportunityId, fromStatus as 'in-progress' | 'on-hold');
            toast.success(`${roleName} status updated to ${status}. Opportunity moved to completed!`);
          } catch (error) {
            toast.success(`${roleName} status updated to ${status}`);
            toast.error('Failed to move opportunity to completed automatically');
            console.error(error)
          }
        } else {
          toast.success(`${roleName} status updated to ${status}`);
        }
      } catch (error) {
        toast.error(`Failed to update ${roleName} status`);
        console.error('Failed to update role status:', error);
      }
    }
  };

  const handleCreateOpportunity = async (opportunity: Opportunity): Promise<Opportunity> => {
    const loadingToast = toast.loading('Creating opportunity...');

    try {
      await addOpportunity(opportunity);
      toast.dismiss(loadingToast);
      toast.success(`Opportunity "${opportunity.opportunityName}" created successfully!`);
      setShowNewOpportunityDialog(false);
      return opportunity;
    } catch (error: unknown) {
      toast.dismiss(loadingToast);
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      toast.error(`Failed to create opportunity: ${errorMessage}`);
      throw error;
    }
  };

  const handleMoveToHold = async (opportunityId: string) => {
    const opportunity = opportunities.find((opp: Opportunity) => opp.id === opportunityId);
    if (!opportunity) return;

    const loadingToast = toast.loading('Moving to hold...');

    try {
      await moveToOnHold(opportunityId);
      toast.dismiss(loadingToast);
      toast.success(`"${opportunity.opportunityName}" moved to hold`);
    } catch (error: unknown) {
      toast.dismiss(loadingToast);
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      toast.error(`Failed to move opportunity: ${errorMessage}`);
    }
  };

  const handleMoveToInProgress = async (opportunityId: string) => {
    const opportunity = onHoldOpportunities.find((opp: Opportunity) => opp.id === opportunityId);
    if (!opportunity) return;

    const loadingToast = toast.loading('Moving to in progress...');

    try {
      await moveToInProgress(opportunityId);
      toast.dismiss(loadingToast);
      toast.success(`"${opportunity.opportunityName}" moved back to in progress`);
    } catch (error: unknown) {
      toast.dismiss(loadingToast);
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      toast.error(`Failed to move opportunity: ${errorMessage}`);
    }
  };

  const handleMoveToCompleted = async (opportunityId: string) => {
    const opportunity = opportunities.find((opp: Opportunity) => opp.id === opportunityId) ||
      onHoldOpportunities.find((opp: Opportunity) => opp.id === opportunityId);
    if (!opportunity) return;

    const loadingToast = toast.loading('Moving to completed...');

    try {
      const fromStatus = opportunities.find((opp: Opportunity) => opp.id === opportunityId) ? 'in-progress' : 'on-hold';
      await moveToCompleted(opportunityId, fromStatus as 'in-progress' | 'on-hold');
      toast.dismiss(loadingToast);
      toast.success(`"${opportunity.opportunityName}" moved to completed`);
    } catch (error: unknown) {
      toast.dismiss(loadingToast);
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      toast.error(`Failed to move opportunity: ${errorMessage}`);
    }
  };

  const openNewOpportunityDialog = () => setShowNewOpportunityDialog(true);
  const closeNewOpportunityDialog = () => setShowNewOpportunityDialog(false);
  const closeNewRoleDialog = () => setShowNewRoleDialog(false);
  const closeNewRoleDialogAndReset = () => {
    setShowNewRoleDialog(false);
  };

  return {
    opportunities,
    onHoldOpportunities,
    completedOpportunities,
    loading,
    error,
    filters,
    showNewOpportunityDialog,
    showNewRoleDialog,
    selectedOpportunityId,
    handleAddRole,
    handleCreateRole,
    handleUpdateRole,
    handleCreateOpportunity,
    handleMoveToHold,
    handleMoveToInProgress,
    handleMoveToCompleted,
    openNewOpportunityDialog,
    closeNewOpportunityDialog,
    closeNewRoleDialog,
    closeNewRoleDialogAndReset,
    filterOpportunities,
    isRefetching,
    isAddingRole,
    fetchNextPageInProgress,
    hasNextPageInProgress,
    isFetchingNextPageInProgress,
    fetchNextPageOnHold,
    hasNextPageOnHold,
    isFetchingNextPageOnHold,
    fetchNextPageCompleted,
    hasNextPageCompleted,
    isFetchingNextPageCompleted
  };
}; 
