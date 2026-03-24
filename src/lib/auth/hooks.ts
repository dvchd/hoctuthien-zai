/**
 * Auth exports
 */

export { authOptions, handler } from './index';
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
