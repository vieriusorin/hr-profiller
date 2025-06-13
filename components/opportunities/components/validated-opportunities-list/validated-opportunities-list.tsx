'use client';

import { useQuery } from '@tanstack/react-query';
import { validatedOpportunityApi, ApiValidationError, ValidatedApiResult } from '@/shared/lib/api/validated-api';
import { queryKeys } from '@/shared/lib/query/keys';
import { OpportunityCard } from '../opportunity-card/opportunity-card';
import { ValidationErrorDisplay } from './components/validation-error-display';
import { LoadingSpinner } from './components/loading-spinner';
import { OpportunityListSummary } from './components/opportunity-list-summary';
import { Opportunity, OpportunityFilters } from '@/shared/types';
import { useState } from 'react';
import { EditOpportunityModal } from '../modals/edit-role-modal';

const defaultFilters: OpportunityFilters = {
  client: '',
  grades: [],
  needsHire: 'all',
  probability: [0, 100]
};

export const ValidatedOpportunitiesList = () => {
  const [editOpportunity, setEditOpportunity] = useState<Opportunity | null>(null);

  const handleEditOpportunity = (opportunity: Opportunity) => {
    console.log('Edit clicked', opportunity);
    setEditOpportunity(opportunity);
    setTimeout(() => {
      console.log('editOpportunity state after set:', opportunity);
    }, 0);
  };

  const {
    data: opportunities,
    isLoading,
    error,
    refetch,
  } = useQuery<ValidatedApiResult<Opportunity[]>>({
    queryKey: queryKeys.opportunities.inProgress(),
    queryFn: () => validatedOpportunityApi.getInProgressOpportunities(defaultFilters),
    retry: (failureCount, error) => {
      if (error instanceof ApiValidationError) {
        return false;
      }
      return failureCount < 3;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error && !(error instanceof ApiValidationError)) {
    return (
      <ValidationErrorDisplay 
        error={error}
        onRetry={() => refetch()}
      />
    );
  }

  const validatedData = opportunities?.success ? opportunities.data : (opportunities?.fallbackData || []);
  const hasValidationError = opportunities ? !opportunities.success : false;
  const validationError = opportunities && !opportunities.success ? opportunities.error : null;
  const fallbackData = opportunities && !opportunities.success ? opportunities.fallbackData : null;

  return (
    <div className='space-y-4'>
      {hasValidationError && validationError && (
        <ValidationErrorDisplay 
          error={validationError}
          onRetry={() => refetch()}
          fallbackData={fallbackData || []}
        />
      )}
      
      {validatedData.length === 0 ? (
        <div className='text-center py-8 text-gray-500'>
          <p>No opportunities found</p>
          {hasValidationError && (
            <p className='text-sm mt-2'>
              This could be due to data validation issues. Try refreshing.
            </p>
          )}
        </div>
      ) : (
        <div className='grid gap-4'>
          {validatedData.map((opportunity: Opportunity) => (
            <div key={opportunity.id} className='relative'>
              {hasValidationError && (
                <div className='absolute top-2 right-2 w-3 h-3 bg-yellow-400 rounded-full' 
                     title='This item may have validation issues' />
              )}
              <OpportunityCard
                opportunity={opportunity}
                onAddRole={() => {}}
                onMoveToHold={() => {}}
                onUpdateRole={() => {}}
                showActions={!hasValidationError}
                onEditOpportunity={() => handleEditOpportunity(opportunity)}
              />
            </div>
          ))}
        </div>
      )}
      
      <OpportunityListSummary
        totalCount={validatedData.length}
        hasValidationError={hasValidationError}
        onRefresh={() => refetch()}
      />
      {editOpportunity && (
        <EditOpportunityModal
          isOpen={!!editOpportunity}
          onClose={() => setEditOpportunity(null)}
          opportunity={editOpportunity}
          listType={
            editOpportunity.status === 'In Progress'
              ? 'in-progress'
              : editOpportunity.status === 'On Hold'
              ? 'on-hold'
              : 'completed'
          }
        />
      )}
    </div>
  );
}; 