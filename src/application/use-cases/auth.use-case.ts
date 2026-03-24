/**
 * Authentication Use Cases
 */

import { PrismaClient } from '@prisma/client';
import { UserEntity, UserStatus, IUserRepository } from '../../domain';
import { UserRepository } from '../../infrastructure/repositories';
import { UserRole, UserRoleEnum, Email } from '../../domain/value-objects';
import { IGoogleLoginDto, IAuthResponseDto, ICurrentUserDto } from '../dto';
import { EntityNotFoundError } from '../../domain/errors';
import { v4 as uuidv4 } from 'uuid';

export class AuthUseCase {
  private userRepository: IUserRepository;

  constructor(prisma: PrismaClient) {
    this.userRepository = new UserRepository(prisma);
  }

  /**
   * Handle Google OAuth login/register
   */
  async handleGoogleLogin(data: IGoogleLoginDto): Promise<IAuthResponseDto> {
    try {
      // Check if user exists with Google ID
      let user = await this.userRepository.findByGoogleId(data.googleId);

      if (user) {
        // Update user info if needed
        if (data.name && data.name !== user.name) {
          user.updateProfile({ name: data.name }, user.id);
          user = await this.userRepository.save(user);
        }
        return this.toAuthResponse(user);
      }

      // Check if user exists with email
      user = await this.userRepository.findByEmail(data.email);

      if (user) {
        // Link Google account to existing user
        user.linkGoogleAccount(data.googleId);
        if (data.name && !user.name) {
          user.updateProfile({ name: data.name }, user.id);
        }
        user = await this.userRepository.save(user);
        return this.toAuthResponse(user);
      }

      // Create new user
      const newUser = UserEntity.createFromGoogle(
        uuidv4(),
        data.email,
        data.googleId,
        data.name,
        data.avatarUrl
      );
      newUser.markCreated('system');

      const savedUser = await this.userRepository.save(newUser);
      return this.toAuthResponse(savedUser);
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Authentication failed',
      };
    }
  }

  /**
   * Get current user by ID
   */
  async getCurrentUser(userId: string): Promise<ICurrentUserDto | null> {
    const user = await this.userRepository.findById(userId);
    if (!user) return null;

    return {
      id: user.id,
      email: user.email.value,
      name: user.name,
      avatarUrl: user.avatarUrl,
      role: user.role.value,
      status: user.status,
      isAdmin: user.role.isAdmin(),
      isMentor: user.role.isMentor(),
      isMentee: user.role.isMentee(),
    };
  }

  /**
   * Validate user session
   */
  async validateUser(userId: string): Promise<boolean> {
    const user = await this.userRepository.findById(userId);
    return user !== null && user.isActive();
  }

  private toAuthResponse(user: UserEntity): IAuthResponseDto {
    return {
      success: true,
      user: {
        id: user.id,
        email: user.email.value,
        name: user.name,
        avatarUrl: user.avatarUrl,
        role: user.role.value,
        status: user.status,
      },
    };
  }
}
