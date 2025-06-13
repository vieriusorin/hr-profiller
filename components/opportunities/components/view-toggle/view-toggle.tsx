import { Button } from '@/components/ui/button';
import { LayoutGrid, Table } from 'lucide-react';
import { ViewToggleProps } from './types';

export const ViewToggle = ({ currentView, onViewChange }: ViewToggleProps) => {
  return (
    <div className='flex items-center gap-1 p-1 bg-muted rounded-lg'>
      <Button
        variant={currentView === 'cards' ? 'default' : 'ghost'}
        size='sm'
        onClick={() => onViewChange('cards')}
        className='h-8'
      >
        <LayoutGrid className='h-4 w-4 mr-1' />
        Cards
      </Button>
      <Button
        variant={currentView === 'table' ? 'default' : 'ghost'}
        size='sm'
        onClick={() => onViewChange('table')}
        className='h-8'
      >
        <Table className='h-4 w-4 mr-1' />
        Table
      </Button>
    </div>
  );
}; 
