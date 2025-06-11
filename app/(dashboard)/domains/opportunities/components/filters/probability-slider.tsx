'use client';

import React from 'react';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import type { ProbabilitySliderProps } from './types';
import { useProbabilitySlider } from './hooks/use-probability-slider';

export const ProbabilitySlider = ({ value, onChange, className }: ProbabilitySliderProps) => {
  const { localValue, handleSliderChange, handleInputChange, resetValue, isActive } =
    useProbabilitySlider({ value }, { onChange });

  const [min, max] = localValue;

  return (
    <div className={className}>
      <div className='flex items-center justify-between mb-2'>
        <Label className='text-sm'>Probability Range (%)</Label>
        {isActive && (
          <Button
            variant='ghost'
            size='sm'
            onClick={resetValue}
            className='h-auto px-2 py-1 text-xs'
          >
            <X className='h-3 w-3 mr-1' />
            Reset
          </Button>
        )}
      </div>
      <div className='flex items-center gap-4'>
        <Input
          type='number'
          value={min}
          onChange={(e) => handleInputChange('min', e.target.value)}
          min={0}
          max={100}
          className='w-[70px]'
          aria-label='Minimum probability'
        />
        <Slider
          value={localValue}
          onValueChange={handleSliderChange}
          min={0}
          max={100}
          step={5}
          className='w-[150px]'
        />
        <Input
          type='number'
          value={max}
          onChange={(e) => handleInputChange('max', e.target.value)}
          min={0}
          max={100}
          className='w-[70px]'
          aria-label='Maximum probability'
        />
      </div>
    </div>
  );
}; 