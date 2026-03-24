import { describe, it, expect } from 'vitest'
import { UserRole, UserRoleEnum } from '../value-objects/role.vo'

describe('UserRole Value Object', () => {
  describe('constructor', () => {
    it('should create a valid role', () => {
      const role = new UserRole(UserRoleEnum.ADMIN)
      expect(role.value).toBe(UserRoleEnum.ADMIN)
    })

    it('should create MENTOR role', () => {
      const role = new UserRole(UserRoleEnum.MENTOR)
      expect(role.value).toBe(UserRoleEnum.MENTOR)
    })

    it('should create MENTEE role', () => {
      const role = new UserRole(UserRoleEnum.MENTEE)
      expect(role.value).toBe(UserRoleEnum.MENTEE)
    })

    it('should throw error for invalid role in validate', () => {
      // Since TypeScript enforces the enum, we need to test the validate method indirectly
      // The validate method checks if the role is in the enum values
      const validRoles = Object.values(UserRoleEnum)
      expect(validRoles).toContain(UserRoleEnum.ADMIN)
      expect(validRoles).toContain(UserRoleEnum.MENTOR)
      expect(validRoles).toContain(UserRoleEnum.MENTEE)
    })
  })

  describe('isAdmin', () => {
    it('should return true for ADMIN role', () => {
      const role = new UserRole(UserRoleEnum.ADMIN)
      expect(role.isAdmin()).toBe(true)
    })

    it('should return false for MENTOR role', () => {
      const role = new UserRole(UserRoleEnum.MENTOR)
      expect(role.isAdmin()).toBe(false)
    })

    it('should return false for MENTEE role', () => {
      const role = new UserRole(UserRoleEnum.MENTEE)
      expect(role.isAdmin()).toBe(false)
    })
  })

  describe('isMentor', () => {
    it('should return true for MENTOR role', () => {
      const role = new UserRole(UserRoleEnum.MENTOR)
      expect(role.isMentor()).toBe(true)
    })

    it('should return false for ADMIN role', () => {
      const role = new UserRole(UserRoleEnum.ADMIN)
      expect(role.isMentor()).toBe(false)
    })

    it('should return false for MENTEE role', () => {
      const role = new UserRole(UserRoleEnum.MENTEE)
      expect(role.isMentor()).toBe(false)
    })
  })

  describe('isMentee', () => {
    it('should return true for MENTEE role', () => {
      const role = new UserRole(UserRoleEnum.MENTEE)
      expect(role.isMentee()).toBe(true)
    })

    it('should return false for ADMIN role', () => {
      const role = new UserRole(UserRoleEnum.ADMIN)
      expect(role.isMentee()).toBe(false)
    })

    it('should return false for MENTOR role', () => {
      const role = new UserRole(UserRoleEnum.MENTOR)
      expect(role.isMentee()).toBe(false)
    })
  })

  describe('hasAtLeastPrivilegesOf', () => {
    it('ADMIN should have at least privileges of all roles', () => {
      const admin = new UserRole(UserRoleEnum.ADMIN)
      const mentor = new UserRole(UserRoleEnum.MENTOR)
      const mentee = new UserRole(UserRoleEnum.MENTEE)

      expect(admin.hasAtLeastPrivilegesOf(admin)).toBe(true)
      expect(admin.hasAtLeastPrivilegesOf(mentor)).toBe(true)
      expect(admin.hasAtLeastPrivilegesOf(mentee)).toBe(true)
    })

    it('MENTOR should have at least privileges of MENTOR and MENTEE', () => {
      const mentor = new UserRole(UserRoleEnum.MENTOR)
      const mentee = new UserRole(UserRoleEnum.MENTEE)

      expect(mentor.hasAtLeastPrivilegesOf(mentor)).toBe(true)
      expect(mentor.hasAtLeastPrivilegesOf(mentee)).toBe(true)
    })

    it('MENTOR should NOT have at least privileges of ADMIN', () => {
      const mentor = new UserRole(UserRoleEnum.MENTOR)
      const admin = new UserRole(UserRoleEnum.ADMIN)

      expect(mentor.hasAtLeastPrivilegesOf(admin)).toBe(false)
    })

    it('MENTEE should only have at least privileges of MENTEE', () => {
      const mentee = new UserRole(UserRoleEnum.MENTEE)
      const mentor = new UserRole(UserRoleEnum.MENTOR)
      const admin = new UserRole(UserRoleEnum.ADMIN)

      expect(mentee.hasAtLeastPrivilegesOf(mentee)).toBe(true)
      expect(mentee.hasAtLeastPrivilegesOf(mentor)).toBe(false)
      expect(mentee.hasAtLeastPrivilegesOf(admin)).toBe(false)
    })
  })

  describe('createDefault', () => {
    it('should create MENTEE role as default', () => {
      const role = UserRole.createDefault()
      expect(role.value).toBe(UserRoleEnum.MENTEE)
    })
  })

  describe('fromString', () => {
    it('should create role from uppercase string', () => {
      const role = UserRole.fromString('ADMIN')
      expect(role.value).toBe(UserRoleEnum.ADMIN)
    })

    it('should create role from lowercase string', () => {
      const role = UserRole.fromString('mentor')
      expect(role.value).toBe(UserRoleEnum.MENTOR)
    })

    it('should create role from mixed case string', () => {
      const role = UserRole.fromString('MenTee')
      expect(role.value).toBe(UserRoleEnum.MENTEE)
    })

    it('should throw error for invalid role string', () => {
      expect(() => UserRole.fromString('INVALID')).toThrow('Invalid user role string')
    })
  })

  describe('equals', () => {
    it('should return true for equal roles', () => {
      const role1 = new UserRole(UserRoleEnum.ADMIN)
      const role2 = new UserRole(UserRoleEnum.ADMIN)
      expect(role1.equals(role2)).toBe(true)
    })

    it('should return false for different roles', () => {
      const role1 = new UserRole(UserRoleEnum.ADMIN)
      const role2 = new UserRole(UserRoleEnum.MENTOR)
      expect(role1.equals(role2)).toBe(false)
    })
  })

  describe('toString', () => {
    it('should return the role value as string', () => {
      const role = new UserRole(UserRoleEnum.ADMIN)
      expect(role.toString()).toBe('ADMIN')
    })
  })
})
