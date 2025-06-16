'use client';

import { useOpportunities } from '@/components/opportunities/hooks/use-opportunities-query';
import { OpportunityCard } from '../opportunity-card/opportunity-card';
import { ValidationErrorDisplay } from './components/validation-error-display';
import { LoadingSpinner } from './components/loading-spinner';
import { OpportunityListSummary } from './components/opportunity-list-summary';
import { Opportunity } from '@/shared/types';
import { useState } from 'react';
import { EditOpportunityModal } from '../modals/edit-role-modal';
import { withErrorBoundary } from '@/app/shared/components/with-error-boundary';
import { OpportunitiesErrorFallback } from '@/app/shared/components/error-fallbacks/opportunities-error-fallback';

const ValidatedOpportunitiesList = () => {
  const [editOpportunity, setEditOpportunity] = useState<Opportunity | null>(null);

  const {
    opportunities,
    loading,
    error,
    validationError,
    refetch,
    hasValidationError,
  } = useOpportunities();

  const handleEditOpportunity = (opportunity: Opportunity) => {
    setEditOpportunity(opportunity);
  };

  if (loading && !opportunities.length) {
    return <LoadingSpinner />;
  }

  if (error && !validationError) {
    return (
      <ValidationErrorDisplay
        error={error}
        onRetry={refetch}
      />
    );
  }

  const validatedData = opportunities;

  return (
    <div className='space-y-4'>
      {hasValidationError && validationError && (
        <ValidationErrorDisplay
          error={validationError}
          onRetry={refetch}
        />
      )}

      {validatedData.length > 0 ? (
        <>
          <OpportunityListSummary
            totalCount={validatedData.length}
            hasValidationError={hasValidationError}
            onRefresh={refetch}
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
  FallbackComponent: OpportunitiesErrorFallback,
}); 