import { Label } from '@/components/ui/label';
import { AssignedMemberInfoProps } from './types';

export const AssignedMemberInfo = ({ member }: AssignedMemberInfoProps) => (
  <div className='mt-4 p-3 bg-yellow-50 rounded-md'>
    <Label className='text-sm font-medium'>Assigned Member</Label>
    <p className='text-sm'>
      {member.fullName} ({member.actualGrade})
    </p>
    <p className='text-xs text-gray-600'>
      Available from: {member.availableFrom} | Allocation: {member.allocation}%
    </p>
  </div>
); 
