import { describe, it, expect } from 'vitest'
import { Email } from '../value-objects/email.vo'

describe('Email Value Object', () => {
  describe('constructor', () => {
    it('should create a valid email', () => {
      const email = new Email('Test@Example.COM')
      expect(email.value).toBe('test@example.com')
    })

    it('should throw error for email with whitespace', () => {
      // Note: validation happens before trimming, so whitespace emails are invalid
      expect(() => new Email('  test@example.com  ')).toThrow('Invalid email format')
    })

    it('should throw error for invalid email format', () => {
      expect(() => new Email('invalid-email')).toThrow('Invalid email format')
      expect(() => new Email('test@')).toThrow('Invalid email format')
      expect(() => new Email('@example.com')).toThrow('Invalid email format')
      expect(() => new Email('test @example.com')).toThrow('Invalid email format')
    })
  })

  describe('getDomain', () => {
    it('should return the domain part of email', () => {
      const email = new Email('user@example.com')
      expect(email.getDomain()).toBe('example.com')
    })

    it('should return domain with subdomain', () => {
      const email = new Email('user@mail.example.com')
      expect(email.getDomain()).toBe('mail.example.com')
    })
  })

  describe('getLocalPart', () => {
    it('should return the local part of email', () => {
      const email = new Email('user@example.com')
      expect(email.getLocalPart()).toBe('user')
    })
  })

  describe('equals', () => {
    it('should return true for equal emails', () => {
      const email1 = new Email('test@example.com')
      const email2 = new Email('TEST@EXAMPLE.COM')
      expect(email1.equals(email2)).toBe(true)
    })

    it('should return false for different emails', () => {
      const email1 = new Email('test1@example.com')
      const email2 = new Email('test2@example.com')
      expect(email1.equals(email2)).toBe(false)
    })
  })

  describe('toString', () => {
    it('should return the email value', () => {
      const email = new Email('test@example.com')
      expect(email.toString()).toBe('test@example.com')
    })
  })
})
