'use client'

import React from 'react';
import { OpportunityCard } from './opportunity-card/opportunity-card';
import { OpportunitiesTable } from '@/app/(dashboard)/domains/opportunities/components/opportunities-table/opportunities-table';
import { ViewMode } from '@/app/(dashboard)/domains/opportunities/components/view-toggle/view-toggle';
import { Opportunity } from '@/shared/types';
import { OpportunityFiltersState } from '@/app/(dashboard)/domains/opportunities/components/filters/types';

interface OpportunitiesListProps {
  viewMode: ViewMode;
  status: 'in-progress' | 'on-hold' | 'completed';
  opportunities: Opportunity[];
  onHoldOpportunities: Opportunity[];
  completedOpportunities: Opportunity[];
  filterOpportunities: (opportunities: Opportunity[], filters: OpportunityFiltersState) => Opportunity[];
  filters: OpportunityFiltersState;
  onAddRole: (opportunityId: string) => void;
  onUpdateRole: (opportunityId: string, roleId: string, status: string) => void;
  onMoveToHold?: (opportunityId: string) => void;
  onMoveToInProgress?: (opportunityId: string) => void;
  onMoveToCompleted?: (opportunityId: string) => void;
}

const OpportunitiesList: React.FC<OpportunitiesListProps> = ({ 
  viewMode, 
  status,
  opportunities,
  onHoldOpportunities,
  completedOpportunities,
  filterOpportunities,
  filters,
  onAddRole,
  onUpdateRole,
  onMoveToHold,
  onMoveToInProgress,
  onMoveToCompleted,
}: OpportunitiesListProps) => {

  let opportunitiesToShow: Opportunity[] = [];
  let emptyMessage = '';

  switch (status) {
    case 'in-progress':
      opportunitiesToShow = filterOpportunities(opportunities, filters);
      emptyMessage = 'No opportunities in progress';
      break;
    case 'on-hold':
      opportunitiesToShow = filterOpportunities(onHoldOpportunities, filters);
      emptyMessage = 'No opportunities on hold';
      break;
    case 'completed':
      opportunitiesToShow = filterOpportunities(completedOpportunities, filters);
      emptyMessage = 'No completed opportunities';
      break;
  }

  return (
    <>
      {viewMode === 'cards' ? (
        <div className='space-y-4'>
          {opportunitiesToShow.map(opportunity => (
            <OpportunityCard
              key={opportunity.id}
              opportunity={opportunity}
              onAddRole={onAddRole}
              onUpdateRole={onUpdateRole}
              onMoveToHold={onMoveToHold}
              onMoveToInProgress={onMoveToInProgress}
              onMoveToCompleted={onMoveToCompleted}
              showActions={status !== 'completed'}
            />
          ))}
          {opportunitiesToShow.length === 0 && <div className='text-center py-8 text-gray-500'>{emptyMessage}</div>}
        </div>
      ) : (
        <OpportunitiesTable
          opportunities={opportunitiesToShow}
          onAddRole={onAddRole}
          onUpdateRole={onUpdateRole}
          onMoveToHold={onMoveToHold}
          onMoveToInProgress={onMoveToInProgress}
          onMoveToCompleted={onMoveToCompleted}
          showActions={status !== 'completed'}
        />
      )}
    </>
  );
};

export default OpportunitiesList; 
