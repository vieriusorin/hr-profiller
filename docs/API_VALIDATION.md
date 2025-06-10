# API Validation with Zod

This document describes the comprehensive Zod validation system implemented for server data validation in the HR Profiller application.

## Overview

We've implemented a robust data validation layer that:

- ✅ **Validates all server responses** using Zod schemas
- ✅ **Provides type safety** with runtime validation
- ✅ **Handles validation errors gracefully** with fallback data
- ✅ **Avoids type duplication** by inferring TypeScript types from Zod schemas
- ✅ **Integrates seamlessly** with TanStack Query
- ✅ **Offers detailed error reporting** for debugging

## Architecture

### 1. Zod Schemas (`app/shared/schemas/api-schemas.ts`)

Comprehensive schemas for all API data types:

```typescript
// Base schemas
export const GradeSchema = z.enum(['JT', 'T', 'ST', 'EN', 'SE', 'C', 'SC', 'SM']);
export const OpportunityStatusSchema = z.enum(['In Progress', 'On Hold', 'Done']);
export const RoleStatusSchema = z.enum(['Open', 'Staffed', 'Won', 'Lost']);

// Entity schemas
export const MemberSchema = z.object({
  id: z.number().int().positive(),
  fullName: z.string().min(1, 'Member name is required'),
  actualGrade: GradeSchema,
  allocation: z.number().min(0).max(100),
  availableFrom: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format'),
});

export const OpportunitySchema = z.object({
  id: z.number().int().positive(),
  clientName: z.string().min(1, 'Client name is required'),
  opportunityName: z.string().min(1, 'Opportunity name is required'),
  openDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format'),
  expectedStartDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format'),
  probability: z.number().min(0).max(100),
  status: OpportunityStatusSchema,
  roles: z.array(RoleSchema),
});

// Type inference - no duplication!
export type Opportunity = z.infer<typeof OpportunitySchema>;
export type Member = z.infer<typeof MemberSchema>;
```

### 2. Validated API Wrapper (`app/shared/lib/api/validated-api.ts`)

Wraps the existing API with validation:

```typescript
export const validatedOpportunityApi = {
  async getInProgressOpportunities(): Promise<ValidatedApiResult<Opportunity[]>> {
    try {
      const rawData = await opportunityApi.getInProgressOpportunities();
      const validation = validateOpportunities(rawData);
      
      if (validation.success) {
        return { success: true, data: validation.data };
      }
      
      // Fallback: filter out invalid items, keep valid ones
      const fallbackData = safeParseOpportunities(rawData);
      
      return {
        success: false,
        error: new ApiValidationError(validation.error, 'getInProgressOpportunities', rawData),
        fallbackData,
      };
    } catch (error) {
      return { success: false, error };
    }
  },
  // ... other methods
};
```

### 3. Enhanced Error Handling

```typescript
export class ApiValidationError extends Error {
  constructor(
    public originalError: z.ZodError,
    public endpoint: string,
    public data: unknown
  ) {
    super(`Validation failed for ${endpoint}: ${originalError.message}`);
  }

  getFormattedErrors() {
    return this.originalError.format();
  }

  getErrorsForField(field: string) {
    return this.originalError.formErrors.fieldErrors[field] || [];
  }
}
```

### 4. Safe Parsing with Fallbacks

```typescript
export const safeParseOpportunities = (data: unknown): Opportunity[] => {
  const result = validateOpportunities(data);
  if (result.success) {
    return result.data;
  }
  
  console.error('Failed to validate opportunities data:', result.error.format());
  
  // Try to salvage individual opportunities
  if (Array.isArray(data)) {
    const validOpportunities: Opportunity[] = [];
    data.forEach((item, index) => {
      const itemResult = validateOpportunity(item);
      if (itemResult.success) {
        validOpportunities.push(itemResult.data);
      } else {
        console.warn(`Skipping invalid opportunity at index ${index}`);
      }
    });
    return validOpportunities;
  }
  
  return []; // Safe fallback
};
```

## Usage Patterns

### 1. In TanStack Query Hooks

```typescript
export const useOpportunitiesQuery = () => {
  const inProgressQuery = useQuery({
    queryKey: queryKeys.opportunities.inProgress(),
    queryFn: async () => {
      const result = await validatedOpportunityApi.getInProgressOpportunities();
      
      if (result.success) {
        return result.data; // Fully validated Opportunity[]
      }
      
      // Use fallback data if available
      if (result.fallbackData && result.fallbackData.length > 0) {
        console.warn('Using fallback data:', result.error);
        return result.fallbackData;
      }
      
      throw result.error;
    },
  });

  return {
    opportunities: inProgressQuery.data || [],
    validationError: getValidationError(),
    hasValidationError: getValidationError() !== null,
    // ... other fields
  };
};
```

### 2. In React Components

