# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Profiller HR is a comprehensive HR management system built with a microservices architecture consisting of three main services:
- **Backend (Express.js)**: REST API server with domain-driven design
- **Frontend (Next.js 15)**: Server-side rendered React application with App Router
- **MCP Server**: AI-powered HR analytics and talent intelligence service

The application provides opportunity management, employee tracking, candidate recruitment, role matching, and AI-powered HR analytics with role-based access control (RBAC).

## Development Commands

### Backend (Express.js API)
```bash
cd backend
npm run dev              # Start development server with hot reload
npm run build            # Compile TypeScript to dist/
npm run serve            # Run compiled production build
npm run lint             # Lint and fix code
npm run format           # Format code with Prettier

# Database operations (Drizzle ORM)
npm run db:push          # Push schema changes to database
npm run db:generate      # Generate migration files
npm run db:studio        # Open Drizzle Studio (database GUI)
npm run db:migrate       # Run migrations
npm run db:seed          # Seed database with test data
npm run db:reset         # Reset database (drops all data)

# API documentation
npm run openapi:generate # Generate OpenAPI spec
npm run types:generate   # Generate shared types from OpenAPI spec
```

### Frontend (Next.js)
```bash
cd frontend
npm run dev              # Start development server (port 3000)
npm run build            # Build for production
npm run start            # Start production server
npm run lint             # Run ESLint
npm run lint:fix         # Run ESLint with auto-fix

# Type generation
npm run types:generate   # Generate TypeScript types from backend OpenAPI spec
npm run types:watch      # Watch mode for type generation
```

### MCP Server (AI Analytics)
```bash
cd mcp-server
npm run dev              # Start development server with nodemon
npm run build            # Compile TypeScript
npm run start            # Run compiled server
npm run lint             # Lint and fix code
npm run format           # Format code with Prettier
```

### Docker Development
```bash
# Development environment (hot reload enabled)
docker-compose -f docker-compose.dev.yml up --build

# Production environment
docker-compose -f docker-compose.production.yml up --build

# Individual services
docker-compose -f docker-compose.dev.yml up postgres    # Database only
docker-compose -f docker-compose.dev.yml up pgadmin     # PgAdmin
```

### Kubernetes Deployment
```bash
# Deploy to Kubernetes cluster
kubectl apply -f k8s/namespace.yaml
kubectl apply -f k8s/secrets.yaml
kubectl apply -f k8s/configmap.yaml
kubectl apply -f k8s/postgres/
kubectl apply -f k8s/backend/
kubectl apply -f k8s/frontend/
kubectl apply -f k8s/mcp-server/

# Check deployment status
kubectl get pods -n profiller-hr
kubectl get services -n profiller-hr
```

## Architecture

### Backend Architecture (Domain-Driven Design)

The backend follows DDD principles with clear separation of concerns:

**Directory Structure:**
- `src/domain/` - Core business logic, entities, and domain services
  - `auth/` - Authentication and authorization logic
  - `ai/` - AI services (OpenAI, RAG, vector database)
  - `employee/` - Employee management domain
  - `mcp/` - MCP client integration
  - `opportunity/` - Opportunity and role management
  - `person/` - Person entity domain
- `src/infrastructure/` - External dependencies and implementations
  - `database/repositories/` - Drizzle ORM repository implementations
  - `http/` - Express server setup, routes, controllers, middlewares
  - `services/` - External service integrations
  - `swagger/` - OpenAPI documentation
  - `prompts/` - AI prompt templates
  - `container.ts` - InversifyJS dependency injection container
- `src/interfaces/` - Application entry points and API definitions
- `db/` - Database schema, migrations, and seed data
  - `schema/` - Drizzle schema definitions
  - `migrations/` - Database migrations
  - `seed.ts` - Seed data for development

**Dependency Injection:**
Uses InversifyJS container defined in `src/infrastructure/container.ts`. All services, repositories, and controllers are registered here with TYPES tokens from `src/shared/types.ts`.

