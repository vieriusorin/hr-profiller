import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { DashboardActionsProps } from '../_types';
import { ViewToggle } from '@/components/opportunities/components/view-toggle/view-toggle';

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