```typescript
const OpportunityList = () => {
  const { opportunities, validationError, hasValidationError, refetch } = useOpportunitiesQuery();

  if (validationError) {
    return (
      <div>
        <ApiErrorDisplay 
          error={validationError} 
          onRetry={refetch}
          showDetails={process.env.NODE_ENV === 'development'}
        />
        {/* Still show fallback data if available */}
        {opportunities.length > 0 && (
          <div className="bg-yellow-50 p-3 mb-4">
            ⚠️ Showing {opportunities.length} partially validated items
          </div>
        )}
      </div>
    );
  }

  return (
    <div>
      {opportunities.map(opportunity => (
        <OpportunityCard 
          key={opportunity.id} 
          opportunity={opportunity}
          disabled={hasValidationError} // Disable actions if data is questionable
        />
      ))}
    </div>
  );
};
```

### 3. Form Validation

```typescript
const CreateOpportunityForm = () => {
  const [errors, setErrors] = useState<any>(null);
  
  const handleSubmit = async (formData: CreateOpportunityInput) => {
    const result = await validatedOpportunityApi.createOpportunity(formData);
    
    if (result.success) {
      // Success handling
    } else if (result.error instanceof ApiValidationError) {
      // Display field-specific errors
      const fieldErrors = result.error.getFormattedErrors();
      setErrors(fieldErrors);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {errors?.clientName && (
        <p className="text-red-600">{errors.clientName._errors[0]}</p>
      )}
      {/* ... form fields */}
    </form>
  );
};
```

## Benefits

### 1. **Type Safety with Runtime Validation**
- TypeScript types are automatically inferred from Zod schemas
- Runtime validation catches data inconsistencies the compiler can't
- No duplicate type definitions

### 2. **Graceful Error Handling**
- Invalid data items are filtered out automatically
- Fallback data allows partial functionality
- Detailed error reporting for debugging

### 3. **Developer Experience**
- Clear error messages with field-level details
- Visual indicators for validation issues
- Development-mode error details

### 4. **Production Resilience**
- Application continues working with partial data
- Automatic retry mechanisms
- User-friendly error messages

## Error Scenarios Handled

### 1. **Complete Validation Failure**
```typescript
// Server returns completely malformed data
// Result: Show error UI with retry option
```

### 2. **Partial Validation Failure**
```typescript
// Server returns mix of valid and invalid items
// Result: Show valid items + warning about filtered data
```

### 3. **Field-Level Validation Errors**
```typescript
// Individual fields fail validation
// Result: Show field-specific error messages
```

### 4. **Network Errors**
```typescript
// API call fails completely
// Result: Standard error handling with retry
```

## Testing Strategy

### 1. **Schema Validation Tests**
```typescript
describe('OpportunitySchema', () => {
  it('should validate valid opportunity', () => {
    expect(() => OpportunitySchema.parse(validData)).not.toThrow();
  });

  it('should reject invalid opportunity', () => {
    expect(() => OpportunitySchema.parse(invalidData)).toThrow();
  });
});
```

### 2. **API Wrapper Tests**
```typescript
describe('validatedOpportunityApi', () => {
  it('should return validated data on success', async () => {
    const result = await validatedOpportunityApi.getInProgressOpportunities();
    expect(result.success).toBe(true);
  });

  it('should provide fallback data on validation failure', async () => {
    // Mock API to return mixed valid/invalid data
    const result = await validatedOpportunityApi.getInProgressOpportunities();
    expect(result.fallbackData).toBeDefined();
  });
});
```

### 3. **Integration Tests**
```typescript
describe('End-to-end validation', () => {
  it('should handle complex nested validation errors', () => {
    // Test opportunities with invalid roles, members, etc.
  });
});
```

## Performance Considerations

### 1. **Validation Performance**
- Zod is highly optimized for validation speed
- Schemas are compiled once and reused
- Validation happens on the client, reducing server load

### 2. **Memory Usage**
- Fallback data prevents memory leaks from invalid objects
- Schemas are lightweight and shared across the application

### 3. **Network Efficiency**
- Failed validations don't trigger additional network requests
- Retry logic is intelligent and doesn't spam the server

## Migration Guide

### 1. **Replace Direct API Calls**
```typescript
// Before
const data = await opportunityApi.getInProgressOpportunities();

// After
const result = await validatedOpportunityApi.getInProgressOpportunities();
const data = result.success ? result.data : result.fallbackData || [];
```

### 2. **Update Type Imports**
```typescript
// Before
import { Opportunity } from '@/shared/types';

// After
import { type Opportunity } from '@/shared/schemas/api-schemas';
```

### 3. **Add Error Handling**
```typescript
// Add validation error handling to existing components
if (error instanceof ApiValidationError) {
  // Handle validation-specific errors
}
```

## Future Enhancements

1. **Schema Versioning**: Support multiple API versions with different schemas
2. **Custom Validators**: Add business-logic validation beyond basic types
3. **Performance Monitoring**: Track validation performance and error rates
4. **Automated Testing**: Generate tests from schemas automatically
5. **Schema Documentation**: Auto-generate API documentation from schemas

---

This validation system provides a robust foundation for handling server data with confidence, ensuring type safety and graceful error handling throughout the application. 