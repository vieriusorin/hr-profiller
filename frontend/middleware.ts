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
      authorized: ({ token }) => {
        // A token will exist if the user is successfully authenticated
        // via any provider. This is the master switch for route protection.
        return !!token;
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
    // This regex protects all routes except for the ones specified in the negative lookahead
    // We add 'api-docs' to the exclusion list to allow access to the backend's Swagger UI
    '/((?!api/auth|auth|_next/static|_next/image|favicon.ico|api-docs).*)',
  ],
}; 