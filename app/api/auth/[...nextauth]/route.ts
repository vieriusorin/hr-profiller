import NextAuth, { Session } from 'next-auth';
import AzureADProvider from 'next-auth/providers/azure-ad';
import CredentialsProvider from 'next-auth/providers/credentials';
import { JWT } from 'next-auth/jwt';

// In-memory user store (replace with database in production)
const users = [
  {
    id: '1',
    email: 'admin@ddroidd.com',
    password: 'password123', // Plain text for testing - will be hashed in production
    name: 'Admin User',
    role: 'admin'
  },
  {
    id: '2',
    email: 'user@ddroidd.com',
    password: 'password123', // Plain text for testing - will be hashed in production
    name: 'Basic User',
    role: 'user'
  },
  {
    id: '3',
    email: 'hr.manager@ddroidd.com',
    password: 'password123',
    name: 'Sarah Johnson',
    role: 'hr_manager'
  },
  {
    id: '4',
    email: 'recruiter@ddroidd.com',
    password: 'password123',
    name: 'Mike Chen',
    role: 'recruiter'
  },
  {
    id: '5',
    email: 'employee@ddroidd.com',
    password: 'password123',
    name: 'Emma Davis',
    role: 'employee'
  }
];

const handler = NextAuth({
  providers: [
    // Azure AD Provider (commented out until configured)
    ...(process.env.AZURE_AD_CLIENT_ID ? [
      AzureADProvider({
        clientId: process.env.AZURE_AD_CLIENT_ID!,
        clientSecret: process.env.AZURE_AD_CLIENT_SECRET!,
        tenantId: process.env.AZURE_AD_TENANT_ID!,
      })
    ] : []),

    // Credentials Provider for username/password auth
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email', placeholder: 'user@ddroidd.com' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        // Check if email is from ddroidd.com domain
        if (!credentials.email.endsWith('@ddroidd.com')) {
          throw new Error('Only @ddroidd.com email addresses are allowed');
        }

        // Find user in our store
        const user = users.find(u => u.email === credentials.email);

        if (!user) {
          throw new Error('No user found with this email');
        }

        // Verify password (using plain text for testing - use bcrypt in production)
        const isPasswordValid = credentials.password === user.password;

        if (!isPasswordValid) {
          throw new Error('Invalid password');
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        };
      }
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === 'azure-ad') {
        // Check if the user's email is from the ddroidd.com domain
        const email = user?.email || profile?.email;
        if (email && email.endsWith('@ddroidd.com')) {
          return true;
        }
        return false;
      }
      return true;
    },
    async jwt({ token, account, user }) {
      if (account) {
        token.accessToken = account.access_token;
      }

      // Add role to token
      if (user) {
        token.role = user.role;
      }

      return token;
    },
    async session({ session, token }: { session: Session, token: JWT }) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (session as any).accessToken = token.accessToken;

      // Add role to session
      if (token.role) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (session.user as any).role = token.role;
      }

      return session;
    },
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
});

export { handler as GET, handler as POST }; 