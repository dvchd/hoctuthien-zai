/**
 * Payment Use Cases
 * Handles payment requests and verification for activations and sessions
 */

import { db } from '@/lib/db';
import { ThienNguyenAPI, getThienNguyenAPI } from '../../infrastructure/external/thien-nguyen-api';
import {
  VietQRService,
  createActivationQROptions,
  createSessionPaymentQROptions,
} from '../../infrastructure/external/viet-qr';
import {
  generateActivationCode,
  generatePaymentCode,
  generateActivationPaymentCode,
  generateSessionPaymentCode,
  calculateCodeExpiry,
  isCodeExpired,
  PAYMENT_CODE_PREFIXES,
} from '../utils/payment-code';
import {
  IRequestActivationDto,
  IActivationRequestResult,
  IVerifyActivationDto,
  IActivationVerificationResult,
  IRequestSessionPaymentDto,
  ISessionPaymentRequestResult,
  IVerifySessionPaymentDto,
  ISessionPaymentVerificationResult,
  IPaymentVerificationResult,
  IThienNguyenTransactionDto,
} from '../dto/charity.dto';
import { TransactionType, TransactionStatus, SessionStatus, UserStatus } from '@prisma/client';

/**
 * Configuration for payment
 */
const PAYMENT_CONFIG = {
  activationAmount: 10000, // 10,000 VND for account activation
  activationCodeExpiryHours: 24, // 24 hours to complete activation
  sessionPaymentExpiryHours: 2, // 2 hours to complete session payment
  defaultBankCode: 'mbbank',
};

/**
 * Payment Use Case
 * Handles all payment-related operations
 */
export class PaymentUseCase {
  private thienNguyenAPI: ThienNguyenAPI;

  constructor() {
    this.thienNguyenAPI = getThienNguyenAPI();
  }

  // ==================== Activation Payment ====================

