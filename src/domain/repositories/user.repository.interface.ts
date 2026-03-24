/**
 * User Repository Interface
 * Defines the contract for user persistence operations
 */

import { UserEntity, UserStatus } from '../entities';
import { UserRoleEnum } from '../value-objects';

export interface IUserFilter {
  role?: UserRoleEnum;
  status?: UserStatus;
  isDeleted?: boolean;
  search?: string;
}

export interface IPaginationParams {
  page: number;
  limit: number;
}

export interface IPaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface IUserRepository {
  /**
   * Find user by ID
   */
  findById(id: string): Promise<UserEntity | null>;

  /**
   * Find user by email
   */
  findByEmail(email: string): Promise<UserEntity | null>;

  /**
   * Find user by Google ID
   */
  findByGoogleId(googleId: string): Promise<UserEntity | null>;

  /**
   * Find all users with filtering and pagination
   */
  findAll(
    filter?: IUserFilter,
    pagination?: IPaginationParams
  ): Promise<IPaginatedResult<UserEntity>>;

  /**
   * Save user (create or update)
   */
  save(user: UserEntity): Promise<UserEntity>;

  /**
   * Delete user (soft delete)
   */
  delete(id: string, deletedBy: string): Promise<void>;

  /**
   * Restore deleted user
   */
  restore(id: string): Promise<UserEntity>;

  /**
   * Check if email exists
   */
  emailExists(email: string): Promise<boolean>;

  /**
   * Count users by role
   */
  countByRole(role: UserRoleEnum): Promise<number>;

  /**
   * Count all active users
   */
  countActiveUsers(): Promise<number>;
}
