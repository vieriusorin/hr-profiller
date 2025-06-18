# 🧪 Demo Testing Guide - Role-Based Access Control

## Quick Demo Instructions

This guide shows you how to test the different user roles and their access levels in the Profiller HR system.

## 🚀 Quick Start

1. **Start the application**:
   ```bash
   npm run dev
   ```

2. **Navigate to**: `http://localhost:3000`

3. **You'll see the sign-in page** with 5 demo accounts ready to test

## 🎭 Testing Different Roles

### 1. 👑 **Admin Role** - Full Access
**Email**: `admin@ddroidd.com` | **Password**: `password123`

**What to test**:
- ✅ **Sidebar**: All menu items visible (Dashboard, Analytics, Clients, Projects, Candidates, Employees)
- ✅ **Clients Page**: Full client data + **financial information** (revenue shown)
- ✅ **Analytics Page**: Complete analytics including financial metrics
- ✅ **All Actions**: Create, edit, delete buttons available

**Expected Experience**: Complete access to everything, including sensitive financial data.

---

### 2. 👥 **HR Manager Role** - HR Management without Client Financials
**Email**: `hr.manager@ddroidd.com` | **Password**: `password123`

**What to test**:
- ✅ **Sidebar**: Dashboard, Analytics, Clients, Projects, Candidates, Employees
- ⚠️ **Clients Page**: Client contact info visible, but **revenue shows "Hidden"**
- ⚠️ **Analytics Page**: Analytics without client financial data
- ✅ **All HR Functions**: Employee and candidate management available

**Expected Experience**: Full HR capabilities but financial data is protected.

---

### 3. 🎯 **Recruiter Role** - Candidate-Focused
**Email**: `recruiter@ddroidd.com` | **Password**: `password123`

**What to test**:
- ⚠️ **Sidebar**: Only Dashboard, Projects (read-only), Candidates, Employees (limited)
- ❌ **Clients Page**: **No access** - redirected to dashboard
- ❌ **Analytics Page**: **No access** - redirected to dashboard
- ✅ **Candidates**: Full access to candidate management

**Expected Experience**: Focused on recruitment, no access to client/financial data.

---

### 4. 👤 **Employee Role** - Basic Project Access
**Email**: `employee@ddroidd.com` | **Password**: `password123`

**What to test**:
- ⚠️ **Sidebar**: Only Dashboard, Projects (assigned), Employees (directory)
- ❌ **Clients Page**: **No access** - redirected to dashboard
- ❌ **Analytics Page**: **No access** - redirected to dashboard
- ❌ **Candidates**: **No access** - redirected to dashboard

**Expected Experience**: Basic employee view, can see projects and colleagues.

---

### 5. 🔒 **Basic User Role** - Minimal Access
**Email**: `user@ddroidd.com` | **Password**: `password123`

**What to test**:
- ⚠️ **Sidebar**: Only Dashboard and Account Settings
- ❌ **All Other Pages**: **No access** - redirected to dashboard
- ⚠️ **Limited View**: Minimal dashboard with basic information

**Expected Experience**: Very restricted access, suitable for contractors/interns.

## 🔄 Testing Flow

### Complete Demo Sequence (5 minutes)

1. **Sign in as Admin** → Notice full sidebar → Visit Clients → See financial data
2. **Sign out** → **Sign in as HR Manager** → Visit Clients → Notice "Hidden" revenue
3. **Sign out** → **Sign in as Recruiter** → Try to visit Clients → Get redirected
4. **Sign out** → **Sign in as Employee** → Notice limited sidebar options
5. **Sign out** → **Sign in as User** → See minimal access

### Quick Role Switching

On the sign-in page, you'll see **quick-select buttons** for each role:
- Click "Use Admin" → automatically fills credentials
- Click "Use HR" → automatically fills HR manager credentials
- etc.

## 🎯 Key Security Features to Demonstrate

### Financial Data Protection
- **Admin**: Sees `$2,450,000` revenue
- **HR Manager**: Sees `Revenue: Hidden` with eye-off icon
- **Others**: No access to clients page at all

### Navigation Differences
- **Admin**: All 6 menu items
- **HR Manager**: 6 items but limited financial access
- **Recruiter**: 4 items focused on recruitment
- **Employee**: 3 items for basic access
- **User**: 2 items (dashboard + account)

### Visual Indicators
- **Role badge** in sidebar header showing current role
- **"Financial data hidden"** warnings where applicable
- **Permission denied** messages for unauthorized access

## 🐛 Testing Error Scenarios

### Access Denied Testing
1. **Copy URL**: Sign in as Recruiter, copy the clients page URL
2. **Direct Access**: Try visiting `/dashboard/clients` directly
3. **Expected**: Automatic redirect to dashboard

### Invalid Credentials
1. **Wrong Password**: Try `admin@ddroidd.com` with wrong password
2. **Wrong Domain**: Try signing up with `test@gmail.com`
3. **Expected**: Clear error messages

## 📊 Demo Script for Presentations

### 30-Second Demo
1. "Here's our role-based system with 5 different access levels"
2. Sign in as Admin → "Full access including financial data"
3. Switch to HR Manager → "Same interface but revenue is hidden"
4. Switch to Recruiter → "No client access at all for security"

### 2-Minute Deep Dive
1. Show sign-in page with all demo accounts
2. Admin tour: Full access, financial data visible
3. HR Manager: Point out hidden revenue, analytics restrictions
4. Recruiter: Show sidebar differences, access denials
5. Employee: Basic access demonstration
6. User: Minimal access for external users

## 🔍 What Reviewers Should Look For

### Security Implementation
- ✅ Financial data properly hidden from non-admin users
- ✅ Route-level protection (can't access via direct URLs)
- ✅ Component-level guards (UI elements hidden)
- ✅ Clear role indicators and feedback

### User Experience
- ✅ Role-appropriate navigation (no confusing options)
- ✅ Consistent yellow theme across all roles
- ✅ Clear feedback when access is denied
- ✅ Smooth transitions between different access levels

### Business Logic
- ✅ Financial data only for admin and limited for HR
- ✅ Recruitment focus for recruiters
- ✅ Basic employee directory access
- ✅ Minimal access for external users

## 🎉 Success Indicators

After testing, you should be able to confirm:

- [x] **Financial Protection**: Non-admin users cannot see sensitive financial data
- [x] **Role Separation**: Each role sees only relevant functionality
- [x] **Security**: Direct URL access is properly blocked
- [x] **UX Quality**: Clear, intuitive interface for each role type
- [x] **Compliance Ready**: Audit trail of who can access what

The system successfully addresses the original concern about protecting financial information while providing appropriate access levels for different user types! 
