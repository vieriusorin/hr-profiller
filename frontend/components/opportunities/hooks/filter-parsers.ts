import { createParser } from 'nuqs';
import { 
  validateAndSanitizeGrades, 
  validateNeedsHire, 
  isValidGrade,
} from './filter-validation';
import { Grade } from '@/shared/types';

export const parseAsValidatedGrades = createParser({
  parse(query: string): Grade[] {
    if (!query) return [];
    
    try {
      const rawGrades = query.includes(',') 
        ? query.split(',').map(g => g.trim()).filter(Boolean)
        : [query.trim()].filter(Boolean);
      
      return validateAndSanitizeGrades(rawGrades);
    } catch (error) {
      console.warn('Failed to parse grades:', query, error);
      return [];
    }
  },
  
  serialize(grades: Grade[]): string {
    if (!grades || grades.length === 0) return '';
    
    const validGrades = grades.filter(isValidGrade);
    
    if (validGrades.length !== grades.length) {
      console.warn('Some invalid grades filtered out during serialization');
    }
    
    return validGrades.join(',');
  }
});


export const parseAsValidatedNeedsHire = createParser({
  parse(query: string): 'yes' | 'no' | 'all' {
    if (!query) return 'all';
    
    return validateNeedsHire(query);
  },
  
  serialize(value: 'yes' | 'no' | 'all'): string {
    // Additional validation before serialization
    const validated = validateNeedsHire(value);
    return validated;
  }
});

export const parseAsValidatedClient = createParser({
  parse(query: string): string {
    if (!query) return '';
    
    return query
      .replace(/<script[^>]*>.*?<\/script>/gi, '')
      .replace(/<[^>]*>/g, '')
      .trim()
      .slice(0, 100); // Limit length
  },
  
  serialize(value: string): string {
    if (!value) return '';
    
    return value
      .replace(/<script[^>]*>.*?<\/script>/gi, '')
      .replace(/<[^>]*>/g, '')
      .trim()
      .slice(0, 100);
  }
});

export const parseAsValidatedProbability = createParser({
  parse(query: string): [number, number] {
    if (!query) return [0, 100];
    
    const parts = query.split('-').map(Number);
    if (parts.length !== 2 || isNaN(parts[0]) || isNaN(parts[1])) {
      return [0, 100];
    }

    const [min, max] = parts;
    if (min < 0 || max > 100 || min > max) {
      return [0, 100];
    }
    
    return [min, max];
  },
  
  serialize(value: [number, number]): string {
    if (value[0] === 0 && value[1] === 100) {
      return '';
    }
    return `${value[0]}-${value[1]}`;
  }
}); 
