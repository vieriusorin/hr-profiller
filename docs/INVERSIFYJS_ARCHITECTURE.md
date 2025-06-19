# 🏗️ InversifyJS Architecture Guide

## 📖 Overview

This document explains how we implemented **InversifyJS dependency injection** in our HR Management System, following **Clean Architecture** principles. This creates a maintainable, testable, and scalable codebase.

## 🎯 Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        🎯 CLIENT LAYER                         │
│                   HTTP Requests                                │
│                POST /api/v1/opportunities                      │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                      🌐 INTERFACES LAYER                       │
│  ┌─────────────────┐                 ┌─────────────────────────┐│
│  │   HTTP Routes   │────────────────▶│  📋 OpportunityController│
│  │ opportunities.ts│                 │    @injectable()        ││
│  └─────────────────┘                 │ @inject(TYPES.Service)  ││
│                                      └─────────────────────────┘│
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                   🏗️ INFRASTRUCTURE LAYER                      │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │              📦 InversifyJS Container                      ││
│  │            /src/infrastructure/container.ts               ││
│  │                                                           ││
│  │  ✅ Database Binding: TYPES.Database → db                 ││
│  │  ✅ Repository Binding: TYPES.OpportunityRepository       ││
│  │  ✅ Service Binding: TYPES.OpportunityService             ││
│  │  ✅ Controller Binding: TYPES.OpportunityController       ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                 │
│  ┌─────────────────────┐              ┌─────────────────────────┐│
│  │🗃️ DrizzleOpportunity│              │  💾 Database Connection ││
│  │   Repository        │              │      /db/index.ts       ││
│  │   @injectable()     │              │  Single Source of Truth ││
│  │@inject(TYPES.Database)             └─────────────────────────┘│
│  └─────────────────────┘                                       │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                       🎯 DOMAIN LAYER                          │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │                ⚙️ OpportunityService                       ││
│  │                  @injectable()                             ││
│  │           @inject(TYPES.OpportunityRepository)             ││
│  │                                                           ││
│  │  ✅ Pure Business Logic                                   ││
│  │  ✅ Auto-activation rules                                 ││
│  │  ✅ Probability calculations                              ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                 │
│  ┌─────────────────────┐              ┌─────────────────────────┐│
│  │🔌 OpportunityRepository             │ 🏛️ Opportunity Entity  ││
│  │     (interface)     │              │ implements TypeOpportunity
│  │                     │              │                         ││
│  │ ✅ findAll()        │              │ ✅ Schema-derived props ││
│  │ ✅ findById()       │              │ ✅ Business methods     ││
│  │ ✅ create()         │              │ ✅ isHighProbability()  ││
│  │ ✅ update()         │              │ ✅ getDuration()        ││
│  │ ✅ delete()         │              │                         ││
│  └─────────────────────┘              └─────────────────────────┘│
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                       📊 SCHEMA LAYER                          │
│                     🗂️ Drizzle Schema                          │
│                        /db/schema/                             │
│                                                                 │
│              ✅ Single Source of Truth                         │
│              ✅ TypeOpportunity                                │
│              ✅ TypeNewOpportunity                             │
│              ✅ Auto-generated types                           │
└─────────────────────────────────────────────────────────────────┘
```

## 🔧 Key Components

### 1. 🏷️ TYPES Symbols (Identity System)

**File:** `/src/shared/types/index.ts`

```typescript
const TYPES = {
  // Infrastructure
  Database: Symbol.for('Database'),
  
  // Repositories  
  OpportunityRepository: Symbol.for('OpportunityRepository'),
  
  // Services
  OpportunityService: Symbol.for('OpportunityService'),
  
  // Controllers
  OpportunityController: Symbol.for('OpportunityController'),
};

export type DatabaseType = NodePgDatabase<typeof schema>;
export { TYPES };
```

**Purpose:** 
- Unique identifiers for each dependency
- Prevents naming conflicts
- Type-safe dependency resolution

### 2. 📦 Container Configuration (Wiring)

**File:** `/src/infrastructure/container.ts`

```typescript
import { Container } from 'inversify';
import db from '../../db'; // ✅ Single source for database
import { TYPES, DatabaseType } from '../shared/types';

const container = new Container();

// Infrastructure bindings - Using centralized type
container.bind<DatabaseType>(TYPES.Database).toConstantValue(db);

// Repository bindings
container.bind<OpportunityRepository>(TYPES.OpportunityRepository)
  .to(DrizzleOpportunityRepository);

// Service bindings 
container.bind<OpportunityService>(TYPES.OpportunityService)
  .to(OpportunityService);

// Controller bindings
container.bind<OpportunityController>(TYPES.OpportunityController)
  .to(OpportunityController);

