import { TableRow, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { StatusBadge } from '@/shared/components/status-badge';
import { RoleStatusDropdown } from './role-status-dropdown';
import { useRoleRow } from '../hooks/use-role-row';
import { RoleRowProps } from './types';

export const RoleRow = ({
  row,
  showActions,
  onStatusClick,
}: RoleRowProps) => {
  const { urgencyConfig, handleRoleNameClick } = useRoleRow(row);

  return (
    <TableRow className={`${urgencyConfig.bgClass} transition-colors duration-200`}>
      <TableCell className='text-muted-foreground italic text-center'></TableCell>
      <TableCell>
        <div
          className={
            row.isFirstRowForOpportunity
              ? 'flex items-center justify-center gap-2'
              : ''
          }
        >
          {row.roleName ? (
            <span
              className='mr-auto cursor-pointer hover:text-blue-600 transition-colors'
              onClick={handleRoleNameClick}
            >
              {row.roleName}
            </span>
          ) : (
            <span className='text-muted-foreground italic'>No role name</span>
          )}
        </div>
      </TableCell>
      <TableCell>
        {row.requiredGrade && (
          <Badge variant='outline'>{row.requiredGrade}</Badge>
        )}
      </TableCell>
      <TableCell>
        {row.roleStatus && <StatusBadge status={row.roleStatus} />}
      </TableCell>
      <TableCell>
        {row.assignedMember ? (
          <span>{row.assignedMember}</span>
        ) : (
          <span className='text-muted-foreground italic'>Not assigned</span>
        )}
      </TableCell>
      <TableCell>
        {row.allocation ? (
          <span>{row.allocation}%</span>
        ) : (
          <span className='text-muted-foreground italic'>—</span>
        )}
      </TableCell>
      <TableCell>
        {row.needsHire ? (
          <Badge variant='outline' className='text-xs'>
            Hiring needed
          </Badge>
        ) : (
          <span className='text-muted-foreground italic'>—</span>
        )}
      </TableCell>

      {showActions && (
        <TableCell>
          {row.roleId && row.roleStatus === 'Open' && (
            <RoleStatusDropdown
              opportunityId={row.opportunityId}
              roleId={row.roleId}
              roleName={row.roleName}
              onStatusClick={onStatusClick}
            />
          )}
        </TableCell>
      )}

      {showActions && <TableCell></TableCell>}
    </TableRow>
  );
}; 