/**
 * NextAuth Configuration
 * Google OAuth authentication for Hoc Tu Thien platform
 */

import NextAuth, { NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import { db } from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';

// Configure cookies for production (HTTPS)
// Use environment-aware cookie configuration
const useSecureCookies = process.env.NODE_ENV === 'production' || process.env.NEXTAUTH_URL?.startsWith('https');
const cookiePrefix = useSecureCookies ? '__Secure-' : '';

export const authOptions: NextAuthOptions = {
  // Don't use PrismaAdapter - handle user creation manually
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? '',
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          scope: "openid email profile"
        }
      },
      allowDangerousEmailAccountLinking: true,
    }),
  ],

  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },

  pages: {
    signIn: '/login',
    signOut: '/login',
    error: '/login',
    newUser: '/dashboard',
  },

  cookies: {
    sessionToken: {
      name: `${cookiePrefix}next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: useSecureCookies,
      },
    },
    callbackUrl: {
      name: `${cookiePrefix}next-auth.callback-url`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: useSecureCookies,
      },
    },
    csrfToken: {
      name: `${cookiePrefix}next-auth.csrf-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: useSecureCookies,
      },
    },
    pkceCodeVerifier: {
      name: `${cookiePrefix}next-auth.pkce.code_verifier`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: useSecureCookies,
      },
    },
    state: {
      name: `${cookiePrefix}next-auth.state`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: useSecureCookies,
      },
    },
    nonce: {
      name: `${cookiePrefix}next-auth.nonce`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: useSecureCookies,
      },
    },
  },

  callbacks: {
    async signIn({ user, account, profile }) {
      console.log('=== SIGN IN CALLBACK ===');
      console.log('email:', user.email);
      console.log('provider:', account?.provider);
      console.log('account type:', account?.type);
      console.log('profile:', JSON.stringify(profile, null, 2));

      if (account?.provider === 'google' && user.email) {
        try {
          // Find or create user directly in database
          let existingUser = await db.user.findUnique({
            where: { email: user.email.toLowerCase() }
          });

          if (!existingUser) {
            // Create new user
            console.log('Creating new user...');
            existingUser = await db.user.create({
              data: {
                id: uuidv4(),
                email: user.email.toLowerCase(),
                name: user.name ?? null,
                avatarUrl: user.image ?? null,
                googleId: account.providerAccountId,
                role: 'MENTEE',
                status: 'ACTIVE',
                createdBy: 'system',
                updatedBy: 'system',
              }
            });
            console.log('User created:', existingUser.id);
          } else if (!existingUser.googleId) {
            // Link Google account to existing user
            console.log('Linking Google account to existing user...');
            existingUser = await db.user.update({
              where: { id: existingUser.id },
              data: {
                googleId: account.providerAccountId,
                avatarUrl: user.image ?? existingUser.avatarUrl,
                name: user.name ?? existingUser.name,
              }
            });
            console.log('Google account linked');
          }

          // Store user info in the user object for JWT callback
          (user as any).dbId = existingUser.id;
          (user as any).dbRole = existingUser.role;

          console.log('SignIn success - dbId:', existingUser.id, 'role:', existingUser.role);
          return true;
        } catch (error) {
          console.error('Error during sign in:', error);
          return false;
        }
      }
      return true;
    },

    async jwt({ token, user, account, trigger, session }) {
      console.log('=== JWT CALLBACK ===');

      // Initial sign in
      if (user) {
        const dbId = (user as any).dbId;
        const dbRole = (user as any).dbRole;

        token.id = dbId;
        token.email = user.email;
        token.name = user.name;
        token.picture = user.image;
        token.role = dbRole || 'MENTEE';

        console.log('JWT initial - id:', token.id, 'role:', token.role);
        return token;
      }

      // On subsequent calls, refresh user data from database
      if (token.email) {
        try {
          const dbUser = await db.user.findUnique({
            where: { email: token.email as string }
          });

          if (dbUser) {
            token.id = dbUser.id;
            token.role = dbUser.role;
            token.name = dbUser.name;
            token.picture = dbUser.avatarUrl;
          }
        } catch (error) {
          console.error('Error refreshing token:', error);
        }
      }

      // Handle session update
      if (trigger === 'update' && session) {
        token.name = session.name;
      }

      return token;
    },

    async session({ session, token }) {
      console.log('=== SESSION CALLBACK ===');

      if (session.user) {
        session.user.id = token.id as string;
        session.user.email = token.email as string;
        session.user.name = token.name as string;
        session.user.image = token.picture as string;
        (session.user as any).role = token.role as string;

        console.log('Session - id:', session.user.id, 'role:', (session.user as any).role);
      }
      return session;
    },

    async redirect({ url, baseUrl }) {
      console.log('=== REDIRECT CALLBACK ===');
      console.log('url:', url, 'baseUrl:', baseUrl);

      // If url is just the baseUrl (no path), redirect to dashboard
      if (url === baseUrl || url === `${baseUrl}/`) {
        return `${baseUrl}/dashboard`;
      }

      // Allows relative callback URLs
      if (url.startsWith('/')) return `${baseUrl}${url}`;
      
      // Allows callback URLs on the same origin
      try {
        const parsedUrl = new URL(url);
        if (parsedUrl.origin === baseUrl) {
          // If path is just /, redirect to /dashboard
          if (parsedUrl.pathname === '/' || parsedUrl.pathname === '') {
            return `${baseUrl}/dashboard`;
          }
          return url;
        }
      } catch {
        // Invalid URL, use base
      }
      return `${baseUrl}/dashboard`;
    },
  },

  events: {
    async signIn({ user, account, isNewUser }) {
      console.log(`[Event] User signed in: ${user.email}`);
    },
    async signOut({ token }) {
      console.log(`[Event] User signed out: ${token?.email}`);
    },
  },

  debug: true,
};

export const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };

// Re-export from other files
export { useAuth } from './client';
export { AuthProvider } from './provider';
export { RoleGuard, AdminOnly, MentorOnly } from './guards';
export {
  getAuthSession,
  getCurrentUser,
  isAuthenticated,
  hasRole,
  requireAuth,
  requireAdmin,
} from './session';