export { container };
```

**Purpose:**
- Central configuration for all dependencies
- Tells InversifyJS "when someone asks for X, give them Y"
- Single place to change implementations

### 3. 💉 Injectable Classes (Consumers)

#### A) Domain Service
**File:** `/src/domain/opportunity/services/opportunity.service.ts`

```typescript
import { injectable, inject } from 'inversify';
import { TYPES } from '../../../shared/types';

@injectable()
export class OpportunityService {
  constructor(
    @inject(TYPES.OpportunityRepository) 
    private readonly opportunityRepository: OpportunityRepository
  ) {}

  // ✅ Pure business logic
  async createOpportunity(data: CreateOpportunityData): Promise<Opportunity> {
    const processedData = {
      ...data,
      // Auto-activate if probability >= 80%
      isActive: data.isActive ?? (data.probability != null ? data.probability >= 80 : false),
    };
    return this.opportunityRepository.create(processedData);
  }
}
```

#### B) Repository Implementation  
**File:** `/src/infrastructure/database/repositories/drizzle-opportunity.repository.ts`

```typescript
import { injectable, inject } from 'inversify';
import { TYPES, DatabaseType } from '../../../shared/types';

@injectable()
export class DrizzleOpportunityRepository implements OpportunityRepository {
  constructor(
    @inject(TYPES.Database) 
    private readonly db: DatabaseType
  ) {}

  async findAll(): Promise<Opportunity[]> {
    const result = await this.db.select().from(opportunities);
    return result.map(this.mapToEntity);
  }
  
  // ... other methods
}
```

#### C) HTTP Controller
**File:** `/src/infrastructure/http/controllers/opportunity.controller.ts`

```typescript
import { injectable, inject } from 'inversify';
import { TYPES } from '../../../shared/types';

@injectable()
export class OpportunityController {
  constructor(
    @inject(TYPES.OpportunityService) 
    private readonly opportunityService: OpportunityService
  ) {}

  async create(req: Request, res: Response): Promise<void> {
    const opportunity = await this.opportunityService.createOpportunity(req.body);
    res.status(201).json({ status: 'success', data: opportunity });
  }
}
```

### 4. 🔌 Route Integration

**File:** `/src/infrastructure/http/routes/opportunities.ts`

```typescript
import { Router } from 'express';
import { container } from '../../container';
import { TYPES } from '../../../shared/types';

const router = Router();

// ✅ Resolve controller from container
const opportunityController = container.get<OpportunityController>(TYPES.OpportunityController);

router.get('/', (req, res) => opportunityController.getAll(req, res));
router.post('/', (req, res) => opportunityController.create(req, res));

export default router;
```

## 🔄 Dependency Flow Analysis

When a request comes in, here's exactly what happens:

```typescript
// 1️⃣ HTTP Request arrives
POST /api/v1/opportunities

// 2️⃣ Route resolves controller from container
const controller = container.get<OpportunityController>(TYPES.OpportunityController);

// 3️⃣ InversifyJS automatically creates dependency tree:
//    ┌─ OpportunityController
//    │  └─ OpportunityService (injected via @inject)
//    │     └─ OpportunityRepository (injected via @inject)  
//    │        └─ Database (injected via @inject)
//    └─ Full dependency tree created automatically! 🎉

// 4️⃣ Request processed through clean architecture layers
```

## 🏗️ Clean Architecture Compliance

```
┌─────────────────────────────────────────────────────────────┐
│                    Clean Architecture                      │
│                                                             │
│  Infrastructure ──────▶ Domain ◀────── Interface          │
│       │                   │                   │            │
│   DrizzleRepo         OpportunityService   Controller      │
│   @injectable()       @injectable()       @injectable()    │
│       │                   │                   │            │
│       └─────── InversifyJS Container ────────┘            │
│                                                             │
│  ✅ Dependencies point INWARD (Clean Architecture rule)    │
│  ✅ DI crosses boundaries safely                           │
│  ✅ Domain remains pure business logic                     │
└─────────────────────────────────────────────────────────────┘
```

## 🎓 Key Learning Patterns

### Pattern 1: Symbol-based Identity
```typescript
// ✅ DO: Use symbols to avoid string-based errors
const TYPES = {
  Database: Symbol.for('Database'), // Unique, collision-free
};

// ❌ DON'T: Use strings (typo-prone)
const TYPES = {
  Database: 'Database', // Can conflict with other strings
};
```

### Pattern 2: Interface Segregation
```typescript
// ✅ Domain defines what it needs
interface OpportunityRepository {
  findAll(): Promise<Opportunity[]>;
  // Only methods domain actually uses
}

