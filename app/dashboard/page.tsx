'use client';

import React, { useState, Suspense } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Building, Calendar, Users } from 'lucide-react';
import { CreateOpportunityForm } from '@/app/(dashboard)/domains/opportunities/components/forms/create-opportunity-form';
import { CreateRoleForm } from '@/app/(dashboard)/domains/opportunities/components/forms/create-role-form';
import { OpportunityFilters } from '@/app/(dashboard)/domains/opportunities/components/filters/opportunity-filters';
import { ViewToggle } from '@/app/(dashboard)/domains/opportunities/components/view-toggle/view-toggle';
import { useDashboard } from '@/app/hooks/useDashboard';
import OpportunitiesList from '@/app/(dashboard)/domains/opportunities/components/opportunities-list';
import { OpportunityCardSkeleton } from '@/app/(dashboard)/domains/opportunities/components/opportunity-card/opportunity-card-skeleton';
import { ViewMode } from '../(dashboard)/domains/opportunities/components/view-toggle/types';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Separator } from '@/components/ui/separator';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from '@/components/ui/breadcrumb';

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

  const filteredInProgress = filterOpportunities(opportunities, filters);
  const filteredOnHold = filterOpportunities(onHoldOpportunities, filters);
  const filteredCompleted = filterOpportunities(completedOpportunities, filters);

  return (
    <>
      <header className='flex h-16 shrink-0 items-center gap-2 border-b px-4'>
        <SidebarTrigger className='-ml-1' />
        <Separator
          orientation='vertical'
          className='mr-2 h-4'
        />
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbPage>Opportunity Dashboard</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </header>

      <div className='p-6 max-w-7xl mx-auto'>
        <div className='flex justify-between items-center mb-6'>
          <div>
            <h1 className='text-3xl font-bold flex items-center gap-2'>
              Opportunity Dashboard
              {isRefetching && (
                <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-primary'></div>
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

        <Tabs defaultValue='in-progress' className='w-full'>
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

          <Suspense fallback={<OpportunityCardSkeleton />}>
            <TabsContent value='in-progress'>
              <OpportunitiesList 
                viewMode={currentView} 
                status='in-progress'
                opportunities={opportunities}
                onHoldOpportunities={onHoldOpportunities}
                completedOpportunities={completedOpportunities}
                filterOpportunities={filterOpportunities}
                filters={filters}
                onAddRole={handleAddRole}
                onUpdateRole={handleUpdateRole}
                onMoveToHold={handleMoveToHold}
                onMoveToInProgress={undefined}
                onMoveToCompleted={handleMoveToCompleted}
              />
            </TabsContent>
            
            <TabsContent value='on-hold'>
              <OpportunitiesList 
                viewMode={currentView} 
                status='on-hold' 
                opportunities={opportunities}
                onHoldOpportunities={onHoldOpportunities}
                completedOpportunities={completedOpportunities}
                filterOpportunities={filterOpportunities}
                filters={filters}
                onMoveToInProgress={handleMoveToInProgress}
                onAddRole={handleAddRole}
                onUpdateRole={handleUpdateRole}
                onMoveToHold={undefined}
                onMoveToCompleted={handleMoveToCompleted}
              />
            </TabsContent>
            <TabsContent value='completed'>
              <OpportunitiesList 
                viewMode={currentView} 
                status='completed' 
                opportunities={opportunities}
                onHoldOpportunities={onHoldOpportunities}
                completedOpportunities={completedOpportunities}
                filterOpportunities={filterOpportunities}
                filters={filters}
                onAddRole={handleAddRole}
                onUpdateRole={handleUpdateRole}
                onMoveToHold={undefined}
                onMoveToInProgress={undefined}
              />
            </TabsContent>
          </Suspense>
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
    </>
  );
} 
