/**
 * User Entity
 * Core domain entity representing a user in the system
 */

import { BaseEntity, IBaseEntity } from './base.entity';
import { UserRole, UserRoleEnum, Email } from '../value-objects';

export enum UserStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  SUSPENDED = 'SUSPENDED',
  PENDING_VERIFICATION = 'PENDING_VERIFICATION',
}

export interface IUserProps {
  email: Email;
  googleId?: string | null;
  name?: string | null;
  avatarUrl?: string | null;
  phone?: string | null;
  role: UserRole;
  status: UserStatus;
  bio?: string | null;
  skills?: string[];
}

export interface IUser extends IBaseEntity {
  email: string;
  googleId: string | null;
  name: string | null;
  avatarUrl: string | null;
  phone: string | null;
  role: string;
  status: string;
  bio: string | null;
  skills: string | null;
}

/**
 * User Entity with full domain logic
 */
export class UserEntity extends BaseEntity {
  private _email: Email;
  private _googleId: string | null;
  private _name: string | null;
  private _avatarUrl: string | null;
  private _phone: string | null;
  private _role: UserRole;
  private _status: UserStatus;
  private _bio: string | null;
  private _skills: string[];

  constructor(
    id: string,
    props: IUserProps,
    auditInfo?: Partial<ReturnType<IUserProps['email']['toObject']>> & {
      createdAt?: Date;
      updatedAt?: Date;
      createdBy?: string | null;
      updatedBy?: string | null;
    },
    softDeleteInfo?: {
      isDeleted?: boolean;
      deletedAt?: Date | null;
      deletedBy?: string | null;
    },
    versionInfo?: { version?: number }
  ) {
    super(id, auditInfo, softDeleteInfo, versionInfo);
    this._email = props.email;
    this._googleId = props.googleId ?? null;
    this._name = props.name ?? null;
    this._avatarUrl = props.avatarUrl ?? null;
    this._phone = props.phone ?? null;
    this._role = props.role;
    this._status = props.status;
    this._bio = props.bio ?? null;
    this._skills = props.skills ?? [];
  }

  // Getters
  get email(): Email {
    return this._email;
  }

  get googleId(): string | null {
    return this._googleId;
  }

  get name(): string | null {
    return this._name;
  }

  get avatarUrl(): string | null {
    return this._avatarUrl;
  }

  get phone(): string | null {
    return this._phone;
  }

  get role(): UserRole {
    return this._role;
  }

  get status(): UserStatus {
    return this._status;
  }

  get bio(): string | null {
    return this._bio;
  }

  get skills(): string[] {
    return [...this._skills];
  }

  // Business Logic Methods

  /**
   * Update user profile
   */
  updateProfile(
    data: {
      name?: string;
      bio?: string;
      phone?: string;
      avatarUrl?: string;
    },
    userId: string
  ): void {
    if (!this.canModify(userId)) {
      throw new Error('Cannot modify deleted user');
    }
    if (data.name !== undefined) this._name = data.name;
    if (data.bio !== undefined) this._bio = data.bio;
    if (data.phone !== undefined) this._phone = data.phone;
    if (data.avatarUrl !== undefined) this._avatarUrl = data.avatarUrl;
    this.markUpdated(userId);
  }

  /**
   * Update user skills
   */
  updateSkills(skills: string[], userId: string): void {
    if (!this.canModify(userId)) {
      throw new Error('Cannot modify deleted user');
    }
    this._skills = skills;
    this.markUpdated(userId);
  }

  /**
   * Set user role (Admin only operation)
   */
  setRole(newRole: UserRole, adminId: string): void {
    if (!this.canModify(adminId)) {
      throw new Error('Cannot modify deleted user');
    }
    this._role = newRole;
    this.markUpdated(adminId);
  }

  /**
   * Activate user account
   */
  activate(): void {
    if (this._status === UserStatus.ACTIVE) {
      return;
    }
    this._status = UserStatus.ACTIVE;
  }

  /**
   * Deactivate user account
   */
  deactivate(): void {
    if (this._status === UserStatus.INACTIVE) {
      return;
    }
    this._status = UserStatus.INACTIVE;
  }

  /**
   * Suspend user account
   */
  suspend(): void {
    this._status = UserStatus.SUSPENDED;
  }

  /**
   * Link Google account
   */
  linkGoogleAccount(googleId: string): void {
    if (this._googleId) {
      throw new Error('Google account already linked');
    }
    this._googleId = googleId;
  }

  /**
   * Check if user is active
   */
  isActive(): boolean {
    return this._status === UserStatus.ACTIVE && !this.isDeleted;
  }

  /**
   * Check if user can be a mentor
   */
  canBeMentor(): boolean {
    return (
      this._role.isMentor() || this._role.isAdmin()
    ) && this.isActive();
  }

  /**
   * Check if user can book sessions
   */
  canBookSessions(): boolean {
    return this.isActive();
  }

  /**
   * Create new user from Google OAuth
   */
  static createFromGoogle(
    id: string,
    email: string,
    googleId: string,
    name?: string,
    avatarUrl?: string
  ): UserEntity {
    return new UserEntity(
      id,
      {
        email: new Email(email),
        googleId,
        name: name ?? null,
        avatarUrl: avatarUrl ?? null,
        role: UserRole.createDefault(),
        status: UserStatus.ACTIVE,
      }
    );
  }

  /**
   * Convert to plain object for persistence
   */
  toObject(): IUser {
    return {
      ...super.toObject(),
      email: this._email.value,
      googleId: this._googleId,
      name: this._name,
      avatarUrl: this._avatarUrl,
      phone: this._phone,
      role: this._role.value,
      status: this._status,
      bio: this._bio,
      skills: this._skills.length > 0 ? JSON.stringify(this._skills) : null,
    };
  }
}
