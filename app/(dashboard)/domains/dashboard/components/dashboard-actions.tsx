import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { ViewToggle } from '@/app/(dashboard)/domains/opportunities/components/view-toggle/view-toggle';
import { DashboardActionsProps } from '../types';

export const DashboardActions = ({ 
  currentView, 
  onViewChange, 
  onNewOpportunity 
}: DashboardActionsProps) => {
  return (
    <div className='flex items-center gap-4'>
      <ViewToggle 
        currentView={currentView} 
        onViewChange={onViewChange} 
      />
      
      <Button 
        className='flex items-center gap-2'
        onClick={onNewOpportunity}
      >
        <Plus className='h-4 w-4' />
        New Opportunity
      </Button>
    </div>
  );
}; 