'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Filter, Search, X, AlertTriangle } from 'lucide-react';
import { GRADE_OPTIONS } from '@/shared/lib/constants/grades';
import { useOpportunityFilters } from '../../hooks/useOpportunityFilters';
import { GradeMultiSelect } from './grade-multi-select';
import { ProbabilitySlider } from './probability-slider';
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
        <div className='flex gap-6 flex-wrap items-end'>
          <div className='grid w-full max-w-sm items-center gap-1.5'>
            <Label htmlFor='client-search'>Client</Label>
            <div className='flex items-center gap-2'>
              <Search className='h-4 w-4' />
              <Input
                id='client-search'
                placeholder='Search client...'
                value={clientInput}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateClientInput(e.target.value)}
                className='w-48'
              />
            </div>
          </div>
          
          <div className='grid w-full max-w-xs items-center gap-1.5'>
            <Label>Grades</Label>
            <GradeMultiSelect
              selectedGrades={filters.grades}
              onGradesChange={updateGrades}
              placeholder='Filter by grades'
            />
          </div>
          
          <div className='grid w-full max-w-xs items-center gap-1.5'>
            <Label>Hiring Need</Label>
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

          <div className='grid w-full max-w-sm items-center gap-1.5'>
            <ProbabilitySlider
              value={filters.probability}
              onChange={(value) => updateFilter('probability', value)}
            />
          </div>
        </div>
        
        {hasActiveFilters && (
          <div className='mt-4 pt-4 border-t text-sm text-gray-600'>
            <strong>Active filters:</strong> {[
              filters.client && `Client: "${filters.client}"`,
              getGradeDisplayText(),
              filters.needsHire !== 'all' && `Needs Hire: ${filters.needsHire === 'yes' ? 'Yes' : 'No'}`,
              filters.probability && (filters.probability[0] !== 0 || filters.probability[1] !== 100) && `Probability: ${filters.probability[0]}-${filters.probability[1]}%`
            ].filter(Boolean).join('  ·  ')}
            
            {!isFiltersValid && (
              <div className='mt-2 text-amber-600 text-xs flex items-center gap-1'>
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
