import NextAuth, { Session } from 'next-auth';
import AzureADProvider from 'next-auth/providers/azure-ad';
import CredentialsProvider from 'next-auth/providers/credentials';
import { JWT } from 'next-auth/jwt';
import { z } from 'zod';
import { 
  ExtendedUser, 
  ExtendedJWT, 
  LoginRequest, 
  LoginResponse,
  isValidLoginResponse 
} from '@/types/auth';

const credentialsSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

async function createBackendToken(user: ExtendedUser): Promise<{ token: string; expiresAt: number }> {
  const payload = {
    userId: user.id,
    email: user.email,
    role: user.role,
    iss: 'nextjs-frontend',
    aud: 'nodejs-backend',
  };

  const expiresAt = Math.floor(Date.now() / 1000) + (60 * 60); // 1 hour

  const { SignJWT } = await import('jose');
  const secret = new TextEncoder().encode(process.env.NEXTAUTH_SECRET);
  
  const token = await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(expiresAt)
    .sign(secret);

  return { token, expiresAt };
}

const handler = NextAuth({
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: 'jwt',
    maxAge: 8 * 60 * 60, // 8 hours
    updateAge: 60 * 60, // Update session every hour
  },
  jwt: {
    maxAge: 8 * 60 * 60, // 8 hours
  },
  providers: [
    // Azure AD Provider with enhanced security
    ...(process.env.AZURE_AD_CLIENT_ID ? [
      AzureADProvider({
        clientId: process.env.AZURE_AD_CLIENT_ID!,
        clientSecret: process.env.AZURE_AD_CLIENT_SECRET!,
        tenantId: process.env.AZURE_AD_TENANT_ID!,
        authorization: {
          params: {
            scope: 'openid profile email User.Read',
            response_type: 'code',
            prompt: 'consent', // Force consent for better security
          },
        },
      })
    ] : []),

    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email', placeholder: 'user@ddroidd.com' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials, req): Promise<ExtendedUser | null> {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Email and password are required');
        }

        const validationResult = credentialsSchema.safeParse(credentials);
        if (!validationResult.success) {
          throw new Error('Invalid email or password format');
        }

        const clientIP = req.headers?.['x-forwarded-for'] || req.headers?.['x-real-ip'];

        try {
          const loginPayload: LoginRequest = {
            email: validationResult.data.email,
            password: validationResult.data.password,
          };

          const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/auth/login`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'X-Client-IP': clientIP as string || '',
              'X-User-Agent': req.headers?.['user-agent'] || '',
            },
            body: JSON.stringify(loginPayload),
          });

          if (!res.ok) {
            const errorData = await res.json().catch(() => ({}));
            throw new Error(errorData.error || 'Authentication failed');
          }

          const userData: LoginResponse = await res.json();

          if (!isValidLoginResponse(userData) || !userData.user?.isActive) {
            throw new Error('Account is inactive or invalid response');
          }

          return {
            id: userData.user.id,
            email: userData.user.email,
            name: userData.user.name,
            role: userData.user.role,
            isActive: userData.user.isActive,
            createdAt: userData.user.createdAt,
            updatedAt: userData.user.updatedAt,
          };
        } catch (error) {
          console.error('Authentication error:', error);
          throw new Error(error instanceof Error ? error.message : 'Authentication failed');
        }
      }
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      try {
        if (account?.provider === 'azure-ad') {
          const email = user?.email || (profile as any)?.email;
          
          // Validate domain
          if (!email || !email.endsWith('@ddroidd.com')) {
            console.warn(`Unauthorized domain access attempt: ${email}`);
            return '/auth/error?error=AccessDenied';
          }
        }
        
        console.info(`Successful sign-in: ${user.email} via ${account?.provider}`);
        return true;
      } catch (error) {
        console.error('SignIn callback error:', error);
        return '/auth/error?error=CallbackError';
      }
    },
    async jwt({ token, user, account }): Promise<ExtendedJWT> {
      const extendedToken = token as ExtendedJWT;

      if (user && account) {
        const extendedUser = user as ExtendedUser;
        extendedToken.id = extendedUser.id;
        extendedToken.role = extendedUser.role || 'user';
        extendedToken.provider = account.provider;

        // Create backend token for API calls
        try {
          const { token: backendToken, expiresAt } = await createBackendToken(extendedUser);
          extendedToken.backendToken = backendToken;
          extendedToken.tokenExpiry = expiresAt;
        } catch (error) {
          console.error('Failed to create backend token:', error);
        }
      }

      return extendedToken;
    },
    async session({ session, token }: { session: Session, token: JWT }) {
      const extendedToken = token as ExtendedJWT;
      
      if (extendedToken && session.user) {
        session.user.role = extendedToken.role;
        (session.user as any).id = extendedToken.id;
        (session as any).backendToken = extendedToken.backendToken;
      }
      (session as any).accessToken = token;
      return session;
    },
    async redirect({ url, baseUrl }) {
      // Secure redirect logic
      if (url.startsWith('/')) {
        return `${baseUrl}${url}`;
      } else if (new URL(url).origin === baseUrl) {
        return url;
      }
      return baseUrl;
    },
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
  cookies: {
    sessionToken: {
      name: process.env.NODE_ENV === 'production' 
        ? `__Secure-next-auth.session-token` 
        : `next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        domain: 'localhost', // This allows sharing across ports on localhost
        secure: process.env.NODE_ENV === 'production',
        maxAge: 8 * 60 * 60, // 8 hours
      },
    },
  },
  events: {
    async signIn({ user, account, isNewUser }) {
      // Security audit logging
      console.info('User signed in:', {
        userId: user.id,
        email: user.email,
        provider: account?.provider,
        isNewUser,
        timestamp: new Date().toISOString(),
      });
    },
    async signOut({ token }) {
      // Cleanup and audit logging
      console.info('User signed out:', {
        userId: (token as ExtendedJWT)?.id,
        timestamp: new Date().toISOString(),
      });
    },
  },
  debug: process.env.NODE_ENV === 'development',
  logger: {
    error(code, metadata) {
      console.error('NextAuth Error:', code, metadata);
    },
    warn(code) {
      console.warn('NextAuth Warning:', code);
    },
    debug(code, metadata) {
      if (process.env.NODE_ENV === 'development') {
        console.debug('NextAuth Debug:', code, metadata);
      }
    },
  },
});

export { handler as GET, handler as POST }; 