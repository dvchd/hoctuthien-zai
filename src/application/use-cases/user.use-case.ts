/**
 * User Use Cases
 */

import { PrismaClient } from '@prisma/client';
import {
  UserEntity,
  UserStatus,
  IUserRepository,
  UserRoleEnum,
} from '../../domain';
import { UserRepository } from '../../infrastructure/repositories';
import { UserRole } from '../../domain/value-objects';
import {
  ICreateUserDto,
  IUpdateUserDto,
  IUserResponseDto,
  IUserListQueryDto,
  IUserListResponseDto,
} from '../dto';
import {
  EntityNotFoundError,
  EntityAlreadyExistsError,
  ForbiddenError,
} from '../../domain/errors';
import { v4 as uuidv4 } from 'uuid';

export class UserUseCase {
  private userRepository: IUserRepository;

  constructor(prisma: PrismaClient) {
    this.userRepository = new UserRepository(prisma);
  }

  /**
   * Get user by ID
   */
  async getUserById(id: string): Promise<IUserResponseDto | null> {
    const user = await this.userRepository.findById(id);
    if (!user) return null;
    return this.toResponse(user);
  }

  /**
   * List users with filtering and pagination
   */
  async listUsers(query: IUserListQueryDto): Promise<IUserListResponseDto> {
    const filter = {
      ...(query.role && { role: query.role as UserRoleEnum }),
      ...(query.status && { status: query.status as UserStatus }),
      ...(query.search && { search: query.search }),
      isDeleted: false,
    };

    const pagination = {
      page: query.page ?? 1,
      limit: query.limit ?? 10,
    };

    const result = await this.userRepository.findAll(filter, pagination);

    return {
      ...result,
      data: result.data.map(this.toResponse),
    };
  }

  /**
   * Update user profile
   */
  async updateProfile(
    userId: string,
    updateData: IUpdateUserDto,
    currentUserId: string
  ): Promise<IUserResponseDto> {
    const user = await this.userRepository.findById(userId);

    if (!user) {
      throw new EntityNotFoundError('User', userId);
    }

    // Users can only update their own profile (unless admin)
    if (userId !== currentUserId) {
      const currentUser = await this.userRepository.findById(currentUserId);
      if (!currentUser || !currentUser.role.isAdmin()) {
        throw new ForbiddenError('You can only update your own profile');
      }
    }

    user.updateProfile(
      {
        name: updateData.name,
        bio: updateData.bio,
        phone: updateData.phone,
        avatarUrl: updateData.avatarUrl,
      },
      currentUserId
    );

    if (updateData.skills) {
      user.updateSkills(updateData.skills, currentUserId);
    }

    const savedUser = await this.userRepository.save(user);
    return this.toResponse(savedUser);
  }

  /**
   * Change user role (Admin only)
   */
  async changeUserRole(
    userId: string,
    newRole: string,
    adminId: string
  ): Promise<IUserResponseDto> {
    const admin = await this.userRepository.findById(adminId);
    if (!admin || !admin.role.isAdmin()) {
      throw new ForbiddenError('Only admins can change user roles');
    }

    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new EntityNotFoundError('User', userId);
    }

    user.setRole(new UserRole(newRole as UserRoleEnum), adminId);
    const savedUser = await this.userRepository.save(user);

    return this.toResponse(savedUser);
  }

  /**
   * Soft delete user (Admin only)
   */
  async deleteUser(userId: string, adminId: string): Promise<void> {
    const admin = await this.userRepository.findById(adminId);
    if (!admin || !admin.role.isAdmin()) {
      throw new ForbiddenError('Only admins can delete users');
    }

    await this.userRepository.delete(userId, adminId);
  }

  /**
   * Restore deleted user (Admin only)
   */
  async restoreUser(userId: string, adminId: string): Promise<IUserResponseDto> {
    const admin = await this.userRepository.findById(adminId);
    if (!admin || !admin.role.isAdmin()) {
      throw new ForbiddenError('Only admins can restore users');
    }

    const user = await this.userRepository.restore(userId);
    return this.toResponse(user);
  }

  /**
   * Get user statistics
   */
  async getUserStats(): Promise<{
    totalUsers: number;
    activeUsers: number;
    mentors: number;
    mentees: number;
    admins: number;
  }> {
    const [activeUsers, mentors, mentees, admins] = await Promise.all([
      this.userRepository.countActiveUsers(),
      this.userRepository.countByRole(UserRoleEnum.MENTOR),
      this.userRepository.countByRole(UserRoleEnum.MENTEE),
      this.userRepository.countByRole(UserRoleEnum.ADMIN),
    ]);

    return {
      totalUsers: activeUsers,
      activeUsers,
      mentors,
      mentees,
      admins,
    };
  }

  private toResponse(user: UserEntity): IUserResponseDto {
    return {
      id: user.id,
      email: user.email.value,
      name: user.name,
      avatarUrl: user.avatarUrl,
      phone: user.phone,
      role: user.role.value,
      status: user.status,
      bio: user.bio,
      skills: user.skills,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}
