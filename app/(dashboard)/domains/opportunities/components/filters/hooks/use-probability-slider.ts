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
    console.log('External value changed to:', value, 'current local:', localValue);
    
    // If we just initiated a reset, don't sync external changes yet
    if (resetInitiatedRef.current) {
      console.log('Reset was initiated, checking if external value matches reset...');
      if (value[0] === 0 && value[1] === 100) {
        console.log('External value matches reset, clearing reset flag');
        resetInitiatedRef.current = false;
        // Don't call setLocalValue here since we already set it in resetValue
        return;
      } else {
        console.log('External value does not match reset, will sync after reset completes');
        // Don't sync yet, let the reset complete first
        return;
      }
    }
    
    setLocalValue(value);
  }, [value]);

  // When debounced value differs, propagate external change
  useEffect(() => {
    // Don't trigger debounced updates if we just reset
    if (resetInitiatedRef.current) {
      console.log('Ignoring debounced update because reset is in progress');
      return;
    }
    
    if (debouncedLocalValue[0] !== value[0] || debouncedLocalValue[1] !== value[1]) {
      console.log('Debounced value changed, calling onChange:', debouncedLocalValue);
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
    console.log('Resetting probability range to:', resetRange);
    console.log('Current localValue before reset:', localValue);
    console.log('Current external value:', value);
    
    // Set flag to prevent external sync from overriding our reset
    resetInitiatedRef.current = true;
    
    // Update local state immediately for UI feedback
    setLocalValue(resetRange);
    
    // Update URL state
    onChangeRef.current(resetRange);
    console.log('Reset complete, called onChange with:', resetRange);
    
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
