import { Label } from '@/components/ui/label';

export const RoleComments = ({ comments }: { comments: string }) => (
  <div className='mt-4'>
    <Label className='text-sm font-medium'>Comments</Label>
    <p className='text-sm text-gray-600'>{comments}</p>
  </div>
); 