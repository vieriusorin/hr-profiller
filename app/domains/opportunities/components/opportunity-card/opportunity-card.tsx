'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronDown, ChevronRight, Calendar, Building, Briefcase, Plus, Users } from 'lucide-react';
import { StatusBadge } from '../../../../shared/components/status-badge';
import { OpportunityService } from '../../services/opportunity-service';
import { RoleCard } from '../role-card/role-card';
import { useOpportunityCard } from './hooks/useOpportunityCard';
import { OpportunityCardProps } from './types';

export const OpportunityCard = ({
  opportunity,
  showActions = true,
  onAddRole,
  onMoveToHold,
  onMoveToInProgress,
  onUpdateRole
}: OpportunityCardProps) => {
  const {
    isExpanded,
    toggleExpanded,
    handleAddRole,
    handleMoveToHold,
    handleMoveToInProgress,
  } = useOpportunityCard({
    opportunityId: opportunity.id,
    onAddRole,
    onMoveToHold,
    onMoveToInProgress,
  });

  return (
    <Card className='mb-4'>
      <CardHeader>
        <div className='flex justify-between items-start'>
          <div className='flex-1'>
            <div className='flex items-center gap-3 mb-2'>
              <Button
                variant='ghost'
                size='sm'
                onClick={toggleExpanded}
              >
                {isExpanded ? 
                  <ChevronDown className='h-4 w-4' /> : 
                  <ChevronRight className='h-4 w-4' />
                }
              </Button>
              <CardTitle className='text-lg'>{opportunity.opportunityName}</CardTitle>
              <StatusBadge status={opportunity.status} />
            </div>
            <CardDescription className='flex items-center gap-4 text-sm'>
              <span className='flex items-center gap-1'>
                <Building className='h-3 w-3' />
                {opportunity.clientName}
              </span>
              <span className='flex items-center gap-1'>
                <Calendar className='h-3 w-3' />
                Start: {opportunity.expectedStartDate}
              </span>
              <span className='flex items-center gap-1'>
                <Briefcase className='h-3 w-3' />
                {opportunity.probability}% probability
              </span>
            </CardDescription>
          </div>
          
          {showActions && (
            <div className='flex gap-2'>
              <Button 
                size='sm' 
                variant='outline'
                onClick={handleAddRole}
              >
                <Plus className='h-3 w-3 mr-1' />
                Add Role
              </Button>
              {opportunity.status === 'In Progress' && (
                <Button 
                  size='sm' 
                  variant='secondary'
                  onClick={handleMoveToHold}
                >
                  Hold
                </Button>
              )}
              {opportunity.status === 'On Hold' && (
                <Button 
                  size='sm' 
                  variant='default'
                  onClick={handleMoveToInProgress}
                >
                  Resume
                </Button>
              )}
            </div>
          )}
        </div>
        
        <div className='flex gap-2'>
          <Badge variant='outline'>{opportunity.roles.length} roles</Badge>
          {OpportunityService.hasHiringNeeds(opportunity) && (
            <Badge className='bg-orange-100 text-orange-800'>Hiring needed</Badge>
          )}
        </div>
      </CardHeader>
      
      {isExpanded && (
        <CardContent>
          <div className='border-t pt-4'>
            <h4 className='font-semibold mb-3 flex items-center gap-2'>
              <Users className='h-4 w-4' />
              Roles for {opportunity.opportunityName}
            </h4>
            {opportunity.roles.length === 0 ? (
              <p className='text-gray-500 italic'>No roles added yet</p>
            ) : (
              <div className='space-y-3'>
                {opportunity.roles.map((role) => (
                  <RoleCard
                    key={role.id}
                    role={role}
                    showActions={showActions}
                    onUpdateStatus={(roleId, status) => onUpdateRole?.(opportunity.id, roleId, status)}
                  />
                ))}
              </div>
            )}
          </div>
        </CardContent>
      )}
    </Card>
  );
}; 