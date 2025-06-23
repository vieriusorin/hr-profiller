import { useState, useEffect, useRef } from 'react';
import { useDebounce } from '@/hooks/useDebounce';
import type { UseProbabilitySliderParams, UseProbabilitySliderHandlers } from '../types';

export const useProbabilitySlider = (
  { value }: UseProbabilitySliderParams,
  { onChange }: UseProbabilitySliderHandlers,
) => {
  const [localValue, setLocalValue] = useState<[number, number]>(value);
  const resetInitiatedRef = useRef(false);

  // Keep latest onChange in ref to avoid stale closure
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  // Debounce local value to limit external updates
  const debouncedLocalValue = useDebounce(localValue, 300);

  // Sync external value to local if it changes elsewhere
  useEffect(() => {

    // If we just initiated a reset, don't sync external changes yet
    if (resetInitiatedRef.current) {
      if (value[0] === 0 && value[1] === 100) {
        resetInitiatedRef.current = false;
        return;
      } else {
        return;
      }
    }

    setLocalValue(value);
  }, [value, onChange, localValue]);

  // When debounced value differs, propagate external change
  useEffect(() => {
    // Don't trigger debounced updates if we just reset
    if (resetInitiatedRef.current) {
      return;
    }

    if (debouncedLocalValue[0] !== value[0] || debouncedLocalValue[1] !== value[1]) {
      onChangeRef.current(debouncedLocalValue);
    }
  }, [debouncedLocalValue, value]);

  const handleSliderChange = (newRange: number[]) => {
    setLocalValue([newRange[0], newRange[1]] as [number, number]);
  };

  const handleInputChange = (
    part: 'min' | 'max',
    num: number | '',
  ) => {
    const numericValue = num === '' ? (part === 'min' ? 0 : 100) : Number(num);
    const newRange: [number, number] = [...localValue] as [number, number];

    if (part === 'min') {
      newRange[0] = numericValue;
    } else {
      newRange[1] = numericValue;
    }

    if (newRange[0] > newRange[1]) {
      newRange[1] = newRange[0];
    }

    if (newRange[0] < 0) newRange[0] = 0;
    if (newRange[1] > 100) newRange[1] = 100;

    setLocalValue(newRange);
  };

  const resetValue = () => {
    const resetRange: [number, number] = [0, 100];


    // Set flag to prevent external sync from overriding our reset
    resetInitiatedRef.current = true;

    // Update local state immediately for UI feedback
    setLocalValue(resetRange);

    // Update URL state
    onChangeRef.current(resetRange);

    setTimeout(() => {
      resetInitiatedRef.current = false;
      console.log('Reset flag cleared after timeout');
    }, 400);
  };

  const isActive = localValue[0] !== 0 || localValue[1] !== 100;

  return {
    localValue,
    handleSliderChange,
    handleInputChange,
    resetValue,
    isActive,
  } as const;
}; 
