# Microsoft Authentication Setup Guide

This guide will walk you through setting up Microsoft authentication for the Profiller HR application with domain restriction to `@ddroidd.com` email addresses.

## Prerequisites

1. Access to Azure Portal with permissions to create App Registrations
2. A Microsoft Entra ID (Azure AD) tenant
3. Next.js application with NextAuth.js installed

## Step 1: Install Required Dependencies

```bash
npm install next-auth
# or
yarn add next-auth
```

## Step 2: Azure App Registration Setup

### Create App Registration

1. Go to [Azure Portal](https://portal.azure.com/)
2. Navigate to **Microsoft Entra ID** (formerly Azure Active Directory)
3. Click on **App registrations** in the left sidebar
4. Click **New registration**

### Configure App Registration

1. **Name**: Enter a name like "Profiller HR Authentication"
2. **Supported account types**: Select "Accounts in this organizational directory only (Single tenant)"
3. **Redirect URI**: 
   - Platform: Web
   - URL: `http://localhost:3000/api/auth/callback/azure-ad` (for development)
   - For production: `https://yourdomain.com/api/auth/callback/azure-ad`
4. Click **Register**

### Get Required Values

After registration, note down these values:

1. **Application (client) ID** - Found on the Overview page
2. **Directory (tenant) ID** - Found on the Overview page

### Create Client Secret

1. Go to **Certificates & secrets** in the left sidebar
2. Click **New client secret**
3. Add a description and choose expiration period
4. Click **Add**
5. **Copy the secret value immediately** - you won't be able to see it again

### Configure API Permissions (Optional)

1. Go to **API permissions**
2. Click **Add a permission**
3. Select **Microsoft Graph**
4. Choose **Delegated permissions**
5. Add permissions like:
   - `User.Read` (to read user profile)
   - `email` (to access email)
   - `openid` (for OpenID Connect)
   - `profile` (to access profile information)

## Step 3: Environment Variables

Create a `.env.local` file in your project root:

```env
# NextAuth.js Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-here

# Azure Active Directory Configuration
AZURE_AD_CLIENT_ID=your-client-id-from-azure
AZURE_AD_CLIENT_SECRET=your-client-secret-from-azure
AZURE_AD_TENANT_ID=your-tenant-id-from-azure
```

### Generate NextAuth Secret

You can generate a secure secret using:

```bash
openssl rand -base64 32
```

Or use this online generator: https://generate-secret.vercel.app/32

## Step 4: Configure Domain Restriction

The application is already configured to only allow users with `@ddroidd.com` email addresses. This is enforced in:

1. **NextAuth.js callback** (`app/api/auth/[...nextauth]/route.ts`):
   - The `signIn` callback checks if the user's email ends with `@ddroidd.com`
   - Users with other domains will be redirected to an error page

2. **Middleware** (`middleware.ts`):
   - Additional protection at the route level
   - Checks the JWT token for the email domain

## Step 5: Test the Implementation

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Navigate to `http://localhost:3000`

3. You should be redirected to the sign-in page

4. Click "Sign in with Microsoft"

5. Test with different email domains:
   - `user@ddroidd.com` - Should work ✅
   - `user@otherdomain.com` - Should be rejected ❌

## Step 6: Production Deployment

### Update Environment Variables

For production, update your environment variables:

```env
NEXTAUTH_URL=https://yourdomain.com
NEXTAUTH_SECRET=your-production-secret
```

### Update Azure App Registration

1. Go back to your App Registration in Azure Portal
2. Navigate to **Authentication**
3. Add your production redirect URI:
   `https://yourdomain.com/api/auth/callback/azure-ad`

## Security Considerations

1. **Tenant Isolation**: The app registration is configured for single tenant, meaning only users from your specific Microsoft organization can attempt to sign in.

2. **Domain Validation**: Even if a user somehow gets past Azure's tenant restrictions, the application double-checks the email domain.

3. **Secure Secrets**: Always use strong, randomly generated secrets for production.

4. **HTTPS**: Always use HTTPS in production for secure authentication flows.

## Troubleshooting

### Common Issues

1. **"Invalid redirect URI"**
   - Check that the redirect URI in Azure matches exactly
   - Ensure you're using the correct URL for your environment

2. **"Access Denied" error**
   - This is expected behavior for non-ddroidd.com email addresses
   - Check the domain validation logic in the auth configuration

3. **"Cannot find module 'next-auth'"**
   - Ensure NextAuth.js is properly installed
   - Check your package.json dependencies

4. **NEXTAUTH_SECRET missing**
   - Ensure you have set the NEXTAUTH_SECRET environment variable
   - Generate a secure secret using the methods mentioned above

### Debugging

Enable debug mode in development by adding to your `.env.local`:

```env
NEXTAUTH_DEBUG=true
```

This will provide detailed logging for authentication flows.

## File Structure

The authentication implementation includes these files:

```
app/
├── api/auth/[...nextauth]/route.ts    # NextAuth.js configuration
├── auth/
│   ├── signin/page.tsx                # Custom sign-in page
│   └── error/page.tsx                 # Authentication error page
├── components/auth/
│   └── auth-button.tsx                # Sign in/out button component
├── providers.tsx                       # Session provider setup
├── page.tsx                           # Root page with redirect logic
├── middleware.ts                      # Route protection
└── globals.css                        # Styles
```

## Next Steps

1. **Customize the UI**: Modify the sign-in and error pages to match your brand
2. **Add User Management**: Implement user roles and permissions
3. **Session Management**: Configure session timeouts and refresh tokens
4. **Audit Logging**: Add logging for authentication events
5. **Multi-factor Authentication**: Consider enabling MFA in Azure AD

## Support

If you encounter issues:

1. Check the Azure Portal for any error messages
2. Review the NextAuth.js documentation: https://next-auth.js.org/
3. Check the browser console and server logs for error details
4. Verify all environment variables are correctly set 