// ✅ Infrastructure provides what domain needs
@injectable()
class DrizzleOpportunityRepository implements OpportunityRepository {
  // Implementation details hidden from domain
}
```

### Pattern 3: Factory Bindings (Advanced)
```typescript
// For complex object creation
container.bind<EmailService>(TYPES.EmailService).toDynamicValue((context) => {
  const config = context.container.get<Config>(TYPES.Config);
  return new EmailService(config.apiKey, config.timeout);
});
```

### Pattern 4: Rebinding for Testing
```typescript
// 🧪 Easy testing with DI
describe('OpportunityService', () => {
  beforeEach(() => {
    const mockRepo = mock<OpportunityRepository>();
    container.rebind(TYPES.OpportunityRepository).toConstantValue(mockRepo);
  });
  
  it('should create opportunity', () => {
    const service = container.get<OpportunityService>(TYPES.OpportunityService);
    // ✅ Service now uses mock repo!
  });
});
```

## 🚀 Benefits Achieved

| **Aspect** | **Before DI** | **After InversifyJS** |
|------------|---------------|----------------------|
| **Testing** | Hard to mock dependencies | Easy mocking with `container.rebind()` |
| **Scalability** | Manual wiring gets complex | Container handles complexity |
| **Maintainability** | Change = update many files | Change = update container binding |
| **Flexibility** | Swap implementations = code changes | Swap implementations = config change |
| **Type Safety** | Manual casting needed | Full TypeScript support |
| **Error Detection** | Runtime dependency errors | Compile-time dependency checking |

## 📁 Project Structure with DI

```
backend/
├── src/
│   ├── domain/                          # 🎯 PURE BUSINESS LOGIC
│   │   └── opportunity/
│   │       ├── entities/
│   │       │   └── opportunity.entity.ts    # Schema-derived entity
│   │       ├── repositories/
│   │       │   └── opportunity.repository.ts # Interface only
│   │       └── services/
│   │           └── opportunity.service.ts   # @injectable()
│   │
│   ├── infrastructure/                  # 🏗️ IMPLEMENTATION DETAILS
│   │   ├── container.ts                 # 📦 DI CONFIGURATION
│   │   ├── database/
│   │   │   └── repositories/
│   │   │       └── drizzle-opportunity.repository.ts # @injectable()
│   │   └── http/
│   │       ├── controllers/
│   │       │   └── opportunity.controller.ts # @injectable()
│   │       └── routes/
│   │           └── opportunities.ts
│   │
│   ├── interfaces/                      # 🌐 EXTERNAL INTERFACES
│   │   └── http/
│   │       └── routes.ts
│   │
│   └── shared/                          # 🏷️ SHARED CONCERNS
│       └── types/
│           ├── index.ts                 # TYPES symbols + DatabaseType
│           └── schema.types.ts          # Schema-derived types
│
├── db/                                  # 📊 SINGLE SOURCE OF TRUTH
│   ├── index.ts                         # Database connection
│   ├── schema.ts                        # Schema exports
│   └── schema/
│       └── opportunities.schema.ts      # Drizzle schema
│
└── docs/
    └── INVERSIFYJS_ARCHITECTURE.md     # 📖 THIS FILE
```

## 💡 Why This Architecture Rocks

1. **🔄 Dependency Direction**: All dependencies point inward (Clean Architecture)
2. **🧪 Testability**: Easy to mock any layer
3. **🔧 Maintainability**: Change implementations without touching business logic
4. **📈 Scalability**: Container manages complexity as app grows
5. **🛡️ Type Safety**: Full compile-time checking
6. **🎯 SOLID Principles**: Follows all 5 SOLID principles naturally
7. **📊 Schema-Driven**: Single source of truth for data structures
8. **🔗 KISS Principle**: Single database connection, no duplication

## 🚀 Next Steps

### Adding New Features
1. Create domain interface in `/src/domain/`
2. Add implementation in `/src/infrastructure/`
3. Add binding to `container.ts`
4. Use `@injectable()` and `@inject(TYPES.*)` decorators

### Testing Strategy
```typescript
// Unit tests with easy mocking
const mockRepo = mock<OpportunityRepository>();
container.rebind(TYPES.OpportunityRepository).toConstantValue(mockRepo);

// Integration tests with test database
const testDb = drizzle(TEST_DATABASE_URL);
container.rebind(TYPES.Database).toConstantValue(testDb);
```

---

**🎉 You now have enterprise-grade dependency injection that scales!**

This pattern is used by companies like Microsoft, Google, and Netflix in their large-scale applications. You're building like the pros! 🚀

## 📚 Additional Resources

- [InversifyJS Documentation](https://inversify.io/)
- [Clean Architecture by Robert Martin](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
- [SOLID Principles](https://en.wikipedia.org/wiki/SOLID)
- [Drizzle ORM Documentation](https://orm.drizzle.team/) 