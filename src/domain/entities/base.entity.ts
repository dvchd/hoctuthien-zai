/**
 * Base Entity with Audit, Versioning and Soft Delete support
 * Following DDD principles for Clean Architecture
 */

export interface IAuditInfo {
  createdAt: Date;
  updatedAt: Date;
  createdBy: string | null;
  updatedBy: string | null;
}

export interface ISoftDeletable {
  isDeleted: boolean;
  deletedAt: Date | null;
  deletedBy: string | null;
}

export interface IVersioned {
  version: number;
}

export interface IBaseEntity extends IAuditInfo, ISoftDeletable, IVersioned {
  id: string;
}

/**
 * Abstract base entity class providing common functionality
 * for all domain entities including audit tracking, soft delete, and optimistic concurrency
 */
export abstract class BaseEntity implements IBaseEntity {
  readonly id: string;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string | null;
  updatedBy: string | null;
  isDeleted: boolean;
  deletedAt: Date | null;
  deletedBy: string | null;
  version: number;

  constructor(
    id: string,
    auditInfo?: Partial<IAuditInfo>,
    softDeleteInfo?: Partial<ISoftDeletable>,
    versionInfo?: Partial<IVersioned>
  ) {
    this.id = id;
    this.createdAt = auditInfo?.createdAt ?? new Date();
    this.updatedAt = auditInfo?.updatedAt ?? new Date();
    this.createdBy = auditInfo?.createdBy ?? null;
    this.updatedBy = auditInfo?.updatedBy ?? null;
    this.isDeleted = softDeleteInfo?.isDeleted ?? false;
    this.deletedAt = softDeleteInfo?.deletedAt ?? null;
    this.deletedBy = softDeleteInfo?.deletedBy ?? null;
    this.version = versionInfo?.version ?? 0;
  }

  /**
   * Mark entity as updated by a user
   */
  markUpdated(userId: string): void {
    this.updatedAt = new Date();
    this.updatedBy = userId;
    this.incrementVersion();
  }

  /**
   * Mark entity as created by a user
   */
  markCreated(userId: string): void {
    this.createdAt = new Date();
    this.createdBy = userId;
    this.updatedAt = new Date();
    this.updatedBy = userId;
  }

  /**
   * Soft delete the entity
   */
  softDelete(userId: string): void {
    if (this.isDeleted) {
      throw new Error('Entity is already deleted');
    }
    this.isDeleted = true;
    this.deletedAt = new Date();
    this.deletedBy = userId;
    this.incrementVersion();
  }

  /**
   * Restore a soft-deleted entity
   */
  restore(): void {
    if (!this.isDeleted) {
      throw new Error('Entity is not deleted');
    }
    this.isDeleted = false;
    this.deletedAt = null;
    this.deletedBy = null;
    this.incrementVersion();
  }

  /**
   * Increment version for optimistic concurrency
   */
  protected incrementVersion(): void {
    this.version += 1;
  }

  /**
   * Check if entity can be modified
   */
  canModify(userId: string): boolean {
    return !this.isDeleted;
  }

  /**
   * Validate version for optimistic concurrency control
   */
  validateVersion(expectedVersion: number): boolean {
    return this.version === expectedVersion;
  }

  /**
   * Convert to plain object for persistence
   */
  toObject(): IBaseEntity {
    return {
      id: this.id,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      createdBy: this.createdBy,
      updatedBy: this.updatedBy,
      isDeleted: this.isDeleted,
      deletedAt: this.deletedAt,
      deletedBy: this.deletedBy,
      version: this.version,
    };
  }
}
