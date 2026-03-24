import { describe, it, expect } from 'vitest'
import {
  VietQRService,
  createActivationQROptions,
  createSessionPaymentQROptions,
} from '../external/viet-qr'

describe('VietQRService', () => {
  describe('getBankCode', () => {
    it('should return correct bank code for MBBANK', () => {
      expect(VietQRService.getBankCode('MBBANK')).toBe('mbbank')
    })

    it('should return correct bank code for MB', () => {
      expect(VietQRService.getBankCode('MB')).toBe('mbbank')
    })

    it('should return correct bank code for VIETCOMBANK', () => {
      expect(VietQRService.getBankCode('VIETCOMBANK')).toBe('vietcombank')
    })

    it('should return correct bank code for VCB', () => {
      expect(VietQRService.getBankCode('VCB')).toBe('vietcombank')
    })

    it('should be case insensitive', () => {
      expect(VietQRService.getBankCode('mbbank')).toBe('mbbank')
      expect(VietQRService.getBankCode('MbBank')).toBe('mbbank')
    })

    it('should handle spaces', () => {
      expect(VietQRService.getBankCode('MB BANK')).toBe('mbbank')
    })

    it('should return lowercase for unknown banks', () => {
      expect(VietQRService.getBankCode('UNKNOWN')).toBe('unknown')
    })
  })

  describe('generateQRCodeUrl', () => {
    it('should generate valid QR code URL', () => {
      const options = {
        accountNo: '123456789',
        accountName: 'Test Account',
        amount: 10000,
        content: 'Test Content',
      }

      const url = VietQRService.generateQRCodeUrl(options)

      expect(url).toContain('https://img.vietqr.io/image')
      expect(url).toContain('mbbank')
      expect(url).toContain('123456789')
      expect(url).toContain('amount=10000')
      expect(url).toContain('Test%20Account')
      expect(url).toContain('Test%20Content')
    })

    it('should use custom bank code', () => {
      const options = {
        accountNo: '123456789',
        accountName: 'Test Account',
        amount: 10000,
        content: 'Test Content',
        bankCode: 'vietcombank',
      }

      const url = VietQRService.generateQRCodeUrl(options)
      expect(url).toContain('vietcombank')
    })

    it('should encode special characters in content', () => {
      const options = {
        accountNo: '123456789',
        accountName: 'Nguyễn Văn A',
        amount: 10000,
        content: 'KICHHOAT ABCXYZ',
      }

      const url = VietQRService.generateQRCodeUrl(options)
      expect(url).toContain('Nguy%E1%BB%85n')
    })
  })

  describe('generateQRCodeWithTemplate', () => {
    it('should generate qr_only template by default', () => {
      const options = {
        accountNo: '123456789',
        accountName: 'Test Account',
        amount: 10000,
        content: 'Test Content',
      }

      const url = VietQRService.generateQRCodeWithTemplate(options)
      expect(url).toContain('-qr_only.png')
    })

    it('should generate compact template', () => {
      const options = {
        accountNo: '123456789',
        accountName: 'Test Account',
        amount: 10000,
        content: 'Test Content',
      }

      const url = VietQRService.generateQRCodeWithTemplate(options, 'compact')
      expect(url).toContain('-compact.png')
    })

    it('should generate print template', () => {
      const options = {
        accountNo: '123456789',
        accountName: 'Test Account',
        amount: 10000,
        content: 'Test Content',
      }

      const url = VietQRService.generateQRCodeWithTemplate(options, 'print')
      expect(url).toContain('-print.png')
    })
  })

  describe('generateDeepLink', () => {
    it('should generate valid deep link', () => {
      const options = {
        accountNo: '123456789',
        accountName: 'Test Account',
        amount: 10000,
        content: 'Test Content',
      }

      const url = VietQRService.generateDeepLink(options)

      expect(url).toContain('https://api.vietqr.io')
      expect(url).toContain('mbbank')
      expect(url).toContain('123456789')
      expect(url).toContain('amount=10000')
    })
  })

  describe('generateMBBankDeepLink', () => {
    it('should generate MB Bank specific deep link', () => {
      const options = {
        accountNo: '123456789',
        accountName: 'Test Account',
        amount: 10000,
        content: 'Test Content',
      }

      const url = VietQRService.generateMBBankDeepLink(options)

      expect(url).toContain('mbbank://app/payment')
      expect(url).toContain('accountNo=123456789')
      expect(url).toContain('amount=10000')
    })
  })

  describe('generateAllQRCodes', () => {
    it('should generate all QR code URLs', () => {
      const options = {
        accountNo: '123456789',
        accountName: 'Test Account',
        amount: 10000,
        content: 'Test Content',
      }

      const urls = VietQRService.generateAllQRCodes(options)

      expect(urls.qrOnly).toContain('-qr_only.png')
      expect(urls.compact).toContain('-compact.png')
      expect(urls.print).toContain('-print.png')
    })
  })

  describe('generateVietQRString', () => {
    it('should generate valid JSON string', () => {
      const options = {
        accountNo: '123456789',
        accountName: 'Test Account',
        amount: 10000,
        content: 'Test Content',
      }

      const qrString = VietQRService.generateVietQRString(options)
      const parsed = JSON.parse(qrString)

      expect(parsed.bin).toBe('mbbank')
      expect(parsed.accountNo).toBe('123456789')
      expect(parsed.accountName).toBe('Test Account')
      expect(parsed.amount).toBe('10000')
      expect(parsed.addInfo).toBe('Test Content')
    })
  })

  describe('validateAccountNo', () => {
    it('should return true for valid account number', () => {
      expect(VietQRService.validateAccountNo('123456')).toBe(true)
      expect(VietQRService.validateAccountNo('1234567890123456789')).toBe(true)
    })

    it('should return false for too short account number', () => {
      expect(VietQRService.validateAccountNo('12345')).toBe(false)
    })

    it('should return false for too long account number', () => {
      expect(VietQRService.validateAccountNo('12345678901234567890')).toBe(false)
    })

    it('should return false for non-numeric characters', () => {
      expect(VietQRService.validateAccountNo('12345ABC')).toBe(false)
    })

    it('should return false for empty string', () => {
      expect(VietQRService.validateAccountNo('')).toBe(false)
    })
  })

  describe('validateAmount', () => {
    it('should return true for valid amount', () => {
      expect(VietQRService.validateAmount(10000)).toBe(true)
      expect(VietQRService.validateAmount(1000000)).toBe(true)
      expect(VietQRService.validateAmount(1000000000)).toBe(true)
    })

    it('should return false for zero amount', () => {
      expect(VietQRService.validateAmount(0)).toBe(false)
    })

    it('should return false for negative amount', () => {
      expect(VietQRService.validateAmount(-10000)).toBe(false)
    })

    it('should return false for amount exceeding limit', () => {
      expect(VietQRService.validateAmount(1000000001)).toBe(false)
    })
  })
})