**Database:**
- PostgreSQL 16 with pgvector extension (for AI embeddings)
- Drizzle ORM for type-safe database queries
- Schema defined in `db/schema.ts` with separate files in `db/schema/`

**Authentication:**
- NextAuth.js session-based authentication
- Microsoft Entra ID (Azure AD) as identity provider
- Domain restriction to `@ddroidd.com` emails
- JWT tokens for API authentication

### Frontend Architecture (Next.js App Router)

**Directory Structure:**
- `app/` - Next.js App Router pages and layouts
  - `dashboard/` - Main application pages (clients, projects, candidates, employees)
    - `_components/` - Shared dashboard components
    - `_types/` - Dashboard-specific types
  - `api/` - API routes (auth, health checks)
  - `auth/` - Authentication pages
  - `providers/` - React context providers
- `components/` - Reusable UI components (shadcn/ui based)
- `lib/` - Utilities and shared logic
  - `api-client.ts` - Axios-based API client with type safety
  - `auth/` - NextAuth configuration and utilities
  - `rbac.ts` - Role-based access control utilities
  - `services/` - Frontend service layer
  - `theme.ts` - Theme configuration
- `hooks/` - Custom React hooks
- `types/` - TypeScript type definitions (auto-generated from backend)

**State Management:**
- TanStack Query (React Query) for server state
- React Context for global UI state
- NextAuth session for authentication state

**Styling:**
- Tailwind CSS v4 with custom configuration
- shadcn/ui components (Radix UI primitives)
- Custom yellow-based theme system
- Dark mode support

**API Integration:**
- Type-safe API client in `lib/api-client.ts`
- Auto-generated types from backend OpenAPI spec in `types/api.ts`
- TanStack Query hooks for data fetching

### MCP Server Architecture

Lightweight Express.js service providing AI-powered HR analytics:

**Directory Structure:**
- `src/domain/analysis/` - AI analysis business logic
- `src/infrastructure/` - HTTP server and service implementations
- `src/interfaces/` - API routes and controllers

**Capabilities:**
- HR data analysis and insights
- Talent intelligence and recommendations
- Integration with OpenAI API
- Connects to backend API for data access

### RBAC System

The application implements a comprehensive role-based access control system:

**Roles:**
1. `admin` - Full system access including financial data
2. `hr_manager` - HR management without client financial access
3. `recruiter` - Recruitment-focused, no client access
4. `employee` - Basic project and directory access
5. `user` - Minimal dashboard-only access

**Key Points:**
- Financial data (client revenue, salaries) is protected by specific permissions
- UI navigation adapts based on user role
- Route protection via middleware (`frontend/middleware.ts`)
- Component-level permission guards
- Detailed documentation in `frontend/RBAC_GUIDE.md`

## Environment Variables

### Backend (.env)
```bash
# Database
DATABASE_URL=postgresql://user:password@localhost:5433/profiller_hr
DB_HOST=localhost
DB_PORT=5433
DB_USER=postgres
DB_PASSWORD=yourpassword
DB_NAME=profiller_hr

# Server
PORT=3001
NODE_ENV=development

# Authentication
JWT_SECRET=your-jwt-secret
NEXTAUTH_SECRET=your-nextauth-secret
NEXTAUTH_URL=http://localhost:3000

# CORS
CORS_ORIGIN=http://localhost:3000
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001,http://localhost:3002
```

### Frontend (.env.local)
```bash
# API
API_URL=http://localhost:3001

# Authentication
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-nextauth-secret
AZURE_AD_CLIENT_ID=your-azure-client-id
AZURE_AD_CLIENT_SECRET=your-azure-client-secret
AZURE_AD_TENANT_ID=your-azure-tenant-id

# Node
NODE_ENV=development
NEXT_TELEMETRY_DISABLED=1
```

### MCP Server (.env)
```bash
PORT=3002
OPENAI_API_KEY=your-openai-api-key
API_URL=http://localhost:3001
NEXTAUTH_SECRET=your-nextauth-secret
```

## Code Patterns and Conventions

### Backend Patterns

