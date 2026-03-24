import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
  generateRandomLetters,
  generateActivationCode,
  generatePaymentCode,
  generateActivationPaymentCode,
  generateSessionPaymentCode,
  generateDonationPaymentCode,
  isValidPaymentCode,
  extractPaymentCodePrefix,
  getPaymentTypeFromCode,
  generateTimeBasedCode,
  calculateCodeExpiry,
  isCodeExpired,
  PAYMENT_CODE_PREFIXES,
} from '../utils/payment-code'

describe('Payment Code Utilities', () => {
  describe('generateRandomLetters', () => {
    it('should generate string of specified length', () => {
      const result = generateRandomLetters(10)
      expect(result.length).toBe(10)
    })

    it('should only contain uppercase letters', () => {
      const result = generateRandomLetters(100)
      expect(result).toMatch(/^[A-Z]+$/)
    })

    it('should generate different strings', () => {
      const results = new Set()
      for (let i = 0; i < 100; i++) {
        results.add(generateRandomLetters(6))
      }
      // With 100 random 6-char strings, we should have a lot of unique ones
      expect(results.size).toBeGreaterThan(90)
    })

    it('should handle length of 0', () => {
      const result = generateRandomLetters(0)
      expect(result).toBe('')
    })
  })

  describe('generateActivationCode', () => {
    it('should generate 8 character code', () => {
      const code = generateActivationCode()
      expect(code.length).toBe(8)
    })

    it('should only contain uppercase letters', () => {
      const code = generateActivationCode()
      expect(code).toMatch(/^[A-Z]{8}$/)
    })
  })

  describe('generatePaymentCode', () => {
    it('should generate code with prefix', () => {
      const code = generatePaymentCode('TEST')
      expect(code.startsWith('TEST')).toBe(true)
    })

    it('should have prefix followed by 6 random letters', () => {
      const code = generatePaymentCode('TEST')
      expect(code).toMatch(/^TEST[A-Z]{6}$/)
    })

    it('should generate different codes each time', () => {
      const codes = new Set()
      for (let i = 0; i < 100; i++) {
        codes.add(generatePaymentCode('TEST'))
      }
      expect(codes.size).toBeGreaterThan(90)
    })
  })

  describe('generateActivationPaymentCode', () => {
    it('should start with KICHHOAT prefix', () => {
      const code = generateActivationPaymentCode()
      expect(code.startsWith(PAYMENT_CODE_PREFIXES.ACTIVATION)).toBe(true)
    })

    it('should have correct format', () => {
      const code = generateActivationPaymentCode()
      expect(code).toMatch(/^KICHHOAT[A-Z]{6}$/)
    })
  })

  describe('generateSessionPaymentCode', () => {
    it('should start with HOCPHI prefix', () => {
      const code = generateSessionPaymentCode()
      expect(code.startsWith(PAYMENT_CODE_PREFIXES.SESSION)).toBe(true)
    })

    it('should have correct format', () => {
      const code = generateSessionPaymentCode()
      expect(code).toMatch(/^HOCPHI[A-Z]{6}$/)
    })
  })

  describe('generateDonationPaymentCode', () => {
    it('should start with QUYENGOP prefix', () => {
      const code = generateDonationPaymentCode()
      expect(code.startsWith(PAYMENT_CODE_PREFIXES.DONATION)).toBe(true)
    })

    it('should have correct format', () => {
      const code = generateDonationPaymentCode()
      expect(code).toMatch(/^QUYENGOP[A-Z]{6}$/)
    })
  })

  describe('isValidPaymentCode', () => {
    it('should return true for valid uppercase code', () => {
      expect(isValidPaymentCode('KICHHOATABCXYZ')).toBe(true)
      expect(isValidPaymentCode('HOCPHIBCDEFG')).toBe(true)
    })

    it('should return false for code with lowercase letters', () => {
      expect(isValidPaymentCode('KICHHOATabc')).toBe(false)
    })

    it('should return false for code with numbers', () => {
      expect(isValidPaymentCode('KICHHOAT123')).toBe(false)
    })

    it('should return false for code with special characters', () => {
      expect(isValidPaymentCode('KICHHOAT-ABC')).toBe(false)
      expect(isValidPaymentCode('KICHHOAT ABC')).toBe(false)
    })

    it('should return false for empty string', () => {
      expect(isValidPaymentCode('')).toBe(false)
    })
  })

  describe('extractPaymentCodePrefix', () => {
    it('should extract KICHHOAT prefix', () => {
      expect(extractPaymentCodePrefix('KICHHOATABCXYZ')).toBe(PAYMENT_CODE_PREFIXES.ACTIVATION)
    })

    it('should extract HOCPHI prefix', () => {
      expect(extractPaymentCodePrefix('HOCPHIBCDEFG')).toBe(PAYMENT_CODE_PREFIXES.SESSION)
    })

    it('should extract QUYENGOP prefix', () => {
      expect(extractPaymentCodePrefix('QUYENGOPABCXYZ')).toBe(PAYMENT_CODE_PREFIXES.DONATION)
    })

    it('should return null for unknown prefix', () => {
      expect(extractPaymentCodePrefix('UNKNOWNABCXYZ')).toBe(null)
    })

    it('should return null for empty string', () => {
      expect(extractPaymentCodePrefix('')).toBe(null)
    })
  })

  describe('getPaymentTypeFromCode', () => {
    it('should return "activation" for KICHHOAT prefix', () => {
      expect(getPaymentTypeFromCode('KICHHOATABCXYZ')).toBe('activation')
    })

    it('should return "session" for HOCPHI prefix', () => {
      expect(getPaymentTypeFromCode('HOCPHIBCDEFG')).toBe('session')
    })

    it('should return "donation" for QUYENGOP prefix', () => {
      expect(getPaymentTypeFromCode('QUYENGOPABCXYZ')).toBe('donation')
    })

    it('should return null for unknown prefix', () => {
      expect(getPaymentTypeFromCode('UNKNOWNABCXYZ')).toBe(null)
    })
  })

  describe('generateTimeBasedCode', () => {
    it('should generate code without prefix', () => {
      const code = generateTimeBasedCode()
      // Should be timestamp (base36) + 4 random letters
      expect(code.length).toBeGreaterThan(4)
      expect(code).toMatch(/^[A-Z0-9]+[A-Z]{4}$/)
    })

    it('should generate code with prefix', () => {
      const code = generateTimeBasedCode('TEST')
      expect(code.startsWith('TEST')).toBe(true)
    })

    it('should generate sortable codes', () => {
      const code1 = generateTimeBasedCode()
      // Wait a tiny bit
      const start = Date.now()
      while (Date.now() === start) {
        // Wait for next millisecond
      }
      const code2 = generateTimeBasedCode()

      // Codes should be sortable (earlier timestamp = smaller base36 value)
      const ts1 = code1.slice(0, -4)
      const ts2 = code2.slice(0, -4)
      expect(parseInt(ts1, 36)).toBeLessThanOrEqual(parseInt(ts2, 36))
    })
  })

  describe('calculateCodeExpiry', () => {
    it('should return date in the future', () => {
      const expiry = calculateCodeExpiry(24)
      expect(expiry.getTime()).toBeGreaterThan(Date.now())
    })

    it('should calculate correct expiry for 24 hours', () => {
      const now = new Date()
      const expiry = calculateCodeExpiry(24)
      const diffHours = (expiry.getTime() - now.getTime()) / (1000 * 60 * 60)
      expect(diffHours).toBeCloseTo(24, 1)
    })

    it('should calculate correct expiry for 2 hours', () => {
      const now = new Date()
      const expiry = calculateCodeExpiry(2)
      const diffHours = (expiry.getTime() - now.getTime()) / (1000 * 60 * 60)
      expect(diffHours).toBeCloseTo(2, 1)
    })

    it('should default to 24 hours', () => {
      const now = new Date()
      const expiry = calculateCodeExpiry()
      const diffHours = (expiry.getTime() - now.getTime()) / (1000 * 60 * 60)
      expect(diffHours).toBeCloseTo(24, 1)
    })
  })

  describe('isCodeExpired', () => {
    it('should return true for past date', () => {
      const pastDate = new Date(Date.now() - 1000 * 60 * 60) // 1 hour ago
      expect(isCodeExpired(pastDate)).toBe(true)
    })

    it('should return false for future date', () => {
      const futureDate = new Date(Date.now() + 1000 * 60 * 60) // 1 hour from now
      expect(isCodeExpired(futureDate)).toBe(false)
    })

    it('should return false for null', () => {
      expect(isCodeExpired(null)).toBe(false)
    })
  })

  describe('PAYMENT_CODE_PREFIXES', () => {
    it('should have correct activation prefix', () => {
      expect(PAYMENT_CODE_PREFIXES.ACTIVATION).toBe('KICHHOAT')
    })

    it('should have correct session prefix', () => {
      expect(PAYMENT_CODE_PREFIXES.SESSION).toBe('HOCPHI')
    })

    it('should have correct donation prefix', () => {
      expect(PAYMENT_CODE_PREFIXES.DONATION).toBe('QUYENGOP')
    })
  })
})
