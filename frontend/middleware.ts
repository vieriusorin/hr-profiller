import { withAuth } from 'next-auth/middleware';
import { NextRequest } from 'next/server';
import { hasPermission, UserRole } from './lib/rbac';
import { JWT } from 'next-auth/jwt';

export default withAuth(
  function middleware(req: NextRequest & { nextauth: { token: JWT | null } }) {
    const { pathname } = req.nextUrl;
    const userRole = req.nextauth?.token?.role as UserRole;

    // Route-specific permission checks
    const routePermissions: Record<string, string> = {
      '/dashboard/analytics': 'view_analytics',
      '/dashboard/clients': 'view_clients',
      '/dashboard/projects': 'view_projects',
      '/dashboard/candidates': 'view_candidates',
      '/dashboard/employees': 'view_employees',
    };

    // Check if the current route requires specific permissions
    for (const [route, permission] of Object.entries(routePermissions)) {
      if (pathname.startsWith(route)) {
        if (!userRole || !hasPermission(userRole, permission as any)) {
          // Redirect to dashboard if user doesn't have permission
          const url = req.nextUrl.clone();
          url.pathname = '/dashboard';
          return Response.redirect(url);
        }
      }
    }

    return;
  },
  {
    callbacks: {
      authorized: () => {
        // TEMPORARILY DISABLED FOR TESTING - Allow all requests
        return true;

        // Original check - uncomment when ready to re-enable auth
        // Check if user has a valid token and is from ddroidd.com domain
        // if (token?.email && token.email.endsWith('@ddroidd.com')) {
        //   return true;
        // }
        // return false;
      },
    },
    pages: {
      signIn: '/auth/signin',
      error: '/auth/error',
    },
  }
);

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/((?!api/auth|auth|_next/static|_next/image|favicon.ico).*)',
  ],
}; 