import { useContext } from 'react';
import { OpportunitiesContext } from '../opportunities-table';
import { Opportunity } from '@/app/shared/types';

export const useOpportunityContext = (opportunityId: string) => {
  const { opportunities } = useContext(OpportunitiesContext) || {
    opportunities: [],
  };

  const fullOpportunity = opportunities.find(
    (opp: Opportunity) => opp.id === opportunityId
  );

  return {
    fullOpportunity,
  };
}; 