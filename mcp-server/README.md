# Enhanced HR MCP Server with Domain Driven Design

Enterprise-grade HR MCP Server with DDD architecture, Swagger UI authentication protection, and advanced AI capabilities.

## 🚀 Features

- **Domain Driven Design**: Clean architecture with clear separation of concerns
- **Dependency Injection**: Inversify IoC container for testability and maintainability
- **Advanced AI Analytics**: Role-specific AI personas for HR analytics
- **Executive Reporting**: Multi-step report generation with strategic insights
- **Skill Benchmarking**: Comprehensive market analysis and benchmarking
- **Compensation Analysis**: Market positioning and equity analysis
- **Protected Swagger UI**: Admin-only authentication required for API documentation
- **Type Safety**: Full TypeScript implementation with comprehensive validation

## 🏗️ Architecture

This server follows Domain Driven Design (DDD) principles with clear architectural layers:

### Domain Layer (`/domain/`)
- **Entities**: Core business objects with behavior (`Analysis`)
- **Services**: Domain logic and business rules (`McpAnalysisService`)
- **Interfaces**: Domain contracts and types

### Infrastructure Layer (`/infrastructure/`)
- **Services**: External dependencies (`OpenAIService`, `PromptEngineService`)
- **HTTP**: Controllers and routes
- **Container**: Dependency injection setup with Inversify
- **Swagger**: API documentation configuration

### Interface Layer (`/interfaces/`)
- **HTTP**: Server setup and middleware
- **Presenters**: Data transformation for external consumption

### Shared Layer (`/shared/`)
- **Types**: Common types and dependency injection symbols
- **Utils**: Common utilities and helpers

## Authentication Setup

The Swagger UI (`/api-docs`) is protected and requires:

1. **Valid NextAuth Session**: User must be logged in through the frontend
2. **Admin Role**: Only users with 'admin' role can access Swagger UI
3. **Session Cookie**: NextAuth session token cookie must be present

### Environment Variables

Copy `env.example` to `.env` and configure:

```bash
# Required for Swagger UI authentication
NEXTAUTH_SECRET=your_nextauth_secret_here  # Must match frontend/backend
NEXTAUTH_URL=http://localhost:3000         # Frontend URL

# CORS Configuration
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001

# Server Configuration
PORT=3002
NODE_ENV=development

# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key_here
```

## Starting the Server

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Start production server
npm start
```

## Accessing Swagger UI

1. **Login to Frontend**: Navigate to `http://localhost:3000` and login with admin credentials
2. **Access Swagger**: Visit `http://localhost:3002/api-docs`
3. **Authentication Flow**: 
   - If not logged in → redirected to frontend login
   - If not admin role → 403 Forbidden error
   - If valid admin session → Swagger UI accessible

## API Integration

The MCP server is designed to work with the main backend service. The backend provides proxy endpoints:

- `/api/v1/mcp/tools` - List available MCP tools
- `/api/v1/mcp/analyze` - Perform AI analysis
- `/api/v1/mcp/report` - Generate comprehensive reports
- `/api/v1/mcp/skill-benchmarking` - Skill market analysis
- `/api/v1/mcp/compensation-analysis` - Compensation analysis

## Security Features

- **Session-based Authentication**: Uses NextAuth JWT tokens
- **Role-based Authorization**: Admin-only access to Swagger UI
- **CORS Protection**: Configurable allowed origins
- **Secure Cookies**: Production-ready cookie handling
- **Redirect Protection**: Secure redirect handling for authentication flows 