describe('QR Options Helpers', () => {
  describe('createActivationQROptions', () => {
    it('should create correct QR options for activation', () => {
      const options = createActivationQROptions(
        '123456789',
        'Test Account',
        'KICHHOATABCXYZ',
        10000
      )

      expect(options.accountNo).toBe('123456789')
      expect(options.accountName).toBe('Test Account')
      expect(options.amount).toBe(10000)
      expect(options.content).toBe('KICH HOAT KICHHOATABCXYZ')
      expect(options.bankCode).toBe('mbbank')
    })

    it('should use default amount', () => {
      const options = createActivationQROptions(
        '123456789',
        'Test Account',
        'KICHHOATABCXYZ'
      )

      expect(options.amount).toBe(10000)
    })
  })

  describe('createSessionPaymentQROptions', () => {
    it('should create correct QR options for session payment', () => {
      const options = createSessionPaymentQROptions(
        '123456789',
        'Test Account',
        'HOCPHIABCXYZ',
        50000
      )

      expect(options.accountNo).toBe('123456789')
      expect(options.accountName).toBe('Test Account')
      expect(options.amount).toBe(50000)
      expect(options.content).toBe('HOC PHI HOCPHIABCXYZ')
      expect(options.bankCode).toBe('mbbank')
    })
  })
})
