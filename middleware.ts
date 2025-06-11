import { withAuth } from 'next-auth/middleware';

export default withAuth(
  function middleware(req) {
    // Additional middleware logic can be added here
    return;
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // Check if user has a valid token and is from ddroidd.com domain
        if (token?.email && token.email.endsWith('@ddroidd.com')) {
          return true;
        }
        return false;
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