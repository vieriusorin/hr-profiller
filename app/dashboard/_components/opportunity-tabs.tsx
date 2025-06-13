import { Suspense } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Building, Calendar, Users } from 'lucide-react';
import { OpportunityTabsProps } from '../_types';
import { OpportunityCardSkeleton } from '@/components/opportunities/components/opportunity-card/opportunity-card-skeleton';
import OpportunitiesList from '@/components/opportunities/components/opportunities-list';

export const OpportunityTabs = ({
  currentView,
  opportunities,
  onHoldOpportunities,
  completedOpportunities,
  filterOpportunities,
  filters,
  handleAddRole,
  handleUpdateRole,
  handleMoveToHold,
  handleMoveToInProgress,
  handleMoveToCompleted
}: OpportunityTabsProps) => {
  const filteredInProgress = filterOpportunities(opportunities, filters);
  const filteredOnHold = filterOpportunities(onHoldOpportunities, filters);
  const filteredCompleted = filterOpportunities(completedOpportunities, filters);

  return (
    <Tabs defaultValue='in-progress' className='w-full'>
      <TabsList className='grid w-full grid-cols-3'>
        <TabsTrigger value='in-progress' className='flex items-center gap-2'>
          <Building className='h-4 w-4' />
          In Progress
          {filteredInProgress.length > 0 && (
            <span className='ml-2 rounded-full bg-primary/30 px-2 py-0.5 text-xs text-black'>
              {filteredInProgress.length}
            </span>
          )}
        </TabsTrigger>
        <TabsTrigger value='on-hold' className='flex items-center gap-2'>
          <Calendar className='h-4 w-4' />
          On Hold
          {filteredOnHold.length > 0 && (
            <span className='ml-2 rounded-full bg-primary/30 px-2 py-0.5 text-xs text-black'>
              {filteredOnHold.length}
            </span>
          )}
        </TabsTrigger>
        <TabsTrigger value='completed' className='flex items-center gap-2'>
          <Users className='h-4 w-4' />
          Completed
          {filteredCompleted.length > 0 && (
            <span className='ml-2 rounded-full bg-primary/30 px-2 py-0.5 text-xs text-primary'>
              {filteredCompleted.length}
            </span>
          )}
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
            onMoveToInProgress={handleMoveToInProgress}
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
  );
}; 