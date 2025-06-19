# 📚 Enhanced Swagger API Documentation

Our Swagger documentation has been updated to reflect the enhanced presenter layer with **pagination, filtering, search, and sorting** capabilities.

## 🎯 Key Updates

### **1. New Response Schemas**

#### **PaginatedResponse**
```yaml
PaginatedResponse:
  properties:
    data: # Array of opportunities
    pagination: # Pagination metadata
    filters: # Applied filters (optional)
    search: # Search parameters (optional)  
    sort: # Sort parameters (optional)
```

#### **PaginationMeta**
```yaml
PaginationMeta:
  properties:
    page: 1
    limit: 10
    total: 25
    totalPages: 3
    hasNextPage: true
    hasPreviousPage: false
    nextPage: 2
    previousPage: null
```

#### **EnhancedMeta**
```yaml
EnhancedMeta:
  properties:
    count: 5        # Items in current page
    filtered: 15    # Total after filtering
    total: 25       # Total in database
    timestamp: "2025-06-19T11:47:43.584Z"
    endpoint: "/api/v1/opportunities"
```

### **2. Enhanced Opportunity Schema**

Added computed fields from presenter:

```yaml
Opportunity:
  properties:
    # ... existing fields
    isHighProbability: boolean  # >= 80% probability
    duration: integer          # Project duration in days
    isExpiringSoon: boolean    # Expiring within 30 days
```

## 🔍 Query Parameters Documentation

### **Pagination**
- `page` (integer, min: 1, default: 1) - Page number
- `limit` (integer, min: 1, max: 100, default: 10) - Items per page
- `_page`, `_limit` - Legacy parameters (backward compatibility)

### **Search**
- `search` (string) - Search term for name, client, comments
- `searchFields` (array) - Specific fields to search: `opportunityName`, `clientName`, `comment`

### **Filtering**
- `client` (string) - Client name filter (partial match)
- `probability` (string, pattern: `^\d+-\d+$`) - Range filter, e.g., `80-100`
- `status` (enum) - `In Progress`, `On Hold`, `Done`
- `isActive` (boolean) - Active status filter
- `startDate` (date) - Filter by start date from
- `endDate` (date) - Filter by end date to

### **Sorting**
- `sortBy` (enum) - Fields: `opportunityName`, `clientName`, `probability`, `createdAt`, `updatedAt`, `status`
- `sortOrder` (enum) - `asc` or `desc` (default: `asc`)

## 🚀 API Examples in Swagger

### **Basic Pagination**
```
GET /api/v1/opportunities?page=1&limit=5
```

**Response Example:**
```json
{
  "status": "success",
  "data": {
    "data": [...],
    "pagination": {
      "page": 1,
      "limit": 5,
      "total": 25,
      "totalPages": 5,
      "hasNextPage": true,
      "hasPreviousPage": false,
      "nextPage": 2,
      "previousPage": null
    }
  },
  "meta": {
    "count": 5,
    "filtered": 25,
    "total": 25,
    "timestamp": "2025-06-19T11:47:43.584Z",
    "endpoint": "/api/v1/opportunities?page=1&limit=5"
  }
}
```

### **Complex Query with Filters, Search, and Sort**
```
GET /api/v1/opportunities?search=Platform&probability=80-100&status=Done&sortBy=probability&sortOrder=desc
```

**Response Example:**
```json
{
  "status": "success",
  "data": {
    "data": [...],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 3,
      "totalPages": 1,
      "hasNextPage": false,
      "hasPreviousPage": false,
      "nextPage": null,
      "previousPage": null
    },
    "filters": {
      "probability": [80, 100],
      "status": "Done"
    },
    "search": {
      "search": "Platform",
      "searchFields": ["opportunityName"]
    },
    "sort": {
      "sortBy": "probability",
      "sortOrder": "desc"
    }
  },
  "meta": {
    "count": 3,
    "filtered": 3,
    "total": 25,
    "timestamp": "2025-06-19T11:47:43.584Z",
    "endpoint": "/api/v1/opportunities?search=Platform&probability=80-100&status=Done&sortBy=probability&sortOrder=desc"
  }
}
```

## 📝 Updated Endpoint Documentation

### **GET /api/v1/opportunities**
- **Summary**: Get opportunities with pagination, filtering, search, and sorting
- **Parameters**: 20+ query parameters for advanced filtering
- **Response**: Enhanced `PaginatedResponse` with metadata
- **Examples**: Basic pagination and complex filtered queries

### **POST /api/v1/opportunities**
- **Summary**: Create new opportunity (auto-generated UUID)
- **Response**: Enhanced `ApiResponse` with created opportunity
- **Error Handling**: Proper error schema references

### **GET /api/v1/opportunities/{id}**
- **Summary**: Get opportunity by UUID
- **Response**: Enhanced `ApiResponse` with single opportunity
- **Error Handling**: 404 and 500 error schemas

### **PUT /api/v1/opportunities/{id}**
- **Summary**: Update opportunity by UUID
- **Response**: Enhanced `ApiResponse` with updated opportunity

### **DELETE /api/v1/opportunities/{id}**
- **Summary**: Delete opportunity by UUID
- **Response**: 204 No Content on success

## 🎨 Schema Improvements

### **Unified Response Structure**
All responses now use consistent `ApiResponse` schema with:
- `status`: "success" | "error"
- `data`: Response data (varies by endpoint)
- `meta`: Enhanced metadata with timestamps, counts, endpoints

### **Error Handling**
Standardized `ErrorResponse` schema for all error cases:
- Development: Includes stack traces
- Production: Clean error messages with codes

### **Type Safety**
- UUID validation for all ID parameters
- Enum validation for status, sort fields
- Range validation for probability filters
- Format validation for dates

## 🔗 Access the Documentation

1. **Start the server**: `npm start`
2. **Visit Swagger UI**: http://localhost:3001/api-docs
3. **Explore the enhanced endpoints** with full parameter documentation
4. **Test queries directly** in the Swagger interface

## ✨ Benefits

✅ **Complete API Documentation** - Every parameter and response documented  
✅ **Interactive Testing** - Test complex queries directly in Swagger UI  
✅ **Type-Safe Schemas** - All request/response types properly defined  
✅ **Real Examples** - Actual API responses with realistic data  
✅ **Developer Experience** - Clear, comprehensive documentation for frontend teams  
✅ **Backward Compatibility** - Legacy parameters still documented  

---

**🎉 Your API documentation now perfectly reflects the enhanced presenter capabilities!** 