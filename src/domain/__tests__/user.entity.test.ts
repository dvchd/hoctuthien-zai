import { describe, it, expect, beforeEach } from 'vitest'
import { UserEntity, UserStatus } from '../entities/user.entity'
import { UserRole, UserRoleEnum } from '../value-objects/role.vo'
import { Email } from '../value-objects/email.vo'

describe('UserEntity', () => {
  let user: UserEntity
  const testEmail = new Email('test@example.com')
  const testRole = new UserRole(UserRoleEnum.MENTEE)

  beforeEach(() => {
    user = new UserEntity('user-id', {
      email: testEmail,
      role: testRole,
      status: UserStatus.ACTIVE,
    })
  })

  describe('constructor', () => {
    it('should create user with required properties', () => {
      expect(user.email.value).toBe('test@example.com')
      expect(user.role.value).toBe(UserRoleEnum.MENTEE)
      expect(user.status).toBe(UserStatus.ACTIVE)
    })

    it('should set optional properties to null by default', () => {
      expect(user.googleId).toBeNull()
      expect(user.name).toBeNull()
      expect(user.avatarUrl).toBeNull()
      expect(user.phone).toBeNull()
      expect(user.bio).toBeNull()
      expect(user.expertise).toBeNull()
    })

    it('should set skills to empty array by default', () => {
      expect(user.skills).toEqual([])
    })

    it('should accept all optional properties', () => {
      const fullUser = new UserEntity('user-id', {
        email: new Email('full@example.com'),
        googleId: 'google-123',
        name: 'Full User',
        avatarUrl: 'https://example.com/avatar.jpg',
        phone: '0123456789',
        role: new UserRole(UserRoleEnum.MENTOR),
        status: UserStatus.ACTIVE,
        bio: 'Test bio',
        skills: ['JavaScript', 'TypeScript'],
        expertise: 'Web Development',
      })

      expect(fullUser.googleId).toBe('google-123')
      expect(fullUser.name).toBe('Full User')
      expect(fullUser.avatarUrl).toBe('https://example.com/avatar.jpg')
      expect(fullUser.phone).toBe('0123456789')
      expect(fullUser.bio).toBe('Test bio')
      expect(fullUser.skills).toEqual(['JavaScript', 'TypeScript'])
      expect(fullUser.expertise).toBe('Web Development')
    })
  })

  describe('getters', () => {
    it('should return a copy of skills array', () => {
      const mentorUser = new UserEntity('user-id', {
        email: testEmail,
        role: new UserRole(UserRoleEnum.MENTOR),
        status: UserStatus.ACTIVE,
        skills: ['JavaScript'],
      })

      const skills1 = mentorUser.skills
      const skills2 = mentorUser.skills

      expect(skills1).not.toBe(skills2) // Different references
      expect(skills1).toEqual(skills2) // Same content
    })
  })

  describe('updateProfile', () => {
    it('should update name', () => {
      user.updateProfile({ name: 'New Name' }, 'updater-id')
      expect(user.name).toBe('New Name')
    })

    it('should update bio', () => {
      user.updateProfile({ bio: 'New bio' }, 'updater-id')
      expect(user.bio).toBe('New bio')
    })

    it('should update phone', () => {
      user.updateProfile({ phone: '0987654321' }, 'updater-id')
      expect(user.phone).toBe('0987654321')
    })

    it('should update avatarUrl', () => {
      user.updateProfile({ avatarUrl: 'https://example.com/new-avatar.jpg' }, 'updater-id')
      expect(user.avatarUrl).toBe('https://example.com/new-avatar.jpg')
    })

    it('should throw error for deleted user', () => {
      user.softDelete('deleter-id')
      expect(() => user.updateProfile({ name: 'New Name' }, 'updater-id')).toThrow(
        'Cannot modify deleted user'
      )
    })

    it('should mark entity as updated', () => {
      const oldVersion = user.version
      user.updateProfile({ name: 'New Name' }, 'updater-id')
      expect(user.version).toBe(oldVersion + 1)
      expect(user.updatedBy).toBe('updater-id')
    })
  })

  describe('updateSkills', () => {
    it('should update skills', () => {
      user.updateSkills(['Python', 'Django'], 'updater-id')
      expect(user.skills).toEqual(['Python', 'Django'])
    })

    it('should throw error for deleted user', () => {
      user.softDelete('deleter-id')
      expect(() => user.updateSkills(['Python'], 'updater-id')).toThrow(
        'Cannot modify deleted user'
      )
    })
  })

  describe('setRole', () => {
    it('should change user role', () => {
      user.setRole(new UserRole(UserRoleEnum.MENTOR), 'admin-id')
      expect(user.role.value).toBe(UserRoleEnum.MENTOR)
    })

    it('should throw error for deleted user', () => {
      user.softDelete('deleter-id')
      expect(() => user.setRole(new UserRole(UserRoleEnum.ADMIN), 'admin-id')).toThrow(
        'Cannot modify deleted user'
      )
    })
  })

  describe('activate', () => {
    it('should set status to ACTIVE', () => {
      const inactiveUser = new UserEntity('user-id', {
        email: testEmail,
        role: testRole,
        status: UserStatus.INACTIVE,
      })
      inactiveUser.activate()
      expect(inactiveUser.status).toBe(UserStatus.ACTIVE)
    })

    it('should not change status if already ACTIVE', () => {
      const activeUser = new UserEntity('user-id', {
        email: testEmail,
        role: testRole,
        status: UserStatus.ACTIVE,
      })
      activeUser.activate()
      expect(activeUser.status).toBe(UserStatus.ACTIVE)
    })
  })

  describe('deactivate', () => {
    it('should set status to INACTIVE', () => {
      user.deactivate()
      expect(user.status).toBe(UserStatus.INACTIVE)
    })

    it('should not change status if already INACTIVE', () => {
      const inactiveUser = new UserEntity('user-id', {
        email: testEmail,
        role: testRole,
        status: UserStatus.INACTIVE,
      })
      inactiveUser.deactivate()
      expect(inactiveUser.status).toBe(UserStatus.INACTIVE)
    })
  })

  describe('suspend', () => {
    it('should set status to SUSPENDED', () => {
      user.suspend()
      expect(user.status).toBe(UserStatus.SUSPENDED)
    })
  })

  describe('linkGoogleAccount', () => {
    it('should set googleId', () => {
      user.linkGoogleAccount('new-google-id')
      expect(user.googleId).toBe('new-google-id')
    })

    it('should throw error if google account already linked', () => {
      user.linkGoogleAccount('google-id-1')
      expect(() => user.linkGoogleAccount('google-id-2')).toThrow(
        'Google account already linked'
      )
    })
  })

  describe('isActive', () => {
    it('should return true for ACTIVE status and not deleted', () => {
      expect(user.isActive()).toBe(true)
    })

    it('should return false for INACTIVE status', () => {
      user.deactivate()
      expect(user.isActive()).toBe(false)
    })

    it('should return false for SUSPENDED status', () => {
      user.suspend()
      expect(user.isActive()).toBe(false)
    })

    it('should return false for deleted user', () => {
      user.softDelete('deleter-id')
      expect(user.isActive()).toBe(false)
    })
  })

  describe('canBeMentor', () => {
    it('should return false for MENTEE role', () => {
      expect(user.canBeMentor()).toBe(false)
    })

    it('should return true for MENTOR role if active', () => {
      const mentorUser = new UserEntity('user-id', {
        email: testEmail,
        role: new UserRole(UserRoleEnum.MENTOR),
        status: UserStatus.ACTIVE,
      })
      expect(mentorUser.canBeMentor()).toBe(true)
    })

    it('should return true for ADMIN role if active', () => {
      const adminUser = new UserEntity('user-id', {
        email: testEmail,
        role: new UserRole(UserRoleEnum.ADMIN),
        status: UserStatus.ACTIVE,
      })
      expect(adminUser.canBeMentor()).toBe(true)
    })

    it('should return false for MENTOR role if inactive', () => {
      const mentorUser = new UserEntity('user-id', {
        email: testEmail,
        role: new UserRole(UserRoleEnum.MENTOR),
        status: UserStatus.INACTIVE,
      })
      expect(mentorUser.canBeMentor()).toBe(false)
    })

    it('should return false for deleted mentor', () => {
      const mentorUser = new UserEntity('user-id', {
        email: testEmail,
        role: new UserRole(UserRoleEnum.MENTOR),
        status: UserStatus.ACTIVE,
      })
      mentorUser.softDelete('deleter-id')
      expect(mentorUser.canBeMentor()).toBe(false)
    })
  })

  describe('canBookSessions', () => {
    it('should return true for active user', () => {
      expect(user.canBookSessions()).toBe(true)
    })

    it('should return false for inactive user', () => {
      user.deactivate()
      expect(user.canBookSessions()).toBe(false)
    })

    it('should return false for deleted user', () => {
      user.softDelete('deleter-id')
      expect(user.canBookSessions()).toBe(false)
    })
  })

  describe('createFromGoogle', () => {
    it('should create user from Google OAuth data', () => {
      const googleUser = UserEntity.createFromGoogle(
        'new-user-id',
        'google@example.com',
        'google-id-123',
        'Google User',
        'https://example.com/avatar.jpg'
      )

      expect(googleUser.id).toBe('new-user-id')
      expect(googleUser.email.value).toBe('google@example.com')
      expect(googleUser.googleId).toBe('google-id-123')
      expect(googleUser.name).toBe('Google User')
      expect(googleUser.avatarUrl).toBe('https://example.com/avatar.jpg')
      expect(googleUser.role.value).toBe(UserRoleEnum.MENTEE) // Default role
      expect(googleUser.status).toBe(UserStatus.ACTIVE)
    })

    it('should create user with null optional fields', () => {
      const googleUser = UserEntity.createFromGoogle(
        'new-user-id',
        'google@example.com',
        'google-id-123'
      )

      expect(googleUser.name).toBeNull()
      expect(googleUser.avatarUrl).toBeNull()
    })
  })

  describe('toObject', () => {
    it('should return plain object with all properties', () => {
      const obj = user.toObject()

      expect(obj).toHaveProperty('id', 'user-id')
      expect(obj).toHaveProperty('email', 'test@example.com')
      expect(obj).toHaveProperty('googleId', null)
      expect(obj).toHaveProperty('name', null)
      expect(obj).toHaveProperty('avatarUrl', null)
      expect(obj).toHaveProperty('phone', null)
      expect(obj).toHaveProperty('role', UserRoleEnum.MENTEE)
      expect(obj).toHaveProperty('status', UserStatus.ACTIVE)
      expect(obj).toHaveProperty('bio', null)
      expect(obj).toHaveProperty('skills', null) // Empty array becomes null
      expect(obj).toHaveProperty('expertise', null)
    })

    it('should serialize skills as JSON string', () => {
      const mentorUser = new UserEntity('user-id', {
        email: testEmail,
        role: new UserRole(UserRoleEnum.MENTOR),
        status: UserStatus.ACTIVE,
        skills: ['JavaScript', 'TypeScript'],
      })

      const obj = mentorUser.toObject()
      expect(obj.skills).toBe('["JavaScript","TypeScript"]')
    })

    it('should include audit, soft delete and version info', () => {
      const obj = user.toObject()

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
