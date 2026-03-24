/**
 * Authentication utilities
 */

import { getServerSession } from 'next-auth/next';
import { authOptions } from './index';
import { ICurrentUserDto } from '@/application';
import { db } from '@/lib/db';

/**
 * Get the current session on the server side
 */
export async function getAuthSession() {
  return getServerSession(authOptions);
}

/**
 * Get the current user from the session with full info from database
 */
export async function getCurrentUser(): Promise<ICurrentUserDto | null> {
  const session = await getAuthSession();

  if (!session?.user?.email) {
    return null;
  }

  // Fetch full user info from database including isActivated
  try {
    const dbUser = await db.user.findUnique({
      where: { email: session.user.email.toLowerCase() },
      select: {
        id: true,
        email: true,
        name: true,
        avatarUrl: true,
        role: true,
        status: true,
        isActivated: true,
      },
    });

    if (!dbUser) {
      return null;
    }

    return {
      id: dbUser.id,
      email: dbUser.email,
      name: dbUser.name,
      avatarUrl: dbUser.avatarUrl,
      role: dbUser.role,
      status: dbUser.status,
      isAdmin: dbUser.role === 'ADMIN',
      isMentor: dbUser.role === 'MENTOR',
      isMentee: dbUser.role === 'MENTEE',
      isActivated: dbUser.isActivated,
    };
  } catch (error) {
    console.error('Error fetching current user:', error);
    return null;
  }
}

/**
 * Check if user is authenticated
 */
export async function isAuthenticated(): Promise<boolean> {
  const session = await getAuthSession();
  return !!session?.user;
}

/**
 * Check if user has required role
 */
export async function hasRole(requiredRole: 'ADMIN' | 'MENTOR' | 'MENTEE'): Promise<boolean> {
  const user = await getCurrentUser();
  if (!user) return false;

  const roleHierarchy = {
    ADMIN: 3,
    MENTOR: 2,
    MENTEE: 1,
  };

  const userRoleLevel = roleHierarchy[user.role as keyof typeof roleHierarchy] ?? 0;
  const requiredRoleLevel = roleHierarchy[requiredRole];

  return userRoleLevel >= requiredRoleLevel;
}

/**
 * Require authentication - throws if not authenticated
 */
export async function requireAuth(): Promise<ICurrentUserDto> {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error('Authentication required');
  }
  return user;
}

/**
 * Require admin role - throws if not admin
 */
export async function requireAdmin(): Promise<ICurrentUserDto> {
  const user = await requireAuth();
  if (!user.isAdmin) {
    throw new Error('Admin access required');
  }
  return user;
}
