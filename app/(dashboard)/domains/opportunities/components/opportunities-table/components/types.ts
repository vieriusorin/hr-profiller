import type { FlattenedRow } from '../types';

export interface OpportunitiesTableRowProps {
    row: FlattenedRow;
    showActions: boolean;
    onAddRole?: (opportunityId: string) => void;
    onUpdateRole?: (opportunityId: string, roleId: string, status: string) => void;
    onMoveToHold?: (opportunityId: string) => void;
    onMoveToInProgress?: (opportunityId: string) => void;
    onMoveToCompleted?: (opportunityId: string) => void;
  }