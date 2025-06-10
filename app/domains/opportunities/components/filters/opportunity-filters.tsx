'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Filter, Search, X, AlertTriangle } from 'lucide-react';
import { GRADE_OPTIONS } from '@/shared/lib/constants/grades';
import { useOpportunityFilters } from '../../hooks/useOpportunityFilters';
import { GradeMultiSelect } from './grade-multi-select';
import { OpportunityFiltersProps } from './types';

export const OpportunityFilters = ({}: OpportunityFiltersProps) => {
  const { 
    filters, 
    clientInput, 
    updateFilters, 
    updateClientInput, 
    updateGrades, 
    clearFilters, 
    hasActiveFilters,
    isFiltersValid,
    filterValidationErrors
  } = useOpportunityFilters();

  const updateFilter = (key: keyof typeof filters, value: any) => {
    updateFilters({ [key]: value });
  };

  const getGradeDisplayText = () => {
    if (filters.grades.length === 0) return '';
    if (filters.grades.length === 1) {
      const grade = GRADE_OPTIONS.find(g => g.value === filters.grades[0]);
      return `Grade: ${grade?.label}`;
    }
    return `Grades: ${filters.grades.length} selected`;
  };

  // Log validation errors for debugging
  if (!isFiltersValid && filterValidationErrors) {
    console.warn('Filter validation errors:', filterValidationErrors.format());
  }

  return (
    <Card className='mb-4'>
      <CardHeader>
        <CardTitle className='flex items-center gap-2 justify-between'>
          <div className='flex items-center gap-2'>
            <Filter className='h-4 w-4' />
            Filters
            {!isFiltersValid && (
              <AlertTriangle className='h-4 w-4 text-amber-500' title='Filter validation errors detected' />
            )}
          </div>
          {hasActiveFilters && (
            <Button
              variant='outline'
              size='sm'
              onClick={clearFilters}
              className='text-xs'
            >
              <X className='h-3 w-3 mr-1' />
              Clear All
            </Button>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className='flex gap-4 flex-wrap'>
          <div className='flex items-center gap-2'>
            <Search className='h-4 w-4' />
            <Input
              placeholder='Search client...'
              value={clientInput}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateClientInput(e.target.value)}
              className='w-48'
            />
          </div>
          
          <GradeMultiSelect
            selectedGrades={filters.grades}
            onGradesChange={updateGrades}
            placeholder='Filter by grades'
          />
          
          <Select 
            value={filters.needsHire} 
            onValueChange={(value: string) => updateFilter('needsHire', value)}
          >
            <SelectTrigger className='w-48'>
              <SelectValue placeholder='Needs hire?' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='all'>All</SelectItem>
              <SelectItem value='yes'>Needs Hire</SelectItem>
              <SelectItem value='no'>No Hire Needed</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        {hasActiveFilters && (
          <div className='mt-3 text-sm text-gray-600'>
            Active filters: {[
              filters.client && `Client: "${filters.client}"`,
              getGradeDisplayText(),
              filters.needsHire !== 'all' && `Needs Hire: ${filters.needsHire === 'yes' ? 'Yes' : 'No'}`
            ].filter(Boolean).join(', ')}
            
            {!isFiltersValid && (
              <div className='mt-1 text-amber-600 text-xs flex items-center gap-1'>
                <AlertTriangle className='h-3 w-3' />
                Some filter values were corrected due to validation errors
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}; 