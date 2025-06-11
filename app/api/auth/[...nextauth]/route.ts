import NextAuth from 'next-auth';
import AzureADProvider from 'next-auth/providers/azure-ad';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';

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
    name: 'Test User',
    role: 'user'
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
    async jwt({ token, account, profile }) {
      if (account) {
        token.accessToken = account.access_token;
      }
      return token;
    },
    async session({ session, token }) {
      session.accessToken = token.accessToken;
      return session;
    },
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
});

export { handler as GET, handler as POST }; 