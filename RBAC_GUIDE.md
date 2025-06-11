# Role-Based Access Control (RBAC) System

## Overview

This application implements a comprehensive role-based access control (RBAC) system that provides different UI experiences and access levels for different user types. The system addresses your specific concern about protecting financial information from unauthorized users.

## User Roles

### 1. Admin (`admin`)
- **Full system access** including financial data
- Can view and manage all sections: Clients, Projects, Candidates, Employees
- Access to analytics and financial reporting
- User management capabilities
- System settings access

**Use Case**: CEO, CTO, Finance Director

### 2. HR Manager (`hr_manager`) 
- **HR management** without financial access to clients
- Can view clients but **no financial data** (revenue, profit margins)
- Full access to candidates, employees, and projects
- Can manage employee roles and performance
- Access to analytics (without client financials)

**Use Case**: HR Director, People Operations Manager

### 3. Recruiter (`recruiter`)
- **Recruitment-focused** access
- Full access to candidates and recruitment features
- Read-only access to projects and employees
- **No access to clients** (addresses your financial concern)
- No financial data access

**Use Case**: Talent Acquisition Specialist, Recruiter

### 4. Employee (`employee`)
- **Basic employee access**
- Can view projects they're assigned to
- Limited employee directory access
- **No client or financial access**
- No candidate management

**Use Case**: Developer, Designer, Project Manager

### 5. User (`user`)
- **Minimal access** for external or temporary users
- Basic dashboard access only
- **No access to clients, financial data, or sensitive information**
- Account management only

**Use Case**: Contractor, Intern, External Consultant

## Permission System

### Financial Data Protection

The system specifically addresses your concern about financial access:

- **Only Admin** can view all financial data
- **HR Managers** can see clients but NOT financial information (revenue is hidden)
- **Recruiters, Employees, and Users** have NO access to client data at all

### Key Permissions

```typescript
// Client Permissions (Financial Protection)
'view_clients'           // Basic client info
'view_client_financials' // Revenue, contracts, billing - RESTRICTED

// Project Permissions  
'view_projects'
'view_project_financials' // Budget, costs - RESTRICTED

// Employee/Candidate Permissions
'view_candidates'
'view_candidate_salary'   // Salary info - RESTRICTED
'view_employees'
'view_employee_salary'    // Salary info - RESTRICTED
```

## UI Differences by Role

### Sidebar Navigation
- **Admin**: All menu items visible (Dashboard, Analytics, Clients, Projects, Candidates, Employees)
- **HR Manager**: All items except financial sections of clients
- **Recruiter**: Dashboard, Projects (read-only), Candidates, Employees (limited)
- **Employee**: Dashboard, Projects (assigned only), Employees (basic view)
- **User**: Dashboard only

### Client Page Experience
- **Admin**: Full client details + financial data + all actions
- **HR Manager**: Client details + contact info + projects, but revenue shows "Hidden"
- **Recruiter/Employee/User**: No access to clients page (redirected to dashboard)

### Analytics Page
- **Admin**: Full analytics including financial metrics
- **HR Manager**: Analytics without client financial data
- **Others**: No access to analytics

## Security Implementation

### Route Protection
```typescript
// middleware.ts protects routes
'/dashboard/clients'    → requires 'view_clients'
'/dashboard/analytics'  → requires 'view_analytics'
```

### Component-Level Protection
```typescript
// Financial data conditionally rendered
{canViewFinancials ? (
  <div>Revenue: ${client.revenue}</div>
) : (
  <div>Revenue: Hidden</div>
)}
```

## Test Users

You can test different role experiences with these accounts:

| Email | Role | Access Level |
|-------|------|--------------|
| `admin@ddroidd.com` | Admin | Full access including financials |
| `hr.manager@ddroidd.com` | HR Manager | HR management, no client financials |
| `recruiter@ddroidd.com` | Recruiter | Recruitment focus, no clients |
| `employee@ddroidd.com` | Employee | Basic project access |
| `user@ddroidd.com` | User | Minimal dashboard access |

All accounts use password: `password123`

## Benefits of This Approach

### 1. **Financial Data Protection**
- Clear separation between who can see financial data
- Multiple layers of protection (route, component, data level)
- Visual indicators when data is hidden

### 2. **Role-Specific UX**
- Users only see relevant navigation items
- Reduced cognitive load - no confusing options they can't use
- Role-appropriate workflows

### 3. **Compliance & Audit**
- Clear audit trail of who can access what
- Easy to demonstrate compliance with data protection requirements
- Role changes are centralized and trackable

### 4. **Scalability**
- Easy to add new roles or modify permissions
- Granular permission system allows fine-tuning
- Component-based approach enables reusable security patterns

## Future Enhancements

### 1. **Department-Based Access**
- Engineering team sees technical projects
- Sales team sees client-facing projects
- Finance team sees all financial data

### 2. **Project-Level Permissions**
- Users can only see projects they're assigned to
- Project managers can see their project's financial data
- Client-specific access controls

### 3. **Audit Logging**
- Track who accessed what financial data when
- Failed permission attempts logging
- Regular access reviews

### 4. **Advanced Financial Controls**
- Different financial permission levels (view vs edit)
- Time-based access (quarterly financial reviews)
- Approval workflows for sensitive data access

## Implementation Notes

The RBAC system is built with:
- **Type-safe permissions** - TypeScript ensures permission consistency
- **Reusable components** - `PermissionGuard` for conditional rendering
- **Middleware protection** - Server-side route protection
- **Session-based roles** - Roles stored in NextAuth session
- **Yellow theme consistency** - All role-specific UIs maintain the design system

This system provides the security you need while maintaining a great user experience for each role type. 