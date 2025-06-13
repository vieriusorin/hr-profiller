'use client';

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { RoleForm } from '@/components/opportunities/components/forms/create-role-form';
import { OpportunityFilters } from '@/components/opportunities/components/filters/opportunity-filters';
import { QuickStatsCard } from '@/shared/components/quick-stats-card';
import { useDashboard } from '@/app/hooks/useDashboard';
import { ViewMode } from '@/components/opportunities/components/view-toggle/types';
import { 
  DashboardHeader, 
  DashboardTitle, 
  DashboardActions, 
  OpportunityTabs 
} from './_components';
import { CreateOpportunityForm } from '@/components/opportunities/components/forms/create-opportunity-form';

export default function OpportunityDashboard() {
  const [currentView, setCurrentView] = useState<ViewMode>('cards');
  const {
    isRefetching,
    showNewOpportunityDialog,
    showNewRoleDialog,
    opportunities,
    onHoldOpportunities,
    completedOpportunities,
    filterOpportunities,
    filters,
    handleCreateRole,
    handleCreateOpportunity,
    openNewOpportunityDialog,
    closeNewOpportunityDialog,
    closeNewRoleDialogAndReset,
    handleAddRole,
    handleUpdateRole,
    handleMoveToHold,
    handleMoveToInProgress,
    handleMoveToCompleted
  } = useDashboard();

  return (
    <>
      <DashboardHeader />

      <div className='p-6 max-w-7xl mx-auto'>
        <div className='flex justify-between items-center mb-6'>
          <DashboardTitle isRefetching={isRefetching} />
          
          <div className='flex items-center gap-4'>
            <DashboardActions
              currentView={currentView}
              onViewChange={setCurrentView}
              onNewOpportunity={openNewOpportunityDialog}
            />
          </div>
        </div>

        <QuickStatsCard 
          opportunities={opportunities}
          onHoldOpportunities={onHoldOpportunities}
          completedOpportunities={completedOpportunities}
        />

        <OpportunityFilters />

        <OpportunityTabs
          currentView={currentView}
          opportunities={opportunities}
          onHoldOpportunities={onHoldOpportunities}
          completedOpportunities={completedOpportunities}
          filterOpportunities={filterOpportunities}
          filters={filters}
          handleAddRole={handleAddRole}
          handleUpdateRole={handleUpdateRole}
          handleMoveToHold={handleMoveToHold}
          handleMoveToInProgress={handleMoveToInProgress}
          handleMoveToCompleted={handleMoveToCompleted}
        />

        <Dialog open={showNewOpportunityDialog} onOpenChange={closeNewOpportunityDialog}>
          <DialogTrigger asChild>
            <div style={{ display: 'none' }} />
          </DialogTrigger>
          <DialogContent className='sm:max-w-[425px]'>
            <DialogHeader>
              <DialogTitle>Create New Opportunity</DialogTitle>
              <DialogDescription>
                Add a new opportunity to track progress and manage roles.
              </DialogDescription>
            </DialogHeader>
            <CreateOpportunityForm 
              onSubmit={handleCreateOpportunity} 
              onCancel={closeNewOpportunityDialog}
            />
          </DialogContent>
        </Dialog>

        <Dialog open={showNewRoleDialog} onOpenChange={closeNewRoleDialogAndReset}>
          <DialogContent className='sm:max-w-[425px]'>
            <DialogHeader>
              <DialogTitle>Add New Role</DialogTitle>
              <DialogDescription>
                Add a new role to the selected opportunity.
              </DialogDescription>
            </DialogHeader>
            <RoleForm 
              onSubmit={handleCreateRole} 
              onCancel={closeNewRoleDialogAndReset}
            />
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
} 
