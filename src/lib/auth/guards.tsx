'use client';

/**
 * Role-based access control component
 */

import { ReactNode } from 'react';
import { useAuth } from './client';

interface RoleGuardProps {
  children: ReactNode;
  allowedRoles?: ('ADMIN' | 'MENTOR' | 'MENTEE')[];
  requireAdmin?: boolean;
  requireMentor?: boolean;
  fallback?: ReactNode;
}

export function RoleGuard({
  children,
  allowedRoles,
  requireAdmin = false,
  requireMentor = false,
  fallback = null,
}: RoleGuardProps) {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <>{fallback}</>;
  }

  // Check role requirements
  if (requireAdmin && !user.isAdmin) {
    return <>{fallback}</>;
  }

  if (requireMentor && !user.isMentor && !user.isAdmin) {
    return <>{fallback}</>;
  }

  if (allowedRoles && !allowedRoles.includes(user.role as 'ADMIN' | 'MENTOR' | 'MENTEE')) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

interface AdminOnlyProps {
  children: ReactNode;
  fallback?: ReactNode;
}

export function AdminOnly({ children, fallback = null }: AdminOnlyProps) {
  return (
    <RoleGuard requireAdmin fallback={fallback}>
      {children}
    </RoleGuard>
  );
}

interface MentorOnlyProps {
  children: ReactNode;
  fallback?: ReactNode;
}

export function MentorOnly({ children, fallback = null }: MentorOnlyProps) {
  return (
    <RoleGuard requireMentor fallback={fallback}>
      {children}
    </RoleGuard>
  );
}
