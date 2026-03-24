/**
 * Application Constants
 * Central configuration for the Hoc Tu Thien platform
 */

// ==================== Charity Account Configuration ====================

/**
 * Charity account number (4-digit account from Thiện Nguyện App)
 * Can be overridden via environment variable
 */
export const CHARITY_ACCOUNT_NO = process.env.CHARITY_ACCOUNT_NO || "0606";

/**
 * Charity account holder name
 */
export const CHARITY_ACCOUNT_NAME = process.env.CHARITY_ACCOUNT_NAME || "MAT TRAN TO QUOC VIET NAM";

/**
 * Charity bank name
 */
export const CHARITY_BANK = "MBBank";

/**
 * BIN code for MBBank (used for VietQR)
 */
export const BANK_BIN_CODE = "970223";

/**
 * Account activation fee in VND
 */
export const ACTIVATION_AMOUNT = 10000;

// ==================== Payment Configuration ====================

/**
 * Payment code prefixes
 */
export const PAYMENT_PREFIXES = {
  ACTIVATION: "HOCTUTHIEN KICHHOAT",
  SESSION: "HOCTUTHIEN HOCPHI",
  DONATION: "HOCTUTHIEN QUYENGOP",
} as const;

/**
 * Payment code expiry in hours
 */
export const ACTIVATION_CODE_EXPIRY_HOURS = 24;
export const SESSION_PAYMENT_EXPIRY_HOURS = 2;

// ==================== VietQR Configuration ====================

/**
 * VietQR image base URL
 */
export const VIET_QR_IMAGE_URL = "https://img.vietqr.io/image";

/**
 * VietQR API base URL
 */
export const VIET_QR_API_URL = "https://api.vietqr.io";

// ==================== Bank Codes ====================

/**
 * Common bank codes for VietQR
 */
export const BANK_CODES = {
  MBBANK: "mbbank",
  VIETCOMBANK: "vietcombank",
  BIDV: "bidv",
  VIETINBANK: "vietinbank",
  TECHCOMBANK: "techcombank",
  AGRIBANK: "agribank",
  VPBANK: "vpbank",
  TPBANK: "tpbank",
  SACOMBANK: "sacombank",
  ACB: "acb",
} as const;

// ==================== Format Helpers ====================

/**
 * Format currency in VND
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount);
}

/**
 * Format date in Vietnamese locale
 */
export function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("vi-VN", {
    dateStyle: "full",
    timeStyle: "short",
  }).format(d);
}

/**
 * Generate activation content for QR code
 */
export function generateActivationContent(activationCode: string): string {
  return `${PAYMENT_PREFIXES.ACTIVATION} ${activationCode}`;
}