  /**
   * Get or create activation request
   * Reuses existing activation code if valid, creates new one if expired or not exists
   * @param data Request data with userId
   * @returns Activation request result with QR code
   */
  async getOrCreateActivation(data: IRequestActivationDto): Promise<IActivationRequestResult> {
    const { userId } = data;

    try {
      console.log(`[PaymentUseCase] Getting activation for user: ${userId}`);

      // Get user
      const user = await db.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        return {
          success: false,
          error: 'User not found',
        };
      }

      // Check if already activated
      if (user.isActivated) {
        return {
          success: false,
          error: 'Account is already activated',
          activated: true,
        };
      }

      // Check for existing pending activation transaction
      const pendingTransaction = await db.paymentTransaction.findFirst({
        where: {
          userId,
          type: TransactionType.ACTIVATION,
          status: TransactionStatus.PENDING,
        },
        orderBy: { createdAt: 'desc' },
      });

      // Check if user has valid activation code (not expired)
      const hasValidCode = user.activationCode && 
        user.activationCodeExpiry && 
        !isCodeExpired(user.activationCodeExpiry);

      // If has valid code and pending transaction, reuse them
      if (hasValidCode && pendingTransaction?.paymentCode) {
        console.log(`[PaymentUseCase] Reusing existing activation code: ${user.activationCode}`);

        const accountNo = process.env.CHARITY_ACCOUNT_NO || '2022';
        const accountName = process.env.CHARITY_ACCOUNT_NAME || 'HOI CHU THAP DO VIET NAM';

        // Generate QR with existing code
        const qrContent = `HOCTUTHIEN KICHHOAT ${user.activationCode}`;
        const qrCodeUrl = VietQRService.generateQRCodeUrl({
          accountNo,
          accountName,
          amount: PAYMENT_CONFIG.activationAmount,
          content: qrContent,
          bankCode: PAYMENT_CONFIG.defaultBankCode,
        });

        const deepLink = VietQRService.generateDeepLink({
          accountNo,
          accountName,
          amount: PAYMENT_CONFIG.activationAmount,
          content: qrContent,
          bankCode: PAYMENT_CONFIG.defaultBankCode,
        });

        return {
          success: true,
          activationCode: user.activationCode,
          paymentCode: pendingTransaction.paymentCode,
          qrCodeUrl,
          deepLink,
          amount: PAYMENT_CONFIG.activationAmount,
          accountNo,
          accountName,
          expiresAt: user.activationCodeExpiry,
        };
      }

      // Need to create new activation code
      console.log(`[PaymentUseCase] Creating new activation code for user: ${userId}`);

      // Generate new activation code
      const activationCode = generateActivationCode();
      const paymentCode = generateActivationPaymentCode();
      const expiresAt = calculateCodeExpiry(PAYMENT_CONFIG.activationCodeExpiryHours);

      // Update user with new activation code
      await db.user.update({
        where: { id: userId },
        data: {
          activationCode,
          activationCodeExpiry: expiresAt,
        },
      });

      // Mark old pending transactions as failed (if any)
      if (pendingTransaction) {
        await db.paymentTransaction.update({
          where: { id: pendingTransaction.id },
          data: {
            status: TransactionStatus.FAILED,
            updatedBy: 'system',
          },
        });
      }

      // Create new pending transaction
      await db.paymentTransaction.create({
        data: {
          userId,
          type: TransactionType.ACTIVATION,
          amount: PAYMENT_CONFIG.activationAmount,
          paymentCode,
          status: TransactionStatus.PENDING,
          createdBy: userId,
        },
      });

      // Generate QR code
      const accountNo = process.env.CHARITY_ACCOUNT_NO || '2022';
      const accountName = process.env.CHARITY_ACCOUNT_NAME || 'HOI CHU THAP DO VIET NAM';

      const qrContent = `HOCTUTHIEN KICHHOAT ${activationCode}`;
      const qrCodeUrl = VietQRService.generateQRCodeUrl({
        accountNo,
        accountName,
        amount: PAYMENT_CONFIG.activationAmount,
        content: qrContent,
        bankCode: PAYMENT_CONFIG.defaultBankCode,
      });

      const deepLink = VietQRService.generateDeepLink({
        accountNo,
        accountName,
        amount: PAYMENT_CONFIG.activationAmount,
        content: qrContent,
        bankCode: PAYMENT_CONFIG.defaultBankCode,
      });

      console.log(`[PaymentUseCase] New activation code created: ${activationCode}`);

      return {
        success: true,
        activationCode,
        paymentCode,
        qrCodeUrl,
        deepLink,
        amount: PAYMENT_CONFIG.activationAmount,
        accountNo,
        accountName,
        expiresAt,
      };
    } catch (error) {
      console.error('[PaymentUseCase] Error getting activation:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get activation request',
      };
    }
  }

  /**
   * Request account activation (legacy - creates new code every time)
   * @deprecated Use getOrCreateActivation instead
   * @param data Request data with userId
   * @returns Activation request result with QR code
   */
  async requestActivation(data: IRequestActivationDto): Promise<IActivationRequestResult> {
    const { userId } = data;

    try {
      console.log(`[PaymentUseCase] Requesting activation for user: ${userId}`);

      // Get user
      const user = await db.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        return {
          success: false,
          error: 'User not found',
        };
      }

      // Check if already activated
      if (user.isActivated) {
        return {
          success: false,
          error: 'Account is already activated',
        };
      }

      // Generate activation code
      const activationCode = generateActivationCode();
      const paymentCode = generateActivationPaymentCode();
      const expiresAt = calculateCodeExpiry(PAYMENT_CONFIG.activationCodeExpiryHours);

      // Update user with activation code
      await db.user.update({
        where: { id: userId },
        data: {
          activationCode,
          activationCodeExpiry: expiresAt,
        },
      });

      // Create pending transaction
      await db.paymentTransaction.create({
        data: {
          userId,
          type: TransactionType.ACTIVATION,
          amount: PAYMENT_CONFIG.activationAmount,
          paymentCode,
          status: TransactionStatus.PENDING,
          createdBy: userId,
        },
      });

      // Generate QR code
      // Note: In production, these would come from system config or mentor's charity account
      const accountNo = process.env.CHARITY_ACCOUNT_NO || '2000';
      const accountName = process.env.CHARITY_ACCOUNT_NAME || 'HOC TU THIEN';

      const qrOptions = createActivationQROptions(
        accountNo,
        accountName,
        paymentCode,
        PAYMENT_CONFIG.activationAmount
      );

      const qrCodeUrl = VietQRService.generateQRCodeUrl(qrOptions);
      const deepLink = VietQRService.generateDeepLink(qrOptions);

      console.log(`[PaymentUseCase] Activation request created: ${activationCode}`);

      return {
        success: true,
        activationCode,
        paymentCode,
        qrCodeUrl,
        deepLink,
        amount: PAYMENT_CONFIG.activationAmount,
        accountNo,
        accountName,
        expiresAt,
      };
    } catch (error) {
      console.error('[PaymentUseCase] Error requesting activation:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create activation request',
      };
    }
  }

  /**
   * Verify activation payment
   * Checks if user has paid the activation fee
   * @param data Verification data
   * @returns Verification result
   */
  async verifyActivation(data: IVerifyActivationDto): Promise<IActivationVerificationResult> {
    const { userId, paymentCode } = data;

    try {
      console.log(`[PaymentUseCase] Verifying activation for user: ${userId}`);

      // Get user
      const user = await db.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        return {
          success: false,
          activated: false,
          error: 'User not found',
        };
      }

      // Check if already activated
      if (user.isActivated) {
        return {
          success: true,
          activated: true,
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
            status: user.status,
            isActivated: user.isActivated,
            activatedAt: user.activatedAt,
          },
          message: 'Account is already activated',
        };
      }

      // Check if activation code expired
      if (user.activationCodeExpiry && isCodeExpired(user.activationCodeExpiry)) {
        return {
          success: false,
          activated: false,
          error: 'Activation code has expired. Please request a new activation.',
        };
      }

      // Get pending activation transaction
      const pendingTransaction = await db.paymentTransaction.findFirst({
        where: {
          userId,
          type: TransactionType.ACTIVATION,
          status: TransactionStatus.PENDING,
        },
        orderBy: { createdAt: 'desc' },
      });

      if (!pendingTransaction) {
        return {
          success: false,
          activated: false,
          error: 'No pending activation found. Please request activation first.',
        };
      }

      // Search for transaction in Thiện Nguyện App
      const accountNo = process.env.CHARITY_ACCOUNT_NO || '2000';
      const searchPaymentCode = paymentCode || pendingTransaction.paymentCode;

      if (!searchPaymentCode) {
        return {
          success: false,
          activated: false,
          error: 'No payment code found for verification',
        };
      }

      // Look for transaction in charity account
      const charityTransaction = await this.thienNguyenAPI.findTransactionByPaymentCode(
        accountNo,
        searchPaymentCode
      );

      if (!charityTransaction) {
        return {
          success: false,
          activated: false,
          message: 'Thanh toán chưa được ghi nhận. Vui lòng kiểm tra lại:\n• Đã chuyển khoản đúng số tiền và nội dung?\n• Đợi 1-2 phút để hệ thống ghi nhận giao dịch?',
        };
      }

      // Verify amount matches
      if (charityTransaction.amount !== PAYMENT_CONFIG.activationAmount) {
        console.warn(
          `[PaymentUseCase] Amount mismatch: expected ${PAYMENT_CONFIG.activationAmount}, got ${charityTransaction.amount}`
        );
        // Still proceed but log the warning
      }

      // Update transaction
      await db.paymentTransaction.update({
        where: { id: pendingTransaction.id },
        data: {
          status: TransactionStatus.COMPLETED,
          externalTransactionId: charityTransaction.id,
          externalRefId: charityTransaction.refId,
          senderName: charityTransaction.senderName,
          narrative: charityTransaction.narrative,
          transactionTime: new Date(charityTransaction.transactionTime),
          verifiedAt: new Date(),
          verifiedBy: 'system',
          updatedBy: 'system',
        },
      });

      // Activate user
      const activatedUser = await db.user.update({
        where: { id: userId },
        data: {
          status: UserStatus.ACTIVE,
          isActivated: true,
          activatedAt: new Date(),
          updatedBy: 'system',
        },
      });

      console.log(`[PaymentUseCase] User activated: ${userId}`);

      return {
        success: true,
        activated: true,
        user: {
          id: activatedUser.id,
          email: activatedUser.email,
          name: activatedUser.name,
          status: activatedUser.status,
          isActivated: activatedUser.isActivated,
          activatedAt: activatedUser.activatedAt,
        },
        transaction: this.mapToTransactionDto(charityTransaction),
        message: 'Account activated successfully!',
      };
    } catch (error) {
      console.error('[PaymentUseCase] Error verifying activation:', error);
      return {
        success: false,
        activated: false,
        error: error instanceof Error ? error.message : 'Failed to verify activation',
      };
    }
  }

  // ==================== Session Payment ====================

  /**
   * Request session payment
   * Creates a payment request for a mentoring session
   * @param data Request data with sessionId and userId
   * @returns Payment request result with QR code
   */
  async requestSessionPayment(data: IRequestSessionPaymentDto): Promise<ISessionPaymentRequestResult> {
    const { sessionId, userId } = data;

    try {
      console.log(`[PaymentUseCase] Requesting session payment: ${sessionId} for user: ${userId}`);

      // Get session
      const session = await db.sessionMentoring.findUnique({
        where: { id: sessionId },
        include: {
          mentor: {
            include: {
              mentorProfile: true,
            },
          },
        },
      });

      if (!session) {
        return {
          success: false,
          error: 'Session not found',
        };
      }

      // Verify user is the mentee
      if (session.menteeId !== userId) {
        return {
          success: false,
          error: 'You are not authorized to pay for this session',
        };
      }

      // Check if already paid
      if (session.isPaid) {
        return {
          success: false,
          error: 'Session is already paid',
        };
      }

      // Generate payment code
      const paymentCode = generateSessionPaymentCode();
      const expiresAt = calculateCodeExpiry(PAYMENT_CONFIG.sessionPaymentExpiryHours);

      // Get mentor's charity account or use default
      const accountNo = session.mentor.mentorProfile?.charityAccountNo || 
        process.env.CHARITY_ACCOUNT_NO || '2000';
      const accountName = session.mentor.mentorProfile?.charityAccountName || 
        process.env.CHARITY_ACCOUNT_NAME || 'HOC TU THIEN';

      // Update session with payment code
      await db.sessionMentoring.update({
        where: { id: sessionId },
        data: {
          paymentCode,
        },
      });

      // Create pending transaction
      await db.paymentTransaction.create({
        data: {
          userId,
          sessionId,
          type: TransactionType.SESSION_PAYMENT,
          amount: session.amount,
          paymentCode,
          charityAccountNo: accountNo,
          status: TransactionStatus.PENDING,
          createdBy: userId,
        },
      });

      // Generate QR code
      const qrOptions = createSessionPaymentQROptions(
        accountNo,
        accountName,
        paymentCode,
        session.amount
      );

      const qrCodeUrl = VietQRService.generateQRCodeUrl(qrOptions);
      const deepLink = VietQRService.generateDeepLink(qrOptions);

      console.log(`[PaymentUseCase] Session payment request created: ${paymentCode}`);

      return {
        success: true,
        sessionId,
        paymentCode,
        qrCodeUrl,
        deepLink,
        amount: session.amount,
        accountNo,
        accountName,
        expiresAt,
      };
    } catch (error) {
      console.error('[PaymentUseCase] Error requesting session payment:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create session payment request',
      };
    }
  }

  /**
   * Verify session payment
   * Checks if the session has been paid
   * @param data Verification data
   * @returns Verification result
   */
  async verifySessionPayment(data: IVerifySessionPaymentDto): Promise<ISessionPaymentVerificationResult> {
    const { sessionId, paymentCode } = data;

    try {
      console.log(`[PaymentUseCase] Verifying session payment: ${sessionId}`);

      // Get session
      const session = await db.sessionMentoring.findUnique({
        where: { id: sessionId },
        include: {
          mentor: {
            include: {
              mentorProfile: true,
            },
          },
        },
      });

      if (!session) {
        return {
          success: false,
          verified: false,
          error: 'Session not found',
        };
      }

      // Check if already paid
      if (session.isPaid) {
        return {
          success: true,
          verified: true,
          session: {
            id: session.id,
            title: session.title,
            status: session.status,
            isPaid: session.isPaid,
            paidAt: session.paidAt,
            amount: session.amount,
          },
          message: 'Session is already paid',
        };
      }

      // Get pending transaction
      const pendingTransaction = await db.paymentTransaction.findFirst({
        where: {
          sessionId,
          type: TransactionType.SESSION_PAYMENT,
          status: TransactionStatus.PENDING,
        },
        orderBy: { createdAt: 'desc' },
      });

      if (!pendingTransaction) {
        return {
          success: false,
          verified: false,
          error: 'No pending payment found for this session',
        };
      }

      // Get charity account
      const accountNo = session.mentor.mentorProfile?.charityAccountNo || 
        pendingTransaction.charityAccountNo ||
        process.env.CHARITY_ACCOUNT_NO || '2000';
      
      const searchPaymentCode = paymentCode || session.paymentCode || pendingTransaction.paymentCode;

      if (!searchPaymentCode) {
        return {
          success: false,
          verified: false,
          error: 'No payment code found for verification',
        };
      }

      // Look for transaction in charity account
      const charityTransaction = await this.thienNguyenAPI.findTransactionByPaymentCode(
        accountNo,
        searchPaymentCode
      );

      if (!charityTransaction) {
        return {
          success: false,
          verified: false,
          message: 'Payment not found. Please complete the transfer and try again.',
        };
      }

      // Verify amount matches (with small tolerance for rounding)
      const amountDiff = Math.abs(charityTransaction.amount - session.amount);
      if (amountDiff > 1000) {
        console.warn(
          `[PaymentUseCase] Amount mismatch: expected ${session.amount}, got ${charityTransaction.amount}`
        );
      }

      // Update transaction
      await db.paymentTransaction.update({
        where: { id: pendingTransaction.id },
        data: {
          status: TransactionStatus.COMPLETED,
          externalTransactionId: charityTransaction.id,
          externalRefId: charityTransaction.refId,
          senderName: charityTransaction.senderName,
          narrative: charityTransaction.narrative,
          transactionTime: new Date(charityTransaction.transactionTime),
          verifiedAt: new Date(),
          verifiedBy: 'system',
          updatedBy: 'system',
        },
      });

      // Update session
      const updatedSession = await db.sessionMentoring.update({
        where: { id: sessionId },
        data: {
          isPaid: true,
          paidAt: new Date(),
          status: SessionStatus.SCHEDULED,
          updatedBy: 'system',
        },
      });

      // Update mentee's total spent
      await db.menteeProfile.update({
        where: { userId: session.menteeId },
        data: {
          totalSpent: { increment: session.amount },
          totalSessions: { increment: 1 },
        },
      });

      // Update mentor's total earnings
      if (session.mentor.mentorProfile) {
        await db.mentorProfile.update({
          where: { id: session.mentor.mentorProfile.id },
          data: {
            totalEarnings: { increment: session.amount },
            totalSessions: { increment: 1 },
          },
        });
      }

      console.log(`[PaymentUseCase] Session payment verified: ${sessionId}`);

      return {
        success: true,
        verified: true,
        session: {
          id: updatedSession.id,
          title: updatedSession.title,
          status: updatedSession.status,
          isPaid: updatedSession.isPaid,
          paidAt: updatedSession.paidAt,
          amount: updatedSession.amount,
        },
        transaction: this.mapToTransactionDto(charityTransaction),
        message: 'Payment verified successfully!',
      };
    } catch (error) {
      console.error('[PaymentUseCase] Error verifying session payment:', error);
      return {
        success: false,
        verified: false,
        error: error instanceof Error ? error.message : 'Failed to verify session payment',
      };
    }
  }

  // ==================== Generic Payment Verification ====================

  /**
   * Generic payment verification
   * Can be used to verify any payment by code
   * @param paymentCode Payment code to verify
   * @param accountNo Charity account number
   * @returns Verification result
   */
  async verifyPaymentByCode(
    paymentCode: string,
    accountNo: string
  ): Promise<IPaymentVerificationResult> {
    try {
      console.log(`[PaymentUseCase] Verifying payment by code: ${paymentCode}`);

      // Find transaction by payment code
      const charityTransaction = await this.thienNguyenAPI.findTransactionByPaymentCode(
        accountNo,
        paymentCode
      );

      if (!charityTransaction) {
        return {
          success: true,
          verified: false,
          message: 'Payment not found',
        };
      }

      return {
        success: true,
        verified: true,
        transaction: this.mapToTransactionDto(charityTransaction),
        message: 'Payment verified successfully',
      };
    } catch (error) {
      console.error('[PaymentUseCase] Error verifying payment:', error);
      return {
        success: false,
        verified: false,
        error: error instanceof Error ? error.message : 'Failed to verify payment',
      };
    }
  }

  // ==================== Helper Methods ====================

  /**
   * Map charity transaction to DTO
   */
  private mapToTransactionDto(tx: any): IThienNguyenTransactionDto {
    return {
      id: tx.id,
      refId: tx.refId,
      amount: tx.amount,
      narrative: tx.narrative,
      senderName: tx.senderName,
      transactionTime: tx.transactionTime,
      accountNo: tx.accountNo,
      createdAt: tx.createdAt,
      updatedAt: tx.updatedAt,
    };
  }

  /**
   * Get payment statistics for a user
   */
  async getPaymentStats(userId: string): Promise<{
    totalTransactions: number;
    totalAmount: number;
    completedTransactions: number;
    pendingTransactions: number;
  }> {
    const transactions = await db.paymentTransaction.findMany({
      where: {
        userId,
        isDeleted: false,
      },
    });

    const completed = transactions.filter((t) => t.status === TransactionStatus.COMPLETED);
    const pending = transactions.filter((t) => t.status === TransactionStatus.PENDING);
    const totalAmount = completed.reduce((sum, t) => sum + t.amount, 0);

    return {
      totalTransactions: transactions.length,
      totalAmount,
      completedTransactions: completed.length,
      pendingTransactions: pending.length,
    };
  }

  /**
   * Get pending payments for a user
   */
  async getPendingPayments(userId: string): Promise<{
    activations: Array<{ paymentCode: string; amount: number; createdAt: Date }>;
    sessions: Array<{ sessionId: string; paymentCode: string; amount: number; createdAt: Date }>;
  }> {
    const pendingTransactions = await db.paymentTransaction.findMany({
      where: {
        userId,
        status: TransactionStatus.PENDING,
        isDeleted: false,
      },
      orderBy: { createdAt: 'desc' },
    });

    const activations = pendingTransactions
      .filter((t) => t.type === TransactionType.ACTIVATION)
      .map((t) => ({
        paymentCode: t.paymentCode || '',
        amount: t.amount,
        createdAt: t.createdAt,
      }));

    const sessions = pendingTransactions
      .filter((t) => t.type === TransactionType.SESSION_PAYMENT)
      .map((t) => ({
        sessionId: t.sessionId || '',
        paymentCode: t.paymentCode || '',
        amount: t.amount,
        createdAt: t.createdAt,
      }));

    return { activations, sessions };
  }
}

// Singleton instance
let paymentUseCaseInstance: PaymentUseCase | null = null;

/**
 * Get the singleton instance of PaymentUseCase
 */
export function getPaymentUseCase(): PaymentUseCase {
  if (!paymentUseCaseInstance) {
    paymentUseCaseInstance = new PaymentUseCase();
  }
  return paymentUseCaseInstance;
}

/**
 * Reset the singleton instance (for testing)
 */
export function resetPaymentUseCase(): void {
  paymentUseCaseInstance = null;
}
