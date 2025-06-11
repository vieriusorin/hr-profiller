import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { CheckCircle, UserCheck, XCircle } from 'lucide-react';
import { RoleStatus } from '@/shared/types';

interface RoleStatusActionsProps {
  status: RoleStatus;
  show: boolean;
  onStatusUpdate: (status: RoleStatus) => void;
}

export const RoleStatusActions = ({ status, show, onStatusUpdate }: RoleStatusActionsProps) => {
  if (!show || status !== 'Open') {
    return null;
  }

  return (
    <div className='mt-4 pt-3 border-t border-gray-200'>
      <Label className='text-sm font-medium mb-2 block'>Update Role Status:</Label>
      <div className='flex gap-2'>
        <Button
          size='sm'
          variant='outline'
          className='text-green-600 border-green-200 hover:bg-green-50'
          onClick={() => onStatusUpdate('Won')}
        >
          <CheckCircle className='h-3 w-3 mr-1 text-green-600' />
          Won
        </Button>
        <Button
          size='sm'
          variant='outline'
          className='text-yellow-600 border-yellow-200 hover:bg-yellow-50'
          onClick={() => onStatusUpdate('Staffed')}
        >
          <UserCheck className='h-3 w-3 mr-1 text-yellow-600' />
          Staffed
        </Button>
        <Button
          size='sm'
          variant='outline'
          className='text-red-600 border-red-200 hover:bg-red-50'
          onClick={() => onStatusUpdate('Lost')}
        >
          <XCircle className='h-3 w-3 mr-1 text-red-600' />
          Lost
        </Button>
      </div>
      <p className='text-xs text-gray-500 mt-2'>
        💡 The opportunity will automatically move to "Completed" when all roles are resolved
      </p>
    </div>
  );
}; 
