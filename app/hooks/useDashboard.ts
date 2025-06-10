import { useState } from 'react';
import { useOpportunities } from '@/domains/opportunities/hooks/use-opportunities-query';
import { useOpportunityFilters } from '@/domains/opportunities/hooks/useOpportunityFilters';
import { UseDashboardReturn } from '../types';
import type { Opportunity } from '@/shared/types';
import toast from 'react-hot-toast';

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
    updateOpportunityInList,
    updateRoleStatus,
    filterOpportunities,
    isRefetching,
    isAddingRole
  } = useOpportunities();

  const { filters } = useOpportunityFilters();

  const [showNewOpportunityDialog, setShowNewOpportunityDialog] = useState(false);
  const [showNewRoleDialog, setShowNewRoleDialog] = useState(false);
  const [selectedOpportunityId, setSelectedOpportunityId] = useState<number | null>(null);

  if (error) {
    throw error;
  }

  const handleAddRole = (opportunityId: number) => {
    setSelectedOpportunityId(opportunityId);
    setShowNewRoleDialog(true);
  };

  const handleCreateRole = async (roleData: any) => {
    if (!roleData || !selectedOpportunityId) return;

    try {
      const loadingToast = toast.loading('Creating role...');
      
      await new Promise<void>((resolve, reject) => {
        addRole(
          { 
            opportunityId: selectedOpportunityId, 
            roleData: roleData 
          },
          {
            onSuccess: (updatedOpportunity: Opportunity) => {
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
      console.error('❌ Error in handleCreateRole:', error);
    }
  };

  const handleUpdateRole = async (opportunityId: number, roleId: number, status: string) => {
    const opportunity = opportunities.find((opp: any) => opp.id === opportunityId) ||
                      onHoldOpportunities.find((opp: any) => opp.id === opportunityId);
    
    if (opportunity) {
      const role = opportunity.roles.find((r: any) => r.id === roleId);
      const roleName = role?.roleName || 'Role';
      
      try {
        // First, update the role status via API
        const updatedOpportunity = await updateRoleStatus(opportunityId, roleId, status);
        
        // Check if the opportunity should be moved to completed
        // Move to completed when any role becomes "Won"
        const shouldMoveToCompleted = status === 'Won';
        
        if (shouldMoveToCompleted) {
          // Move to completed
          const fromStatus = opportunities.find((opp: any) => opp.id === opportunityId) ? 'in-progress' : 'on-hold';
          
          try {
            await moveToCompleted(opportunityId, fromStatus as 'in-progress' | 'on-hold');
            toast.success(`${roleName} status updated to ${status}. Opportunity moved to completed!`);
          } catch (error) {
            toast.success(`${roleName} status updated to ${status}`);
            toast.error('Failed to move opportunity to completed automatically');
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

  const handleCreateOpportunity = async (opportunity: any) => {
    const loadingToast = toast.loading('Creating opportunity...');
    
    try {
      const result = await addOpportunity(opportunity);
      toast.dismiss(loadingToast);
      toast.success(`Opportunity "${opportunity.opportunityName}" created successfully!`);
      setShowNewOpportunityDialog(false);
      return result;
    } catch (error: any) {
      toast.dismiss(loadingToast);
      toast.error(`Failed to create opportunity: ${error.message}`);
      throw error;
    }
  };

  const handleMoveToHold = async (opportunityId: number) => {
    const opportunity = opportunities.find(opp => opp.id === opportunityId);
    if (!opportunity) return;

    const loadingToast = toast.loading('Moving to hold...');
    
    try {
      await moveToOnHold(opportunityId);
      toast.dismiss(loadingToast);
      toast.success(`"${opportunity.opportunityName}" moved to hold`);
    } catch (error: any) {
      toast.dismiss(loadingToast);
      toast.error(`Failed to move opportunity: ${error.message}`);
    }
  };

  const handleMoveToInProgress = async (opportunityId: number) => {
    const opportunity = onHoldOpportunities.find(opp => opp.id === opportunityId);
    if (!opportunity) return;

    const loadingToast = toast.loading('Moving to in progress...');
    
    try {
      await moveToInProgress(opportunityId);
      toast.dismiss(loadingToast);
      toast.success(`"${opportunity.opportunityName}" moved back to in progress`);
    } catch (error: any) {
      toast.dismiss(loadingToast);
      toast.error(`Failed to move opportunity: ${error.message}`);
    }
  };

  const openNewOpportunityDialog = () => setShowNewOpportunityDialog(true);
  const closeNewOpportunityDialog = () => setShowNewOpportunityDialog(false);
  const closeNewRoleDialog = () => setShowNewRoleDialog(false);
  const closeNewRoleDialogAndReset = () => {
    setShowNewRoleDialog(false);
  };

  const filterParams = {
    client: filters.client,
    grades: filters.grades as any,
    needsHire: filters.needsHire as any,
  };

  // Filter out opportunities with "Won" roles from In Progress and On Hold
  const filterActiveOpportunities = (opportunities: Opportunity[]) => {
    return opportunities.filter(opp => 
      !opp.roles.some(role => role.status === 'Won')
    );
  };

  const activeOpportunities = filterActiveOpportunities(opportunities);
  const activeOnHoldOpportunities = filterActiveOpportunities(onHoldOpportunities);

  const filteredInProgress = filterOpportunities(activeOpportunities, filterParams);
  const filteredOnHold = filterOpportunities(activeOnHoldOpportunities, filterParams);
  const filteredCompleted = filterOpportunities(completedOpportunities, filterParams);

  return {
    opportunities,
    onHoldOpportunities,
    completedOpportunities,
    loading,
    error,
    isRefetching,
    filters,
    showNewOpportunityDialog,
    showNewRoleDialog,
    selectedOpportunityId,
    filteredInProgress,
    filteredOnHold,
    filteredCompleted,
    handleAddRole,
    handleCreateRole,
    handleUpdateRole,
    handleCreateOpportunity,
    handleMoveToHold,
    handleMoveToInProgress,
    openNewOpportunityDialog,
    closeNewOpportunityDialog,
    closeNewRoleDialog,
    closeNewRoleDialogAndReset,
  };
}; 