**Repository Pattern:**
All data access goes through repository interfaces defined in `src/domain/[entity]/repositories/` with Drizzle implementations in `src/infrastructure/database/repositories/`.

**Service Layer:**
Business logic lives in domain services (`src/domain/[entity]/services/`). Services are injected with repositories via InversifyJS.

**Controllers:**
HTTP controllers in `src/infrastructure/http/controllers/` handle request/response, delegate to services, and manage HTTP concerns (status codes, error handling).

**Middleware Chain:**
- Helmet for security headers
- CORS with origin validation
- Rate limiting (separate limiters for API, auth, metrics, swagger)
- Payload and speed limiting
- Session protection for protected routes
- Authorization middleware for role-based access

### Frontend Patterns

**Data Fetching:**
Use TanStack Query hooks. API calls go through `lib/api-client.ts` which provides type-safe methods for all backend endpoints.

**Authentication:**
NextAuth session is checked in layouts and middleware. Use `useSession()` hook for client-side checks.

**RBAC:**
Use `usePermission()` hook from `lib/rbac.ts` or `<PermissionGuard>` component for conditional rendering based on permissions.

**Component Structure:**
- Feature-specific components in `app/dashboard/[feature]/` directories
- Shared UI components in `components/` directory
- Dashboard-wide components in `app/dashboard/_components/`

**Form Handling:**
- react-hook-form for form state
- Zod for validation schemas
- @hookform/resolvers for schema integration

## Testing

### Backend
Testing framework not yet implemented. When adding tests, use:
- Jest for unit tests
- Supertest for API integration tests
- Place tests in `__tests__` directories or as `.test.ts` files

### Frontend
Testing framework not yet implemented. When adding tests, use:
- Jest for unit tests
- React Testing Library for component tests
- MSW (Mock Service Worker) for API mocking (already installed)

## Key Files to Reference

- `backend/src/infrastructure/container.ts` - Dependency injection setup
- `backend/db/schema.ts` - Database schema entry point
- `frontend/lib/api-client.ts` - API client implementation
- `frontend/lib/rbac.ts` - RBAC utilities and permissions
- `frontend/middleware.ts` - Route protection and session validation
- `backend/src/interfaces/http/server.ts` - Express server setup
- `docker-compose.dev.yml` - Local development environment
- `frontend/AUTH_SETUP.md` - Authentication setup guide
- `frontend/RBAC_GUIDE.md` - Comprehensive RBAC documentation

## Common Development Tasks

### Adding a New Backend Entity
1. Create domain folder: `backend/src/domain/[entity]/`
2. Define entity interfaces and types
3. Create repository interface: `repositories/[entity].repository.ts`
4. Implement Drizzle repository: `backend/src/infrastructure/database/repositories/drizzle-[entity].repository.ts`
5. Create service: `services/[entity].service.ts`
6. Create controller: `backend/src/infrastructure/http/controllers/[entity].controller.ts`
7. Register in DI container: `backend/src/infrastructure/container.ts`
8. Add routes: `backend/src/interfaces/http/routes/[entity].routes.ts`
9. Import routes in: `backend/src/interfaces/http/routes.ts`

### Adding a New Frontend Page
1. Create page directory: `frontend/app/dashboard/[page]/`
2. Add `page.tsx` for the route
3. Add `layout.tsx` if needed
4. Create components in same directory or `_components/`
5. Add API service methods to `lib/services/` if needed
6. Update navigation in `app/dashboard/_components/Sidebar.tsx`
7. Add route protection in `middleware.ts` if needed

### Regenerating Types
When backend API changes:
```bash
# In backend - generate OpenAPI spec
cd backend
npm run openapi:generate

# In frontend - regenerate TypeScript types
cd frontend
npm run types:generate
```

### Database Schema Changes
1. Modify schema in `backend/db/schema/[table].ts`
2. Update `backend/db/schema.ts` if adding new table
3. Generate migration: `npm run db:generate`
4. Review migration in `backend/db/migrations/`
5. Apply migration: `npm run db:push` (dev) or `npm run db:migrate` (prod)
6. Update seed data if needed: `backend/db/seed.ts`
