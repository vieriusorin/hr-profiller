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
import { withErrorBoundary } from '@/app/shared/components/with-error-boundary';
import { OpportunitiesErrorFallback } from '@/app/shared/components/error-fallbacks/opportunities-error-fallback';

const defaultFilters: OpportunityFilters = {
  client: '',
  grades: [],
  needsHire: 'all',
  probability: [0, 100]
};

const ValidatedOpportunitiesList = () => {
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
        />
      )}

      {validatedData.length > 0 ? (
        <>
          <OpportunityListSummary
            totalCount={validatedData.length}
            hasValidationError={hasValidationError}
            onRefresh={() => refetch()}
          />
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
            {validatedData.map((opportunity) => (
              <OpportunityCard
                key={opportunity.id}
                opportunity={opportunity}
                showActions={!hasValidationError}
                onEditOpportunity={handleEditOpportunity}
              />
            ))}
          </div>
        </>
      ) : (
        <div className='text-center py-8 text-gray-500'>
          No opportunities found
        </div>
      )}

      {editOpportunity && (
        <EditOpportunityModal
          isOpen={!!editOpportunity}
          opportunity={editOpportunity}
          onClose={() => setEditOpportunity(null)}
          listType={editOpportunity.status === 'In Progress' ? 'in-progress' : editOpportunity.status === 'On Hold' ? 'on-hold' : 'completed'}
        />
      )}
    </div>
  );
};

export default withErrorBoundary(ValidatedOpportunitiesList, {
  FallbackComponent: OpportunitiesErrorFallback
}); 