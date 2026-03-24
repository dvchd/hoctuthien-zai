import { describe, it, expect, beforeEach } from 'vitest'
import { BaseEntity, IBaseEntity } from '../entities/base.entity'

// Create a concrete implementation for testing
class TestEntity extends BaseEntity {
  constructor(
    id: string,
    auditInfo?: Partial<ReturnType<BaseEntity['toObject']>>,
    softDeleteInfo?: { isDeleted?: boolean; deletedAt?: Date | null; deletedBy?: string | null },
    versionInfo?: { version?: number }
  ) {
    super(id, auditInfo, softDeleteInfo, versionInfo)
  }

  toObject(): IBaseEntity {
    return super.toObject()
  }
}

describe('BaseEntity', () => {
  let entity: TestEntity

  beforeEach(() => {
    entity = new TestEntity('test-id')
  })

  describe('constructor', () => {
    it('should create entity with id', () => {
      expect(entity.id).toBe('test-id')
    })

    it('should set default values for audit info', () => {
      expect(entity.createdAt).toBeInstanceOf(Date)
      expect(entity.updatedAt).toBeInstanceOf(Date)
      expect(entity.createdBy).toBeNull()
      expect(entity.updatedBy).toBeNull()
    })

    it('should set default values for soft delete info', () => {
      expect(entity.isDeleted).toBe(false)
      expect(entity.deletedAt).toBeNull()
      expect(entity.deletedBy).toBeNull()
    })

    it('should set default version to 0', () => {
      expect(entity.version).toBe(0)
    })

    it('should accept custom audit info', () => {
      const customDate = new Date('2024-01-01')
      const customEntity = new TestEntity('test-id', {
        createdAt: customDate,
        createdBy: 'creator-id',
      })

      expect(customEntity.createdAt).toBe(customDate)
      expect(customEntity.createdBy).toBe('creator-id')
    })

    it('should accept custom soft delete info', () => {
      const deletedEntity = new TestEntity('test-id', {}, {
        isDeleted: true,
        deletedBy: 'deleter-id',
      })

      expect(deletedEntity.isDeleted).toBe(true)
      expect(deletedEntity.deletedBy).toBe('deleter-id')
    })

    it('should accept custom version', () => {
      const versionedEntity = new TestEntity('test-id', {}, {}, { version: 5 })
      expect(versionedEntity.version).toBe(5)
    })
  })

  describe('markUpdated', () => {
    it('should update updatedAt timestamp', () => {
      const oldUpdatedAt = entity.updatedAt
      // Wait a tiny bit to ensure different timestamp
      entity.markUpdated('user-id')

      expect(entity.updatedAt.getTime()).toBeGreaterThanOrEqual(oldUpdatedAt.getTime())
    })

    it('should set updatedBy', () => {
      entity.markUpdated('user-id')
      expect(entity.updatedBy).toBe('user-id')
    })

    it('should increment version', () => {
      const oldVersion = entity.version
      entity.markUpdated('user-id')
      expect(entity.version).toBe(oldVersion + 1)
    })
  })

  describe('markCreated', () => {
    it('should set createdBy and updatedBy', () => {
      entity.markCreated('creator-id')
      expect(entity.createdBy).toBe('creator-id')
      expect(entity.updatedBy).toBe('creator-id')
    })

    it('should update timestamps', () => {
      entity.markCreated('creator-id')
      expect(entity.createdAt).toBeInstanceOf(Date)
      expect(entity.updatedAt).toBeInstanceOf(Date)
    })
  })

  describe('softDelete', () => {
    it('should mark entity as deleted', () => {
      entity.softDelete('deleter-id')
      expect(entity.isDeleted).toBe(true)
    })

    it('should set deletedAt timestamp', () => {
      entity.softDelete('deleter-id')
      expect(entity.deletedAt).toBeInstanceOf(Date)
    })

    it('should set deletedBy', () => {
      entity.softDelete('deleter-id')
      expect(entity.deletedBy).toBe('deleter-id')
    })

    it('should increment version', () => {
      const oldVersion = entity.version
      entity.softDelete('deleter-id')
      expect(entity.version).toBe(oldVersion + 1)
    })

    it('should throw error when trying to delete already deleted entity', () => {
      entity.softDelete('deleter-id')
      expect(() => entity.softDelete('another-id')).toThrow('Entity is already deleted')
    })
  })

  describe('restore', () => {
    it('should restore soft-deleted entity', () => {
      entity.softDelete('deleter-id')
      entity.restore()
      expect(entity.isDeleted).toBe(false)
    })

    it('should clear deletedAt and deletedBy', () => {
      entity.softDelete('deleter-id')
      entity.restore()
      expect(entity.deletedAt).toBeNull()
      expect(entity.deletedBy).toBeNull()
    })

    it('should increment version', () => {
      entity.softDelete('deleter-id')
      const deletedVersion = entity.version
      entity.restore()
      expect(entity.version).toBe(deletedVersion + 1)
    })

    it('should throw error when trying to restore non-deleted entity', () => {
      expect(() => entity.restore()).toThrow('Entity is not deleted')
    })
  })

  describe('canModify', () => {
    it('should return true for non-deleted entity', () => {
      expect(entity.canModify('user-id')).toBe(true)
    })

    it('should return false for deleted entity', () => {
      entity.softDelete('deleter-id')
      expect(entity.canModify('user-id')).toBe(false)
    })
  })

  describe('validateVersion', () => {
    it('should return true for matching version', () => {
      expect(entity.validateVersion(0)).toBe(true)
    })

    it('should return false for non-matching version', () => {
      expect(entity.validateVersion(1)).toBe(false)
    })
  })

  describe('toObject', () => {
    it('should return plain object with all properties', () => {
      const obj = entity.toObject()

      expect(obj).toHaveProperty('id', 'test-id')
      expect(obj).toHaveProperty('createdAt')
      expect(obj).toHaveProperty('updatedAt')
      expect(obj).toHaveProperty('createdBy')
      expect(obj).toHaveProperty('updatedBy')
      expect(obj).toHaveProperty('isDeleted')
      expect(obj).toHaveProperty('deletedAt')
      expect(obj).toHaveProperty('deletedBy')
      expect(obj).toHaveProperty('version')
    })
  })
})
