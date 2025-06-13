'use client';

import React, { useRef, useEffect } from 'react';
import { OpportunityCard } from '../opportunity-card/opportunity-card';
import { MonthHeader } from '../month-header/month-header';
import { OpportunitiesListProps } from '../../types';
import { Opportunity } from '@/shared/types';
import { groupOpportunitiesByMonth } from '@/shared/lib/helpers/date-grouping';

export const GroupedOpportunitiesList = ({
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
  const monthGroups = groupOpportunitiesByMonth(opportunities);

  if (opportunities.length === 0) {
    const emptyMessage = status === 'in-progress' 
      ? 'No opportunities in progress'
      : status === 'on-hold' 
      ? 'No opportunities on hold'
      : 'No completed opportunities';
    
    return (
      <div className='text-center py-8 text-gray-500'>
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className='relative'>
      {monthGroups.map((monthGroup, index) => (
        <div 
          key={monthGroup.monthKey} 
          className='relative'
          data-month-group={monthGroup.monthKey}
        >
          <MonthHeader
            monthLabel={monthGroup.monthLabel}
            opportunityCount={monthGroup.opportunities.length}
          />
          <div className='space-y-4 px-2'>
            {monthGroup.opportunities.map((opportunity) => (
              <OpportunityCard
                key={opportunity.id}
                opportunity={opportunity}
                onAddRole={onAddRole}
                onUpdateRole={onUpdateRole}
                onMoveToHold={onMoveToHold}
                onMoveToInProgress={onMoveToInProgress}
                onMoveToCompleted={onMoveToCompleted}
                showActions={status !== 'completed'}
                onEditOpportunity={onEditOpportunity}
              />
            ))}
          </div>

        </div>
      ))}
    </div>
  );
}; 