'use client';

interface OpportunityListSummaryProps {
  totalCount: number;
  hasValidationError: boolean;
  onRefresh: () => void;
}

export const OpportunityListSummary = ({
  totalCount,
  hasValidationError,
  onRefresh
}: OpportunityListSummaryProps) => (
  <div className='mt-6 p-3 bg-gray-50 rounded text-sm text-gray-600'>
    <div className='flex justify-between items-center'>
      <span>
        Showing {totalCount} opportunities
      </span>
      <div className='flex items-center gap-4'>
        {hasValidationError && (
          <span className='text-yellow-600 font-medium'>
            ⚠️ Validation Issues
          </span>
        )}
        <button
          onClick={onRefresh}
          className='text-blue-600 hover:text-blue-800 underline'
        >
          Refresh Data
        </button>
      </div>
    </div>
  </div>
); 