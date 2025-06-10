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

## Key Files Created

### 1. `app/shared/schemas/api-schemas.ts`
Comprehensive Zod schemas for all API data types with type inference.

### 2. `app/shared/lib/api/validated-api.ts`  
Validated API wrapper with enhanced error handling and fallback data.

### 3. `app/shared/components/ui/api-error-display.tsx`
Reusable components for displaying validation errors in the UI.

### 4. `tests/api-validation.test.ts`
Comprehensive test examples for validation scenarios.

## Architecture Benefits

### **Type Safety + Runtime Validation**
```typescript
// Single source of truth - no type duplication
export const OpportunitySchema = z.object({
  id: z.number().int().positive(),
  clientName: z.string().min(1, 'Client name is required'),
  // ... other fields
});

// TypeScript types inferred automatically
export type Opportunity = z.infer<typeof OpportunitySchema>;
```

### **Graceful Error Handling**
```typescript
// API wrapper handles validation errors gracefully
const result = await validatedOpportunityApi.getInProgressOpportunities();

if (result.success) {
  return result.data; // Fully validated
} else {
  // Use fallback data (filters out invalid items)
  return result.fallbackData || [];
}
```

### **Fallback Data Strategy**
- Invalid data items are automatically filtered out
- Valid items are preserved and returned as fallback
- Application continues functioning with partial data
- Users see helpful error messages

### **Enhanced Developer Experience**
- Field-level validation error messages
- Detailed error formatting for debugging
- Visual indicators for validation issues
- Development vs production error display modes

## Usage Patterns

### **TanStack Query Integration**
```typescript
const { data, error, validationError } = useQuery({
  queryFn: async () => {
    const result = await validatedOpportunityApi.getInProgressOpportunities();
    
    if (result.success) {
      return result.data; // Type: Opportunity[]
    }
    
    if (result.fallbackData) {
      console.warn('Using fallback data:', result.error);
      return result.fallbackData;
    }
    
    throw result.error;
  }
});
```

### **React Component Error Handling**
```typescript
if (validationError instanceof ApiValidationError) {
  return (
    <ApiErrorDisplay 
      error={validationError} 
      onRetry={refetch}
      showDetails={isDevelopment}
      fallbackData={data}
    />
  );
}
```

## Error Scenarios Covered

1. **Complete validation failure** → Show error UI with retry
2. **Partial validation failure** → Show valid data + warning  
3. **Field-level errors** → Detailed field-specific messages
4. **Network errors** → Standard error handling with retry
5. **Schema mismatches** → Graceful degradation with fallbacks

## Implementation Highlights

### **Comprehensive Schemas**
- All 8 grade levels (JT, T, ST, EN, SE, C, SC, SM)
- Opportunity, Role, Member entities with full validation
- Form input schemas for create/update operations
- API response wrappers with success/error states

### **Smart Validation Functions**
- `validateOpportunity()` - Single item validation
- `validateOpportunities()` - Array validation  
- `safeParseOpportunities()` - Fallback parsing with filtering

### **Enhanced API Wrapper**
- Input validation before API calls
- Response validation after API calls
- Detailed error tracking with endpoint information
- Fallback data for partial failures

### **Production-Ready Error Display**
- User-friendly error messages
- Developer details in development mode
- Retry mechanisms with proper state management
- Visual indicators for data quality issues

## Testing Strategy

The validation system includes comprehensive test coverage for:
- Individual schema validation
- Mixed valid/invalid data handling
- Error message formatting
- Fallback data scenarios
- Integration with TanStack Query

## Next Steps

1. **Migrate existing query hooks** to use validated API
2. **Update components** to handle validation errors
3. **Add monitoring** for validation failure rates
4. **Extend schemas** for additional API endpoints

This validation system provides a robust foundation for handling server data with confidence, ensuring both type safety and graceful error handling throughout the application. 