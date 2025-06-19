# 🎯 Single Source of Truth - Type System Architecture

Our codebase follows a **single source of truth** pattern for all type definitions, ensuring consistency and automatic propagation of changes throughout the application.

## 📊 Type Hierarchy

```
┌─────────────────────┐
│   Database Schema   │  ← Single Source of Truth
│    (Drizzle ORM)    │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│   Schema Types      │  ← Auto-generated from schema
│ (schema.types.ts)   │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ Presentation Types  │  ← Schema + Computed Fields
│(presentation.types) │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│   Domain Entities   │  ← Implements Schema Types
│     & Services      │
└─────────────────────┘
           │
           ▼
┌─────────────────────┐
│    Presenters       │  ← Uses Presentation Types
│   & Controllers     │
└─────────────────────┘
```

## 🔧 Implementation

### **1. Database Schema (Drizzle)**
```typescript
// db/schema/opportunities.schema.ts
export const opportunities = pgTable('opportunities', {
  id: uuid('id').primaryKey().defaultRandom(),
  opportunityName: varchar('opportunity_name', { length: 255 }).notNull(),
  clientId: uuid('client_id').references(() => clients.id),
  // ... other fields
});
```

### **2. Schema Types (Auto-generated)**
```typescript
// src/shared/types/schema.types.ts
export type TypeOpportunity = typeof opportunities.$inferSelect;
export type TypeNewOpportunity = typeof opportunities.$inferInsert;
```

### **3. Presentation Types (Schema + Computed)**
```typescript
// src/shared/types/presentation.types.ts
export interface OpportunityPresentation extends TypeOpportunity {
  // Computed fields from business logic
  isHighProbability: boolean;
  duration: number | null;
  isExpiringSoon: boolean;
}
```

### **4. Domain Entities (Implements Schema)**
```typescript
// src/domain/opportunity/entities/opportunity.entity.ts
export class Opportunity implements TypeOpportunity {
  constructor(data: TypeOpportunity) {
    Object.assign(this, data);
  }
  
  // Business methods
  isHighProbability(): boolean { ... }
  getDuration(): number | null { ... }
  isExpiringSoon(): boolean { ... }
}
```

### **5. Presenters (Uses Presentation Types)**
```typescript
// src/interfaces/presenters/opportunity.presenter.ts
export class OpportunityPresenter extends EnhancedBasePresenter<Opportunity, OpportunityPresentation> {
  present(opportunity: Opportunity): OpportunityPresentation {
    return {
      ...opportunity,  // All schema fields automatically
      
      // Add computed fields
      isHighProbability: opportunity.isHighProbability(),
      duration: opportunity.getDuration(),
      isExpiringSoon: opportunity.isExpiringSoon(),
    };
  }
}
```

## ✨ Benefits

### **🔄 Automatic Propagation**
When you add a field to the database schema:
1. **Schema types update automatically** (Drizzle inference)
2. **Presentation types inherit new field** (extends TypeOpportunity)
3. **TypeScript catches missing mappings** (compilation errors guide you)
4. **Entities get new properties** (Object.assign spreads all fields)
5. **Presenters include new data** (spread operator includes everything)

### **🛡️ Type Safety**
- **No manual interface duplication**
- **Compile-time validation** of schema changes
- **Impossible to have mismatched types**
- **IntelliSense shows all available fields**

### **🚀 Developer Experience**
- **Add field once** (in schema)
- **Everything else updates automatically**
- **Clear separation of concerns**
- **Predictable patterns across codebase**

## 📋 Best Practices

### **✅ DO:**
- Define fields only in database schema
- Use `TypeOpportunity` for entities and repositories
- Extend schema types for presentation layers
- Let TypeScript guide you to missing implementations

### **❌ DON'T:**
- Manually duplicate field definitions
- Create interfaces that mirror schema types
- Hardcode field lists in multiple places
- Ignore TypeScript compilation errors

## 🔄 Example: Adding a New Field

**1. Add to Schema:**
```typescript
// db/schema/opportunities.schema.ts
export const opportunities = pgTable('opportunities', {
  // ... existing fields
  priority: varchar('priority', { length: 50 }), // NEW FIELD
});
```

**2. TypeScript Will Automatically:**
- Update `TypeOpportunity` to include `priority`
- Update `OpportunityPresentation` to include `priority`
- Show compilation errors where `priority` is missing
- Guide you to update entity constructor, presenters, etc.

**3. Update Business Logic (if needed):**
```typescript
// If the field needs special handling
present(opportunity: Opportunity): OpportunityPresentation {
  return {
    ...opportunity,                    // Includes new 'priority' field
    priority: opportunity.priority,    // Or transform it
    
    // Computed fields
    isHighProbability: opportunity.isHighProbability(),
    duration: opportunity.getDuration(),
    isExpiringSoon: opportunity.isExpiringSoon(),
  };
}
```

## 🎯 Architecture Benefits

### **Consistency**
- All parts of the application use the same field definitions
- Impossible to have schema drift between layers

### **Maintainability**
- Schema changes propagate automatically
- Clear, predictable patterns for new developers

### **Type Safety**
- Full TypeScript support throughout the stack
- Compile-time validation of data transformations

### **DRY Principle**
- Define once, use everywhere
- No duplicate interface definitions

---

**🎉 This pattern scales perfectly as your application grows, ensuring type safety and consistency across all layers!** 