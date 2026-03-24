'use client';

/**
 * Authentication hook for client components
 */

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useCallback } from 'react';

export interface UseAuthReturn {
  user: {
    id: string;
    email: string;
    name: string | null;
    avatarUrl: string | null;
    role: string;
    isAdmin: boolean;
    isMentor: boolean;
    isMentee: boolean;
  } | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: () => void;
  logout: () => void;
}

export function useAuth(): UseAuthReturn {
  const { data: session, status } = useSession();
  const router = useRouter();

  const user = session?.user
    ? {
        id: session.user.id ?? '',
        email: session.user.email ?? '',
        name: session.user.name ?? null,
        avatarUrl: session.user.image ?? null,
        role: (session.user as any).role ?? 'MENTEE',
        isAdmin: (session.user as any).role === 'ADMIN',
        isMentor: (session.user as any).role === 'MENTOR',
        isMentee: (session.user as any).role === 'MENTEE',
      }
    : null;

  const login = useCallback(() => {
    router.push('/login');
  }, [router]);

  const logout = useCallback(() => {
    router.push('/api/auth/signout');
  }, [router]);

  return {
    user,
    isAuthenticated: status === 'authenticated',
    isLoading: status === 'loading',
    login,
    logout,
  };
}
