# Credentials Authentication Setup

I've added a username/password authentication system alongside the Microsoft OAuth, so you can continue working while setting up Azure later.

## Quick Start

### 1. Install Required Dependencies

```bash
npm install next-auth bcryptjs @types/bcryptjs
```

### 2. Environment Variables

Create a `.env.local` file in your project root:

```env
# NextAuth.js Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-here

# Azure AD (optional - leave empty for now)
# AZURE_AD_CLIENT_ID=
# AZURE_AD_CLIENT_SECRET=
# AZURE_AD_TENANT_ID=
```

Generate a secret:
```bash
openssl rand -base64 32
```

### 3. Test the System

1. Start your dev server:
   ```bash
   npm run dev
   ```

2. Navigate to `http://localhost:3000`

3. You'll be redirected to the sign-in page with two tabs:
   - **Email & Password**: For immediate testing
   - **Microsoft**: Will be available once Azure is configured

## Demo Accounts

I've pre-created these test accounts:

| Email | Password | Role |
|-------|----------|------|
| `admin@ddroidd.com` | `password123` | admin |
| `user@ddroidd.com` | `password123` | user |

## Features Implemented

### ✅ **Sign In Page** (`/auth/signin`)
- **Tabbed interface**: Email/Password + Microsoft options
- **Demo accounts**: Pre-configured for testing
- **Domain validation**: Only `@ddroidd.com` emails allowed
- **Error handling**: Clear feedback for failed attempts
- **Link to sign-up**: Easy account creation

### ✅ **Sign Up Page** (`/auth/signup`)
- **Account creation**: Full name, email, password
- **Password confirmation**: Ensures passwords match
- **Domain restriction**: Only `@ddroidd.com` domains
- **Success feedback**: Confirmation and auto-redirect
- **Back to sign-in**: Easy navigation

### ✅ **API Endpoints**
- **POST /api/auth/signup**: Creates new accounts
- **NextAuth.js handlers**: Manages authentication
- **Password hashing**: Secure bcrypt encryption
- **Domain validation**: Server-side enforcement

### ✅ **Security Features**
- **Domain restriction**: Only `@ddroidd.com` emails
- **Password hashing**: bcrypt with salt rounds
- **Session management**: Secure JWT tokens
- **Route protection**: Middleware guards all routes
- **Input validation**: Client and server-side checks

## User Flow

1. **Root page** (`/`): Auto-redirects based on auth status
2. **Sign-in** (`/auth/signin`): Two authentication methods
3. **Sign-up** (`/auth/signup`): Account creation
4. **Dashboard** (`/dashboard`): Protected main application
5. **Error page** (`/auth/error`): Handles auth failures

## File Structure

```
app/
├── api/auth/
│   ├── [...nextauth]/route.ts     # Auth configuration
│   └── signup/route.ts            # Account creation API
├── auth/
│   ├── signin/page.tsx            # Sign-in page (tabs)
│   ├── signup/page.tsx            # Sign-up page
│   └── error/page.tsx             # Error handling
├── components/auth/
│   └── auth-button.tsx            # Sign in/out button
├── providers.tsx                   # Session provider
├── middleware.ts                  # Route protection
└── page.tsx                       # Root redirect logic
```

## Testing Instructions

### Test Sign In
1. Go to `/auth/signin`
2. Use "Email & Password" tab
3. Enter: `admin@ddroidd.com` / `password123`
4. Should redirect to dashboard

### Test Sign Up
1. Go to `/auth/signup`
2. Create account with `@ddroidd.com` email
3. Use any password (6+ characters)
4. Should redirect to sign-in after creation

### Test Domain Restriction
1. Try signing up with non-ddroidd.com email
2. Should show error message
3. Try signing in with wrong password
4. Should show appropriate error

### Test Route Protection
1. Try accessing `/dashboard` without signing in
2. Should redirect to sign-in page
3. Sign in, then access dashboard
4. Should work normally

## Next Steps

### Immediate Use
- ✅ Use email/password authentication now
- ✅ Create accounts via sign-up page
- ✅ Test all functionality without Azure

### Future Azure Integration
- Set up Azure App Registration
- Add environment variables
- Microsoft tab will automatically work
- Both methods can coexist

### Production Considerations
- Replace in-memory user store with database
- Add password strength requirements
- Implement email verification
- Add rate limiting for sign-up
- Add audit logging

## Troubleshooting

### Common Issues

1. **"Cannot find module 'next-auth'"**
   - Run: `npm install next-auth bcryptjs @types/bcryptjs`

2. **"NEXTAUTH_SECRET is missing"**
   - Generate secret: `openssl rand -base64 32`
   - Add to `.env.local`

3. **Domain validation not working**
   - Check email ends with `@ddroidd.com`
   - Validation is case-sensitive

4. **Sign-up not working**
   - Ensure password is 6+ characters
   - Check passwords match
   - Verify email format

### Debug Mode

Add to `.env.local` for detailed logging:
```env
NEXTAUTH_DEBUG=true
```

## Architecture Notes

### User Storage
Currently using in-memory array for simplicity. In production:
- Use database (PostgreSQL, MongoDB, etc.)
- Implement proper user management
- Add user roles and permissions

### Password Security
- bcrypt with 12 salt rounds
- Passwords are hashed on registration
- Plain text passwords never stored

### Session Management
- JWT-based sessions via NextAuth.js
- Automatic token refresh
- Secure httpOnly cookies

This setup gives you a fully functional authentication system while you work on Azure configuration! 