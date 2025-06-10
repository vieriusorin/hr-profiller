'use client';

import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { ChangeEvent } from 'react';

interface ProbabilitySliderProps {
  value: [number, number];
  onChange: (value: [number, number]) => void;
  className?: string;
}

export const ProbabilitySlider = ({
  value,
  onChange,
  className,
}: ProbabilitySliderProps) => {
  const [min, max] = value;

  const handleSliderChange = (newRange: number[]) => {
    onChange([newRange[0], newRange[1]]);
  };

  const handleInputChange = (
    part: 'min' | 'max',
    e: ChangeEvent<HTMLInputElement>
  ) => {
    const num = e.target.value === '' ? (part === 'min' ? 0 : 100) : Number(e.target.value);

    let newRange: [number, number] = [...value];
    
    if (part === 'min') {
      newRange[0] = num;
    } else {
      newRange[1] = num;
    }

    // Prevent invalid ranges
    if (newRange[0] > newRange[1]) {
      // If min becomes greater than max, set max to be equal to min
      newRange[1] = newRange[0];
    }

    if (newRange[0] < 0) newRange[0] = 0;
    if (newRange[1] > 100) newRange[1] = 100;

    onChange(newRange);
  };

  const resetValue = () => {
    onChange([0, 100]);
  };

  const isActive = value[0] !== 0 || value[1] !== 100;

  return (
    <div className={className}>
      <div className="flex items-center justify-between mb-2">
        <Label className="text-sm">Probability Range (%)</Label>
        {isActive && (
          <Button
            variant="ghost"
            size="sm"
            onClick={resetValue}
            className="h-auto px-2 py-1 text-xs"
          >
            <X className="h-3 w-3 mr-1" />
            Reset
          </Button>
        )}
      </div>
      <div className="flex items-center gap-4">
        <Input
          type="number"
          value={min}
          onChange={(e) => handleInputChange('min', e)}
          min={0}
          max={100}
          className="w-[70px]"
          aria-label="Minimum probability"
        />
        <Slider
          value={value}
          onValueChange={handleSliderChange}
          min={0}
          max={100}
          step={5}
          className="w-[150px]"
        />
        <Input
          type="number"
          value={max}
          onChange={(e) => handleInputChange('max', e)}
          min={0}
          max={100}
          className="w-[70px]"
          aria-label="Maximum probability"
        />
      </div>
    </div>
  );
}; 