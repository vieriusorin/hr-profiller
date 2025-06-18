import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { OpportunityCardActionsProps } from '../types';

export const OpportunityCardActions = ({
  status,
  onAddRole,
  onMoveToHold,
  onMoveToInProgress,
  onMoveToCompleted,
}: OpportunityCardActionsProps) => {
  return (
    <div className='flex gap-2'>
      <Button size='sm' variant='outline' onClick={onAddRole}>
        <Plus className='h-3 w-3 mr-1' />
        Add Role
      </Button>
      {status === 'In Progress' && (
        <>
          <Button size='sm' variant='secondary' onClick={onMoveToHold}>
            Hold
          </Button>
          <Button size='sm' variant='default' onClick={onMoveToCompleted}>
            Complete
          </Button>
        </>
      )}
      {status === 'On Hold' && (
        <>
          <Button size='sm' variant='default' onClick={onMoveToInProgress}>
            Resume
          </Button>
          <Button size='sm' variant='default' onClick={onMoveToCompleted}>
            Complete
          </Button>
        </>
      )}
    </div>
  );
}; 