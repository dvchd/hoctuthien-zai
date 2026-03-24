/**
 * Application Utils Export
 */

export {
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
} from './payment-code';
