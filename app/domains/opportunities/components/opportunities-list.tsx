'use client'

import React from 'react';
import { useDashboard } from '@/hooks/useDashboard';
import { OpportunityCard } from './opportunity-card/opportunity-card';
import { OpportunitiesTable } from '@/app/components/opportunities-table/opportunities-table';
import { ViewMode } from '@/app/components/view-toggle/view-toggle';
import { Opportunity } from '@/shared/types';

interface OpportunitiesListProps {
  viewMode: ViewMode;
  status: 'in-progress' | 'on-hold' | 'completed';
}

const OpportunitiesList: React.FC<OpportunitiesListProps> = ({ viewMode, status }: OpportunitiesListProps) => {
  const {
    opportunities,
    onHoldOpportunities,
    completedOpportunities,
    filterOpportunities,
    filters,
    handleAddRole,
    handleUpdateRole,
    handleMoveToHold,
    handleMoveToInProgress,
  } = useDashboard();

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
              onAddRole={handleAddRole}
              onUpdateRole={handleUpdateRole}
              onMoveToHold={status === 'in-progress' ? handleMoveToHold : undefined}
              onMoveToInProgress={status === 'on-hold' ? handleMoveToInProgress : undefined}
              showActions={status !== 'completed'}
            />
          ))}
          {opportunitiesToShow.length === 0 && <div className='text-center py-8 text-gray-500'>{emptyMessage}</div>}
        </div>
      ) : (
        <OpportunitiesTable
          opportunities={opportunitiesToShow}
          onAddRole={handleAddRole}
          onUpdateRole={handleUpdateRole}
          onMoveToHold={status === 'in-progress' ? handleMoveToHold : undefined}
          onMoveToInProgress={status === 'on-hold' ? handleMoveToInProgress : undefined}
          showActions={status !== 'completed'}
        />
      )}
    </>
  );
};

export default OpportunitiesList; 