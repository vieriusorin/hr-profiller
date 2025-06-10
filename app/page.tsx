'use client';

import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Building, Calendar, Users } from 'lucide-react';
import { OpportunityCard } from '@/domains/opportunities/components/opportunity-card/opportunity-card';
import { CreateOpportunityForm } from '@/domains/opportunities/components/forms/create-opportunity-form';
import { CreateRoleForm } from '@/domains/opportunities/components/forms/create-role-form';
import { OpportunityFilters } from '@/domains/opportunities/components/filters/opportunity-filters';
import { ViewToggle, type ViewMode } from './components/view-toggle/view-toggle';
import { OpportunitiesTable } from './components/opportunities-table/opportunities-table';
import { useDashboard } from './hooks/useDashboard';

export default function OpportunityDashboard() {
  const [currentView, setCurrentView] = useState<ViewMode>('cards');
  
  const {
    loading,
    isRefetching,
    showNewOpportunityDialog,
    showNewRoleDialog,
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
    closeNewRoleDialogAndReset,
  } = useDashboard();

  if (loading) {
    return (
      <div className='p-6 text-center'>
        <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4'></div>
        Loading opportunities...
      </div>
    );
  }

  return (
    <div className='p-6 max-w-7xl mx-auto'>
      <div className='flex justify-between items-center mb-6'>
        <div>
          <h1 className='text-3xl font-bold flex items-center gap-2'>
            HR Opportunity Dashboard
            {isRefetching && (
              <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600'></div>
            )}
          </h1>
          <p className='text-gray-600 mt-1'>Manage client opportunities and resource allocation</p>
        </div>
        
        <div className='flex items-center gap-4'>
          <ViewToggle 
            currentView={currentView} 
            onViewChange={setCurrentView} 
          />
          
          <Dialog open={showNewOpportunityDialog} onOpenChange={(open) => open ? openNewOpportunityDialog() : closeNewOpportunityDialog()}>
            <DialogTrigger asChild>
              <Button className='flex items-center gap-2'>
                <Plus className='h-4 w-4' />
                New Opportunity
              </Button>
            </DialogTrigger>
            <DialogContent className='sm:max-w-md'>
              <DialogHeader>
                <DialogTitle>Create New Opportunity</DialogTitle>
                <DialogDescription>
                  Add a new client opportunity to the pipeline
                </DialogDescription>
              </DialogHeader>
              <CreateOpportunityForm
                onSubmit={handleCreateOpportunity}
                onCancel={closeNewOpportunityDialog}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <OpportunityFilters />

      <Tabs defaultValue='in-progress' className='space-y-4'>
        <TabsList className='grid w-full grid-cols-3'>
          <TabsTrigger value='in-progress' className='flex items-center gap-2'>
            <Building className='h-4 w-4' />
            In Progress ({filteredInProgress.length})
          </TabsTrigger>
          <TabsTrigger value='on-hold' className='flex items-center gap-2'>
            <Calendar className='h-3 w-3' />
            On Hold ({filteredOnHold.length})
          </TabsTrigger>
          <TabsTrigger value='completed' className='flex items-center gap-2'>
            <Users className='h-3 w-3' />
            Completed ({filteredCompleted.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value='in-progress'>
          {currentView === 'cards' ? (
            <div className='space-y-4'>
              {filteredInProgress.map(opportunity => (
                <OpportunityCard
                  key={opportunity.id}
                  opportunity={opportunity}
                  onAddRole={handleAddRole}
                  onUpdateRole={handleUpdateRole}
                  onMoveToHold={handleMoveToHold}
                />
              ))}
              {filteredInProgress.length === 0 && (
                <div className='text-center py-8 text-gray-500'>
                  No opportunities in progress
                </div>
              )}
            </div>
          ) : (
            <OpportunitiesTable
              opportunities={filteredInProgress}
              onAddRole={handleAddRole}
              onUpdateRole={handleUpdateRole}
              onMoveToHold={handleMoveToHold}
            />
          )}
        </TabsContent>

        <TabsContent value='on-hold'>
          {currentView === 'cards' ? (
            <div className='space-y-4'>
              {filteredOnHold.map(opportunity => (
                <OpportunityCard
                  key={opportunity.id}
                  opportunity={opportunity}
                  onAddRole={handleAddRole}
                  onUpdateRole={handleUpdateRole}
                  onMoveToInProgress={handleMoveToInProgress}
                />
              ))}
              {filteredOnHold.length === 0 && (
                <div className='text-center py-8 text-gray-500'>
                  No opportunities on hold
                </div>
              )}
            </div>
          ) : (
            <OpportunitiesTable
              opportunities={filteredOnHold}
              onAddRole={handleAddRole}
              onUpdateRole={handleUpdateRole}
              onMoveToInProgress={handleMoveToInProgress}
            />
          )}
        </TabsContent>

        <TabsContent value='completed'>
          {currentView === 'cards' ? (
            <div className='space-y-4'>
              {filteredCompleted.map(opportunity => (
                <OpportunityCard
                  key={opportunity.id}
                  opportunity={opportunity}
                  showActions={false}
                />
              ))}
              {filteredCompleted.length === 0 && (
                <div className='text-center py-8 text-gray-500'>
                  No completed opportunities
                </div>
              )}
            </div>
          ) : (
            <OpportunitiesTable
              opportunities={filteredCompleted}
              showActions={false}
            />
          )}
        </TabsContent>
      </Tabs>

      <Dialog open={showNewRoleDialog} onOpenChange={closeNewRoleDialogAndReset}>
        <DialogContent className='sm:max-w-md'>
          <DialogHeader>
            <DialogTitle>Add New Role</DialogTitle>
            <DialogDescription>
              Add a role to the selected opportunity
            </DialogDescription>
          </DialogHeader>
          <CreateRoleForm
            onSubmit={handleCreateRole}
            onCancel={closeNewRoleDialogAndReset}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}; 