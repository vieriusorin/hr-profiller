import type { FlattenedRow } from '../types';
import type { OpportunityActionCallbacks } from '../../../types';

export interface OpportunitiesTableRowProps extends OpportunityActionCallbacks {
  row: FlattenedRow;
  showActions: boolean;
}

export interface UseOpportunitiesTableRowCallbacks extends OpportunityActionCallbacks {}