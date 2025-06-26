# @profiller-hr/shared-types

This package contains shared TypeScript types and interfaces used across the Profiller HR ecosystem, specifically between the backend API and MCP server.

## Purpose

This package ensures consistency and prevents breaking changes when data formats are modified. It serves as the single source of truth for:

- API request/response interfaces
- MCP tool definitions
- Data validation schemas
- Enums for consistent values

## Installation

```bash
# In backend or mcp-server directory
npm install file:../shared-types
```

## Usage

### Basic Import

```typescript
import {
  AnalysisRequest,
  AnalysisResponse,
  McpTool,
  ResponseEnvelope
} from '@profiller-hr/shared-types';
```

### With Validation

```typescript
import {
  AnalysisRequest,
  validateAnalysisRequest,
  sanitizeAnalysisRequest
} from '@profiller-hr/shared-types';

// Validate request
const validation = validateAnalysisRequest(request);
if (!validation.isValid) {
  throw new Error(`Invalid request: ${validation.errors.join(', ')}`);
}

// Or sanitize and use defaults
const sanitizedRequest = sanitizeAnalysisRequest(request);
```

### Enums

```typescript
import { AnalysisType, UserRole, UrgencyLevel } from '@profiller-hr/shared-types';

const request: AnalysisRequest = {
  data: 'employee data',
  analysisType: AnalysisType.CAPABILITY_ANALYSIS,
  userRole: UserRole.HR_MANAGER,
  urgency: UrgencyLevel.STANDARD
};
```

## Development

### Building

```bash
npm run build
```

### Watching for Changes

```bash
npm run watch
```

## Types Included

### Core Types
- `ResponseEnvelope<T>` - Standard API response wrapper
- `ErrorResponse` - Error response format
- `HealthStatus` - Health check response

### MCP Tool Types
- `McpTool` - Tool definition interface
- `McpToolEndpoint` - Tool endpoint configuration
- `McpToolResult` - Tool execution result (with legacy compatibility)

### Request/Response Types
- `AnalysisRequest` / `AnalysisResponse`
- `ReportRequest` / `ReportResponse`
- `BenchmarkingRequest`
- `CompensationRequest`

### Enums
- `AnalysisType`
- `UserRole`
- `UrgencyLevel`
- `ConfidentialityLevel`

### Validation Functions
- `validateAnalysisRequest()`
- `validateReportRequest()`
- `sanitizeAnalysisRequest()`
- `sanitizeReportRequest()`

## Migration Guide

### From Backend Types

Replace imports from `@base/shared/types/mcp-tools.types` with:

```typescript
// Before
import { McpTool, McpToolResult } from '@base/shared/types/mcp-tools.types';

// After
import { McpTool, McpToolResult } from '@profiller-hr/shared-types';
```

### From MCP Server Types

Replace imports from `../shared/types` with:

```typescript
// Before
import { AnalysisRequest, AnalysisResponse } from '../shared/types';

// After
import { AnalysisRequest, AnalysisResponse } from '@profiller-hr/shared-types';
```

## Versioning

This package follows semantic versioning:
- **Major**: Breaking changes to existing interfaces
- **Minor**: New interfaces or optional properties
- **Patch**: Bug fixes or documentation updates

When making changes, update the version in `package.json` and run `npm run build` before committing. 