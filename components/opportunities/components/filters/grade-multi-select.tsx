'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ChevronDown, Check } from 'lucide-react';
import { GRADE_OPTIONS } from '@/shared/lib/constants/grades';
import { cn } from '@/lib/utils';
import type { GradeMultiSelectProps } from './types';
import { useGradeMultiSelect } from './hooks/use-grade-multi-select';

export const GradeMultiSelect = ({
  selectedGrades,
  onGradesChange,
  placeholder = 'Select grades...',
  className,
}: GradeMultiSelectProps) => {
  const { isOpen, setIsOpen, handleGradeToggle, displayText } = useGradeMultiSelect(
    { selectedGrades, placeholder },
    { onGradesChange }
  );

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant='outline'
          role='combobox'
          aria-expanded={isOpen}
          className={cn(
            'w-48 justify-between',
            selectedGrades.length === 0 && 'text-muted-foreground',
            className
          )}
        >
          {displayText}
          <ChevronDown className='ml-2 h-4 w-4 shrink-0 opacity-50' />
        </Button>
      </PopoverTrigger>
      <PopoverContent className='w-48 p-0' align='start'>
        <div className='max-h-60 overflow-auto'>
          <div className='p-1'>
            {GRADE_OPTIONS.map((grade) => {
              const isSelected = selectedGrades.includes(grade.value);
              return (
                <div
                  key={grade.value}
                  className='flex items-center space-x-2 rounded-sm px-2 py-1.5 text-sm hover:bg-accent hover:text-accent-foreground cursor-pointer'
                  onClick={() => handleGradeToggle(grade.value)}
                >
                  <Checkbox
                    checked={isSelected}
                    onCheckedChange={() => handleGradeToggle(grade.value)}
                    className='h-4 w-4'
                  />
                  <span className='flex-1'>{grade.label}</span>
                  {isSelected && <Check className='h-4 w-4' />}
                </div>
              );
            })}
          </div>
          {selectedGrades.length > 0 && (
            <div className='border-t border-border p-1'>
              <Button
                variant='ghost'
                size='sm'
                className='w-full text-xs'
                onClick={() => onGradesChange([])}
              >
                Clear all
              </Button>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}; 
