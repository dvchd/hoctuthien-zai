/**
 * Charity and Payment DTOs
 * Data Transfer Objects for charity transactions and payment verification
 */

// ==================== Thiện Nguyện Transaction DTOs ====================

/**
 * Transaction from Thiện Nguyện App API
 */
export interface IThienNguyenTransactionDto {
  id: string;
  refId: string; // FTxxxxx - Mã tham chiếu giao dịch
  amount: number;
  narrative: string; // Nội dung chuyển khoản
  senderName: string;
  transactionTime: string; // ISO datetime string
  accountNo: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Query parameters for fetching transactions
 */
export interface ITransactionQueryDto {
  accountNo: string;
  fromDate?: Date;
  toDate?: Date;
  keyword?: string;
  pageNumber?: number;
  pageSize?: number;
}

/**
 * Transaction list response
 */
export interface ITransactionListResponseDto {
  success: boolean;
  transactions: IThienNguyenTransactionDto[];
  total: number;
  page: number;
  pageSize: number;
  error?: string;
}

// ==================== Payment Verification DTOs ====================

/**
 * Request to verify a payment
 */
export interface IVerifyPaymentDto {
  userId: string;
  paymentCode: string;
  amount?: number; // Optional: for amount-based verification
  sessionId?: string; // Optional: for session payment verification
}

/**
 * Payment verification result
 */
export interface IPaymentVerificationResult {
  success: boolean;
  verified: boolean;
  transaction?: IThienNguyenTransactionDto;
  paymentType?: 'activation' | 'session' | 'donation';
  error?: string;
  message?: string;
}

// ==================== Activation DTOs ====================

/**
 * Request to create an activation payment request
 */
export interface IRequestActivationDto {
  userId: string;
}

/**
 * Activation request response
 */
export interface IActivationRequestResult {
  success: boolean;
  activated?: boolean; // True if already activated
  activationCode?: string;
  paymentCode?: string;
  qrCodeUrl?: string;
  deepLink?: string;
  amount?: number;
  accountNo?: string;
  accountName?: string;
  expiresAt?: Date;
  error?: string;
}

/**
 * Activation verification request
 */
export interface IVerifyActivationDto {
  userId: string;
  paymentCode?: string; // Optional - if not provided, use user's activation code
}

/**
 * Activation verification result
 */
export interface IActivationVerificationResult {
  success: boolean;
  activated: boolean;
  user?: {
    id: string;
    email: string;
    name: string | null;
    status: string;
    isActivated: boolean;
    activatedAt: Date | null;
  };
  transaction?: IThienNguyenTransactionDto;
  error?: string;
  message?: string;
}

// ==================== Session Payment DTOs ====================

/**
 * Request to create a session payment request
 */
export interface IRequestSessionPaymentDto {
  sessionId: string;
  userId: string; // Mentee ID
}

/**
 * Session payment request result
 */
export interface ISessionPaymentRequestResult {
  success: boolean;
  sessionId?: string;
  paymentCode?: string;
  qrCodeUrl?: string;
  deepLink?: string;
  amount?: number;
  accountNo?: string;
  accountName?: string;
  expiresAt?: Date;
  error?: string;
}

/**
 * Session payment verification request
 */
export interface IVerifySessionPaymentDto {
  sessionId: string;
  paymentCode?: string; // Optional - if not provided, use session's payment code
}

/**
 * Session payment verification result
 */
export interface ISessionPaymentVerificationResult {
  success: boolean;
  verified: boolean;
  session?: {
    id: string;
    title: string;
    status: string;
    isPaid: boolean;
    paidAt: Date | null;
    amount: number;
  };
  transaction?: IThienNguyenTransactionDto;
  error?: string;
  message?: string;
}

// ==================== QR Code DTOs ====================

/**
 * QR Code generation options
 */
export interface IQrCodeOptionsDto {
  accountNo: string;
  accountName: string;
  amount: number;
  content: string;
  bankCode?: string;
}

/**
 * QR Code generation result
 */
export interface IQrCodeResultDto {
  qrOnly: string; // QR code image URL
  compact: string; // Compact QR code image URL
  print: string; // Print-ready QR code image URL
  deepLink?: string; // Banking app deep link
}

// ==================== Payment Transaction DTOs ====================

/**
 * Payment transaction data for database
 */
export interface IPaymentTransactionDto {
  id?: string;
  userId: string;
  sessionId?: string;
  type: 'ACTIVATION' | 'SESSION_PAYMENT' | 'DONATION';
  amount: number;
  currency?: string;
  paymentCode?: string;
  charityAccountNo?: string;
  externalTransactionId?: string;
  externalRefId?: string;
  transactionTime?: Date;
  senderName?: string;
  narrative?: string;
  status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED';
  verifiedAt?: Date;
  verifiedBy?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Payment transaction response
 */
export interface IPaymentTransactionResponseDto {
  success: boolean;
  transaction?: IPaymentTransactionDto;
  error?: string;
}

/**
 * List of payment transactions
 */
export interface IPaymentTransactionListDto {
  success: boolean;
  transactions: IPaymentTransactionDto[];
  total: number;
  page: number;
  pageSize: number;
  error?: string;
}

// ==================== Charity Account DTOs ====================

/**
 * Charity account info
 */
export interface ICharityAccountDto {
  accountNo: string;
  accountName: string;
  bankName?: string;
  bankCode?: string;
}

/**
 * Mentor's charity account info
 */
export interface IMentorCharityAccountDto {
  mentorId: string;
  mentorName: string;
  accountNo: string;
  accountName: string;
}

// ==================== Payment Statistics DTOs ====================

/**
 * Payment statistics for a user
 */
export interface IPaymentStatsDto {
  totalTransactions: number;
  totalAmount: number;
  completedTransactions: number;
  pendingTransactions: number;
  failedTransactions: number;
  byType: {
    activation: number;
    sessionPayment: number;
    donation: number;
  };
}

/**
 * Payment summary for dashboard
 */
export interface IPaymentSummaryDto {
  todayTotal: number;
  weekTotal: number;
  monthTotal: number;
  pendingActivations: number;
  pendingSessionPayments: number;
}
