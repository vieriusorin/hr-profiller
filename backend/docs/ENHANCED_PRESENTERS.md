# 🎯 Enhanced Presenter Layer - Unified Response System

The enhanced presenter layer provides **pagination, filtering, search, and sorting** capabilities for all API endpoints, matching your frontend implementation patterns exactly.

## 🏗️ Architecture Overview

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Controller    │    │   Presenter     │    │    Builders     │
│                 │───▶│                 │───▶│                 │
│ • Query parsing │    │ • Transform     │    │ • Filter logic  │
│ • Business call │    │ • Format        │    │ • Search logic  │
│ • Response send │    │ • Unified API   │    │ • Sort logic    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 📦 Components

### 1. **Enhanced Base Presenter** (`enhanced-base.presenter.ts`)

Central presenter class with unified response methods:

- `successPaginated(items, req)` - Full query support (pagination, filtering, search, sort)
- `successCollection(items, req)` - Simple collections without pagination
- `success(item)` - Single item responses
- `error(error)` - Standardized error responses

### 2. **Query Parser** (`query-parser.ts`)

Extracts parameters from URL query string:

```typescript
// Supports your frontend patterns:
// ?page=1&limit=10&sortBy=name&sortOrder=desc
// ?search=Herzog&searchFields=clientName
// ?probability=80-100&status=Done&isActive=true
```

### 3. **Builder Pattern** (`builders/opportunity-builders.ts`)

Pluggable components for different entities:

- **FilterBuilder**: Apply filters to collections
- **SearchBuilder**: Full-text search across fields  
- **SortBuilder**: Sort by various criteria

## 🚀 API Examples

### Basic Pagination
```
GET /api/v1/opportunities?page=1&limit=5
```

### Search
```
GET /api/v1/opportunities?search=Herzog&searchFields=clientName
```

### Filtering
```
GET /api/v1/opportunities?probability=80-100&status=Done
```

### Sorting
```
GET /api/v1/opportunities?sortBy=probability&sortOrder=desc
```

### Complex Query
```
GET /api/v1/opportunities?search=Platform&probability=50-100&sortBy=createdAt&sortOrder=desc&page=1&limit=2
```

## 📊 Response Structure

All paginated responses follow this unified format:

```json
{
  "status": "success",
  "data": {
    "data": [...],           // Paginated/filtered results
    "pagination": {
      "page": 1,
      "limit": 5,
      "total": 25,
      "totalPages": 5,
      "hasNextPage": true,
      "hasPreviousPage": false,
      "nextPage": 2,
      "previousPage": null
    },
    "filters": {...},        // Applied filters
    "search": {...},         // Search parameters  
    "sort": {...}            // Sort parameters
  },
  "meta": {
    "count": 5,              // Items in current page
    "filtered": 25,          // Total after filtering
    "total": 25,             // Total in database
    "timestamp": "2025-06-19T11:47:43.584Z",
    "endpoint": "/api/v1/opportunities"
  }
}
```

## 🔧 Usage in Controllers

### Before (Manual Response Building)
```typescript
res.status(200).json({
  status: 'success',
  data: opportunities,
  meta: {
    count: opportunities.length,
    timestamp: new Date().toISOString(),
    endpoint: req.originalUrl,
  },
});
```

### After (Enhanced Presenter)
```typescript
const response = this.presenter.successPaginated(opportunities, req);
res.status(200).json(response);
```

## 📋 Filter Support

### Opportunity-Specific Filters

- **Client Search**: `?client=Herzog` (case-insensitive partial match)
- **Probability Range**: `?probability=80-100` (min-max range)
- **Status Filter**: `?status=Done` (exact match)
- **Active Filter**: `?isActive=true` (boolean)
- **Date Range**: `?startDate=2025-01-01&endDate=2025-12-31`

### Search Fields
- `opportunityName`
- `clientName` 
- `comment`

### Sortable Fields
- `opportunityName`
- `clientName`
- `probability`
- `createdAt`
- `updatedAt`
- `status`

## 🎨 Benefits

✅ **Unified Response Format** - Consistent across all endpoints  
✅ **Frontend Compatible** - Matches your existing frontend patterns  
✅ **Optional Usage** - Can be used on any endpoint  
✅ **Type Safe** - Full TypeScript support  
✅ **Extensible** - Easy to add new filters/search fields  
✅ **Performance** - In-memory filtering and pagination  
✅ **Clean Code** - Separation of concerns with builder pattern  

## 🔮 Next Steps

1. **Add to More Endpoints**: Apply to people, clients, etc.
2. **Database-Level Filtering**: Move filtering to repository layer for large datasets
3. **Advanced Search**: Add fuzzy search, regex support
4. **Caching**: Add response caching for frequent queries
5. **Documentation**: Auto-generate API docs from builders

## 📚 Related Files

- `src/shared/types/presenter.types.ts` - Type definitions
- `src/shared/utils/query-parser.ts` - URL parsing logic
- `src/interfaces/presenters/enhanced-base.presenter.ts` - Base presenter
- `src/interfaces/presenters/builders/opportunity-builders.ts` - Opportunity-specific logic
- `src/interfaces/presenters/opportunity.presenter.ts` - Opportunity presenter
- `src/infrastructure/http/controllers/opportunity.controller.ts` - Updated controller

---

**🎉 Your API now provides a powerful, flexible querying system that matches your frontend exactly!** 