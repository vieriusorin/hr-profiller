import { 
  isValidGrade, 
  isValidGradeArray, 
  validateAndSanitizeGrades,
  validateOpportunityFilters,
  createSafeFilters 
} from '../filter-validation';
import { Grade } from '@/shared/types';

describe('Filter Validation', () => {
  const ALL_VALID_GRADES: Grade[] = ['JT', 'T', 'ST', 'EN', 'SE', 'C', 'SC', 'SM'];

  describe('isValidGrade', () => {
    test('should validate all new grade values', () => {
      ALL_VALID_GRADES.forEach(grade => {
        expect(isValidGrade(grade)).toBe(true);
      });
    });

    test('should reject invalid grade values', () => {
      const invalidGrades = ['INVALID', 'L', 'M', 'SENIOR', ''];
      invalidGrades.forEach(grade => {
        expect(isValidGrade(grade)).toBe(false);
      });
    });
  });

  describe('isValidGradeArray', () => {
    test('should validate arrays with all valid grades', () => {
      expect(isValidGradeArray(ALL_VALID_GRADES)).toBe(true);
      expect(isValidGradeArray(['JT', 'SE', 'SM'])).toBe(true);
      expect(isValidGradeArray([])).toBe(true);
    });

    test('should reject arrays with any invalid grades', () => {
      expect(isValidGradeArray(['JT', 'INVALID', 'SE'])).toBe(false);
      expect(isValidGradeArray(['L', 'M'])).toBe(false); // Old grades
    });
  });

  describe('validateAndSanitizeGrades', () => {
    test('should filter out invalid grades and keep valid ones', () => {
      const input = ['JT', 'INVALID', 'SE', 'L', 'SM'];
      const result = validateAndSanitizeGrades(input);
      expect(result).toEqual(['JT', 'SE', 'SM']);
    });

    test('should handle empty arrays', () => {
      expect(validateAndSanitizeGrades([])).toEqual([]);
    });

    test('should handle all invalid grades', () => {
      const result = validateAndSanitizeGrades(['INVALID', 'L', 'M']);
      expect(result).toEqual([]);
    });
  });

  describe('validateOpportunityFilters', () => {
    test('should validate correct filter structure', () => {
      const validFilters = {
        client: 'Test Client',
        grades: ['JT', 'SE', 'SM'] as Grade[],
        needsHire: 'yes' as const,
      };

      const result = validateOpportunityFilters(validFilters);
      expect(result.isValid).toBe(true);
      expect(result.filters).toEqual(validFilters);
    });

    test('should reject invalid filter structure', () => {
      const invalidFilters = {
        client: 'Test Client',
        grades: ['INVALID', 'L'], // Invalid grades
        needsHire: 'maybe', // Invalid needsHire
      };

      const result = validateOpportunityFilters(invalidFilters);
      expect(result.isValid).toBe(false);
      expect(result.errors).toBeDefined();
    });
  });

  describe('createSafeFilters', () => {
    test('should create safe filters with valid inputs', () => {
      const rawFilters = {
        client: 'Test Client',
        grades: ['JT', 'SE', 'SM'],
        needsHire: 'yes',
      };

      const result = createSafeFilters(rawFilters);
      expect(result).toEqual({
        client: 'Test Client',
        grades: ['JT', 'SE', 'SM'],
        needsHire: 'yes',
      });
    });

    test('should sanitize invalid inputs and provide defaults', () => {
      const rawFilters = {
        client: 'Test Client',
        grades: ['JT', 'INVALID', 'L', 'SE'], // Mix of valid and invalid
        needsHire: 'maybe', // Invalid
      };

      const result = createSafeFilters(rawFilters);
      expect(result).toEqual({
        client: 'Test Client',
        grades: ['JT', 'SE'], // Only valid grades kept
        needsHire: 'all', // Default fallback
      });
    });

    test('should handle completely invalid input', () => {
      const rawFilters = {
        client: '',
        grades: ['INVALID', 'L', 'M'], // All invalid
        needsHire: 'invalid',
      };

      const result = createSafeFilters(rawFilters);
      expect(result).toEqual({
        client: '',
        grades: [], // Empty array for all invalid
        needsHire: 'all', // Default fallback
      });
    });
  });
}); 