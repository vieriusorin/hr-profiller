'use client'

import React from 'react';
import { OpportunityCard } from './opportunity-card/opportunity-card';
import { OpportunitiesListProps } from '../types';
import { Opportunity } from '@/shared/types';
import { OpportunitiesTable } from './opportunities-table/opportunities-table';
import { GroupedOpportunitiesList } from './grouped-opportunities-list';

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
  onEditOpportunity,
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
        <GroupedOpportunitiesList
          viewMode={viewMode}
          status={status}
          opportunities={opportunitiesToShow}
          onHoldOpportunities={onHoldOpportunities}
          completedOpportunities={completedOpportunities}
          filterOpportunities={filterOpportunities}
          filters={filters}
          onAddRole={onAddRole}
          onUpdateRole={onUpdateRole}
          onMoveToHold={onMoveToHold}
          onMoveToInProgress={onMoveToInProgress}
          onMoveToCompleted={onMoveToCompleted}
          onEditOpportunity={onEditOpportunity}
        />
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
