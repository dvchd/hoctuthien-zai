/**
 * Payment Code Generator
 * Generates unique payment codes for activation and session payments
 * 
 * IMPORTANT: Only uses uppercase letters (A-Z), no numbers
 * This is to prevent codes from being hidden/obscured by Thiện Nguyện App
 * which may mask numeric sequences in transaction descriptions
 */

/**
 * Characters used in payment codes
 * Only uppercase letters A-Z (no numbers)
 */
const PAYMENT_CODE_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

/**
 * Length of activation code (8 characters)
 */
export const ACTIVATION_CODE_LENGTH = 8;

/**
 * Length of the random suffix in payment codes (6 characters)
 */
const PAYMENT_CODE_SUFFIX_LENGTH = 6;

/**
 * Payment code prefixes
 */
export const PAYMENT_CODE_PREFIXES = {
  ACTIVATION: 'KICHHOAT', // Activation code prefix
  SESSION: 'HOCPHI', // Session payment prefix
  DONATION: 'QUYENGOP', // Donation prefix
} as const;

/**
 * Generate a random string of uppercase letters
 * @param length Length of the string to generate
 * @returns Random uppercase letter string
 */
export function generateRandomLetters(length: number): string {
  let result = '';
  const charsLength = PAYMENT_CODE_CHARS.length;

  // Use crypto for better randomness if available
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    const randomValues = new Uint32Array(length);
    crypto.getRandomValues(randomValues);

    for (let i = 0; i < length; i++) {
      result += PAYMENT_CODE_CHARS[randomValues[i] % charsLength];
    }
  } else {
    // Fallback to Math.random (less secure but works everywhere)
    for (let i = 0; i < length; i++) {
      result += PAYMENT_CODE_CHARS.charAt(
        Math.floor(Math.random() * charsLength)
      );
    }
  }

  return result;
}

/**
 * Generate activation code
 * Creates a 6-character uppercase letter code
 * @returns Activation code (e.g., ABCXYZ)
 * 
 * @example
 * const code = generateActivationCode();
 * // Returns: "ABCXYZ"
 */
export function generateActivationCode(): string {
  return generateRandomLetters(ACTIVATION_CODE_LENGTH);
}

/**
 * Generate payment code with prefix
 * Creates a payment code with a prefix followed by random letters
 * @param prefix Prefix for the payment code (use PAYMENT_CODE_PREFIXES)
 * @returns Payment code (e.g., HOCPHIBCDEFG)
 * 
 * @example
 * const code = generatePaymentCode(PAYMENT_CODE_PREFIXES.SESSION);
 * // Returns: "HOCPHIBCDEFG"
 * 
 * const activationCode = generatePaymentCode(PAYMENT_CODE_PREFIXES.ACTIVATION);
 * // Returns: "KICHHOATBCDEFG"
 */
export function generatePaymentCode(prefix: string): string {
  const suffix = generateRandomLetters(PAYMENT_CODE_SUFFIX_LENGTH);
  return `${prefix}${suffix}`;
}

/**
 * Generate activation payment code
 * Shortcut for generating activation codes
 * @returns Activation payment code (e.g., KICHHOATABCXYZ)
 */
export function generateActivationPaymentCode(): string {
  return generatePaymentCode(PAYMENT_CODE_PREFIXES.ACTIVATION);
}

/**
 * Generate session payment code
 * Shortcut for generating session payment codes
 * @returns Session payment code (e.g., HOCPHIBCDEFG)
 */
export function generateSessionPaymentCode(): string {
  return generatePaymentCode(PAYMENT_CODE_PREFIXES.SESSION);
}

/**
 * Generate donation payment code
 * Shortcut for generating donation codes
 * @returns Donation payment code (e.g., QUYENGOPABCXYZ)
 */
export function generateDonationPaymentCode(): string {
  return generatePaymentCode(PAYMENT_CODE_PREFIXES.DONATION);
}

/**
 * Validate payment code format
 * @param code Code to validate
 * @returns True if the code is valid (uppercase letters only)
 */
export function isValidPaymentCode(code: string): boolean {
  // Code should only contain uppercase letters
  const codeRegex = /^[A-Z]+$/;
  return codeRegex.test(code);
}

/**
 * Extract prefix from payment code
 * @param code Payment code
 * @returns Prefix or null if not recognized
 */
export function extractPaymentCodePrefix(code: string): string | null {
  for (const prefix of Object.values(PAYMENT_CODE_PREFIXES)) {
    if (code.startsWith(prefix)) {
      return prefix;
    }
  }
  return null;
}

/**
 * Determine payment type from code
 * @param code Payment code
 * @returns Payment type or null if not recognized
 */
export function getPaymentTypeFromCode(code: string): 'activation' | 'session' | 'donation' | null {
  if (code.startsWith(PAYMENT_CODE_PREFIXES.ACTIVATION)) {
    return 'activation';
  }
  if (code.startsWith(PAYMENT_CODE_PREFIXES.SESSION)) {
    return 'session';
  }
  if (code.startsWith(PAYMENT_CODE_PREFIXES.DONATION)) {
    return 'donation';
  }
  return null;
}

/**
 * Generate a unique code that includes timestamp info
 * Useful for generating reference codes that can be sorted by time
 * @param prefix Optional prefix for the code
 * @returns Time-sortable code
 */
export function generateTimeBasedCode(prefix?: string): string {
  // Convert current timestamp to base36 (0-9, A-Z)
  // This gives us a short representation that's still sortable
  const timestamp = Date.now();
  const timestampEncoded = timestamp.toString(36).toUpperCase();
  const randomSuffix = generateRandomLetters(4);

  if (prefix) {
    return `${prefix}${timestampEncoded}${randomSuffix}`;
  }

  return `${timestampEncoded}${randomSuffix}`;
}

/**
 * Calculate code expiry time
 * @param hours Hours until expiry (default: 24)
 * @returns Expiry date
 */
export function calculateCodeExpiry(hours: number = 24): Date {
  const expiry = new Date();
  expiry.setHours(expiry.getHours() + hours);
  return expiry;
}

/**
 * Check if a code has expired
 * @param expiryDate Expiry date to check
 * @returns True if expired
 */
export function isCodeExpired(expiryDate: Date | null): boolean {
  if (!expiryDate) return false;
  return new Date() > new Date(expiryDate);
}
