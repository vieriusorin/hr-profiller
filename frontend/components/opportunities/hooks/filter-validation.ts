import { z } from 'zod';
import { Grade } from '@/lib/types';

const VALID_GRADES: readonly Grade[] = ['JT', 'T', 'ST', 'EN', 'SE', 'C', 'SC', 'SM'] as const;

export const isValidGrade = (value: string): value is Grade => {
  return VALID_GRADES.includes(value as Grade);
};

export const isValidNeedsHire = (value: string): value is 'yes' | 'no' | 'all' => {
  return ['yes', 'no', 'all'].includes(value);
};

export const isValidGradeArray = (values: string[]): values is Grade[] => {
  return values.every(isValidGrade);
};

export const GradeSchema = z.enum(['JT', 'T', 'ST', 'EN', 'SE', 'C', 'SC', 'SM']);

export const NeedsHireSchema = z.enum(['yes', 'no', 'all']);

export const OpportunityFiltersSchema = z.object({
  client: z.string(),
  grades: z.array(GradeSchema),
  needsHire: NeedsHireSchema,
  probability: z.tuple([z.number().min(0).max(100), z.number().min(0).max(100)]),
});

export const RawFiltersSchema = z.object({
  client: z.string().optional(),
  grades: z.array(z.string()).optional(),
  needsHire: z.string().optional(),
  probability: z.string().optional(),
});

export const validateAndSanitizeGrades = (grades: string[]): Grade[] => {
  const validGrades = grades.filter(isValidGrade);
  
  if (grades.length > 0 && validGrades.length === 0) {
    console.warn('No valid grades found in:', grades);
  }
  
  return validGrades;
};

export const validateNeedsHire = (value: string): 'yes' | 'no' | 'all' => {
  if (isValidNeedsHire(value)) {
    return value;
  }
  
  console.warn('Invalid needsHire value:', value, 'defaulting to "all"');
  return 'all';
};

export const validateOpportunityFilters = (rawFilters: unknown): {
  isValid: boolean;
  filters?: z.infer<typeof OpportunityFiltersSchema>;
  errors?: z.ZodError;
} => {
  try {
    const result = OpportunityFiltersSchema.parse(rawFilters);
    return {
      isValid: true,
      filters: result,
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        isValid: false,
        errors: error,
      };
    }
    
    return {
      isValid: false,
      errors: new z.ZodError([
        {
          code: 'custom',
          message: 'Unknown validation error',
          path: [],
        },
      ]),
    };
  }
};

export const createSafeFilters = (rawFilters: {
  client?: string;
  grades?: string[];
  needsHire?: string;
  probability?: [number, number];
}): z.infer<typeof OpportunityFiltersSchema> => {
  const client = rawFilters.client || '';
  const grades = rawFilters.grades ? validateAndSanitizeGrades(rawFilters.grades) : [];
  const needsHire = rawFilters.needsHire ? validateNeedsHire(rawFilters.needsHire) : 'all';
  
  const probability = Array.isArray(rawFilters.probability) && 
    rawFilters.probability.length === 2 &&
    typeof rawFilters.probability[0] === 'number' &&
    typeof rawFilters.probability[1] === 'number'
      ? rawFilters.probability 
      : [0, 100];
  
  const filters = {
    client,
    grades,
    needsHire,
    probability,
  };
  
  const validation = validateOpportunityFilters(filters);
  
  if (!validation.isValid) {
    console.error('Filter validation failed:', validation.errors?.format());
    return {
      client: '',
      grades: [],
      needsHire: 'all',
      probability: [0, 100],
    };
  }
  
  return validation.filters!;
}; 
