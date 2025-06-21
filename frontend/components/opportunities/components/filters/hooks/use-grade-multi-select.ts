import { useState, useMemo } from 'react';
import { GRADE_OPTIONS } from '@/shared/lib/constants/grades';
import type { Grade } from '@/lib/types';

import type { UseGradeMultiSelectParams, UseGradeMultiSelectHandlers } from '../types';
export const useGradeMultiSelect = (
  { selectedGrades, placeholder }: UseGradeMultiSelectParams,
  { onGradesChange }: UseGradeMultiSelectHandlers
) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleGradeToggle = (gradeValue: Grade) => {
    const isSelected = selectedGrades.includes(gradeValue);
    if (isSelected) {
      onGradesChange(selectedGrades.filter((g) => g !== gradeValue));
    } else {
      onGradesChange([...selectedGrades, gradeValue]);
    }
  };

  const displayText = useMemo(() => {
    if (selectedGrades.length === 0) {
      return placeholder;
    }
    if (selectedGrades.length === 1) {
      const grade = GRADE_OPTIONS.find((g) => g.value === selectedGrades[0]);
      return grade?.label || selectedGrades[0];
    }
    return `${selectedGrades.length} grades selected`;
  }, [selectedGrades, placeholder]);

  return {
    isOpen,
    setIsOpen,
    handleGradeToggle,
    displayText,
  } as const;
}; 
