/**
 * User Repository Implementation
 * Implements IUserRepository interface using Prisma
 */

import { PrismaClient, User, UserRole as PrismaUserRole, UserStatus as PrismaUserStatus } from '@prisma/client';
import {
  UserEntity,
  UserStatus,
  IUserFilter,
  IPaginationParams,
  IPaginatedResult,
  IUserRepository,
} from '../../domain';
import { UserRole, UserRoleEnum, Email } from '../../domain/value-objects';
import { EntityNotFoundError, OptimisticConcurrencyError } from '../../domain/errors';

/**
 * Maps Prisma User to Domain UserEntity
 */
function toDomainEntity(prismaUser: User): UserEntity {
  return new UserEntity(
    prismaUser.id,
    {
      email: new Email(prismaUser.email),
      googleId: prismaUser.googleId,
      name: prismaUser.name,
      avatarUrl: prismaUser.avatarUrl,
      phone: prismaUser.phone,
      role: new UserRole(prismaUser.role as UserRoleEnum),
      status: prismaUser.status as UserStatus,
      bio: prismaUser.bio,
      skills: prismaUser.skills ? JSON.parse(prismaUser.skills) : [],
    },
    {
      createdAt: prismaUser.createdAt,
      updatedAt: prismaUser.updatedAt,
      createdBy: prismaUser.createdBy,
      updatedBy: prismaUser.updatedBy,
    },
    {
      isDeleted: prismaUser.isDeleted,
      deletedAt: prismaUser.deletedAt,
      deletedBy: prismaUser.deletedBy,
    },
    { version: prismaUser.version }
  );
}

/**
 * Maps Domain UserEntity to Prisma data
 */
function toPrismaData(entity: UserEntity) {
  const obj = entity.toObject();
  return {
    email: obj.email,
    googleId: obj.googleId,
    name: obj.name,
    avatarUrl: obj.avatarUrl,
    phone: obj.phone,
    role: obj.role as PrismaUserRole,
    status: obj.status as PrismaUserStatus,
    bio: obj.bio,
    skills: obj.skills,
    createdAt: obj.createdAt,
    updatedAt: obj.updatedAt,
    createdBy: obj.createdBy,
    updatedBy: obj.updatedBy,
    isDeleted: obj.isDeleted,
    deletedAt: obj.deletedAt,
    deletedBy: obj.deletedBy,
    version: obj.version,
  };
}

export class UserRepository implements IUserRepository {
  constructor(private prisma: PrismaClient) {}

  async findById(id: string): Promise<UserEntity | null> {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) return null;
    return toDomainEntity(user);
  }

  async findByEmail(email: string): Promise<UserEntity | null> {
    const user = await this.prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!user) return null;
    return toDomainEntity(user);
  }

  async findByGoogleId(googleId: string): Promise<UserEntity | null> {
    const user = await this.prisma.user.findUnique({
      where: { googleId },
    });

    if (!user) return null;
    return toDomainEntity(user);
  }

  async findAll(
    filter?: IUserFilter,
    pagination?: IPaginationParams
  ): Promise<IPaginatedResult<UserEntity>> {
    const page = pagination?.page ?? 1;
    const limit = pagination?.limit ?? 10;
    const skip = (page - 1) * limit;

    const where = {
      ...(filter?.role && { role: filter.role as PrismaUserRole }),
      ...(filter?.status && { status: filter.status as PrismaUserStatus }),
      ...(filter?.isDeleted !== undefined && { isDeleted: filter.isDeleted }),
      ...(filter?.search && {
        OR: [
          { name: { contains: filter.search } },
          { email: { contains: filter.search } },
        ],
      }),
    };

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.user.count({ where }),
    ]);

    return {
      data: users.map(toDomainEntity),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async save(entity: UserEntity): Promise<UserEntity> {
    const data = toPrismaData(entity);
    const obj = entity.toObject();

    // Check if this is an update or create
    const existing = await this.prisma.user.findUnique({
      where: { id: obj.id },
    });

    if (existing) {
      // Optimistic concurrency check
      if (existing.version !== obj.version - 1) {
        throw new OptimisticConcurrencyError('User', obj.id);
      }

      const updated = await this.prisma.user.update({
        where: { id: obj.id },
        data,
      });
      return toDomainEntity(updated);
    }

    // Create new
    const created = await this.prisma.user.create({
      data: {
        id: obj.id,
        ...data,
      },
    });
    return toDomainEntity(created);
  }

  async delete(id: string, deletedBy: string): Promise<void> {
    const user = await this.findById(id);
    if (!user) {
      throw new EntityNotFoundError('User', id);
    }

    user.softDelete(deletedBy);
    await this.save(user);
  }

  async restore(id: string): Promise<UserEntity> {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new EntityNotFoundError('User', id);
    }

    if (!user.isDeleted) {
      throw new Error('User is not deleted');
    }

    const entity = toDomainEntity(user);
    entity.restore();

    return this.save(entity);
  }

  async emailExists(email: string): Promise<boolean> {
    const count = await this.prisma.user.count({
      where: { email: email.toLowerCase() },
    });
    return count > 0;
  }

  async countByRole(role: UserRoleEnum): Promise<number> {
    return this.prisma.user.count({
      where: {
        role: role as PrismaUserRole,
        isDeleted: false,
        status: PrismaUserStatus.ACTIVE,
      },
    });
  }

  async countActiveUsers(): Promise<number> {
    return this.prisma.user.count({
      where: {
        isDeleted: false,
        status: PrismaUserStatus.ACTIVE,
      },
    });
  }
}
