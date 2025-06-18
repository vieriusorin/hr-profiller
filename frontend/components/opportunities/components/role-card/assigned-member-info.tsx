import { Label } from '@/components/ui/label';
import { AssignedMemberInfoProps } from './types';

export const AssignedMemberInfo = ({ member }: AssignedMemberInfoProps) => (
  <div className='mt-4 p-3 bg-yellow-50 rounded-md'>
    <Label className='text-sm font-medium'>Assigned Member</Label>
    <p className='text-sm'>
      {member.name} ({member.jobGrade})
    </p>
    <p className='text-xs text-gray-600'>
      {member.position} | {member.department}
    </p>
  </div>
); 
