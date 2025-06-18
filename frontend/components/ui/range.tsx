import React from 'react';
import { Slider } from './slider';
import { cn } from '@/lib/utils';

interface RangeProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  className?: string;
  showLabels?: boolean;
  showValue?: boolean;
  disabled?: boolean;
}

export const Range = React.forwardRef<HTMLDivElement, RangeProps>(
  ({
    value,
    onChange,
    min = 0,
    max = 100,
    step = 1,
    className,
    showLabels = false,
    showValue = false,
    disabled = false,
    ...props
  }, ref) => {
    return (
      <div ref={ref} className={cn('space-y-3', className)} {...props}>
        <div className='relative'>
          <Slider
            value={[value]}
            onValueChange={(values) => onChange(values[0])}
            min={min}
            max={max}
            step={step}
            disabled={disabled}
            className={cn(
              'w-full',
              '[&>span[data-slot="slider-track"]]:bg-gradient-to-r [&>span[data-slot="slider-track"]]:from-red-200 [&>span[data-slot="slider-track"]]:via-yellow-200 [&>span[data-slot="slider-track"]]:to-yellow-200',
              '[&>span[data-slot="slider-range"]]:bg-gradient-to-r [&>span[data-slot="slider-range"]]:from-red-500 [&>span[data-slot="slider-range"]]:via-yellow-500 [&>span[data-slot="slider-range"]]:to-yellow-500',
              '[&>span[data-slot="slider-thumb"]]:border-blue-500 [&>span[data-slot="slider-thumb"]]:size-5 [&>span[data-slot="slider-thumb"]]:shadow-lg'
            )}
          />
        </div>
        {showLabels && (
          <div className='flex justify-between text-xs text-gray-500'>
            <span>{min}%</span>
            <span>{Math.round(max * 0.25)}%</span>
            <span>{Math.round(max * 0.5)}%</span>
            <span>{Math.round(max * 0.75)}%</span>
            <span>{max}%</span>
          </div>
        )}
        {showValue && (
          <div className='text-center'>
            <span className='text-lg font-semibold text-blue-600'>{value}%</span>
          </div>
        )}
      </div>
    );
  }
);

Range.displayName = 'Range'; 
