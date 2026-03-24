/**
 * Activation API Route
 * Handles account activation requests and verification
 */

import { NextRequest, NextResponse } from 'next/server';
import { getAuthSession } from '@/lib/auth';
import { getPaymentUseCase } from '@/application/use-cases/payment.use-case';
import { db } from '@/lib/db';
import {
  CHARITY_ACCOUNT_NO,
  CHARITY_ACCOUNT_NAME,
  CHARITY_BANK,
  ACTIVATION_AMOUNT,
} from '@/lib/constants';
import { VietQRService } from '@/infrastructure/external/viet-qr';
import { generateActivationPaymentCode, calculateCodeExpiry, ACTIVATION_CODE_LENGTH, generateRandomLetters } from '@/application/utils/payment-code';
import { TransactionType, TransactionStatus } from '@prisma/client';

/**
 * GET /api/activation
 * Get activation information for the current user
 * Creates a new activation request if one doesn't exist
 */
export async function GET() {
  try {
    const session = await getAuthSession();

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const userId = session.user.id;

    // Get user
    const user = await db.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    // If already activated, return success
    if (user.isActivated) {
      return NextResponse.json({
        success: true,
        activated: true,
        message: 'Account is already activated',
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          isActivated: user.isActivated,
          activatedAt: user.activatedAt,
        },
      });
    }

    // Check for existing pending activation transaction
    let pendingTransaction = await db.paymentTransaction.findFirst({
      where: {
        userId,
        type: TransactionType.ACTIVATION,
        status: TransactionStatus.PENDING,
      },
      orderBy: { createdAt: 'desc' },
    });

    // Generate activation code if user doesn't have one or it's expired
    let activationCode = user.activationCode;
    let paymentCode = pendingTransaction?.paymentCode;
    let expiresAt = user.activationCodeExpiry;

    // If no activation code or expired, generate new one
    if (!activationCode || !expiresAt || new Date() > new Date(expiresAt)) {
      activationCode = generateRandomLetters(ACTIVATION_CODE_LENGTH);
      paymentCode = generateActivationPaymentCode();
      expiresAt = calculateCodeExpiry(24); // 24 hours

      // Update user with new activation code
      await db.user.update({
        where: { id: userId },
        data: {
          activationCode,
          activationCodeExpiry: expiresAt,
        },
      });

      // Create new pending transaction
      pendingTransaction = await db.paymentTransaction.create({
        data: {
          userId,
          type: TransactionType.ACTIVATION,
          amount: ACTIVATION_AMOUNT,
          paymentCode,
          status: TransactionStatus.PENDING,
          createdBy: userId,
        },
      });
    } else if (!pendingTransaction) {
      // User has code but no transaction, create one
      paymentCode = generateActivationPaymentCode();
      pendingTransaction = await db.paymentTransaction.create({
        data: {
          userId,
          type: TransactionType.ACTIVATION,
          amount: ACTIVATION_AMOUNT,
          paymentCode,
          status: TransactionStatus.PENDING,
          createdBy: userId,
        },
      });
    }

    // Generate QR code URL
    const qrContent = `HOCTUTHIEN KICHHOAT ${activationCode}`;
    const qrCodeUrl = VietQRService.generateQRCodeUrl({
      accountNo: CHARITY_ACCOUNT_NO,
      accountName: CHARITY_ACCOUNT_NAME,
      amount: ACTIVATION_AMOUNT,
      content: qrContent,
      bankCode: 'mbbank',
    });

    // Generate deep link for banking apps
    const deepLink = VietQRService.generateDeepLink({
      accountNo: CHARITY_ACCOUNT_NO,
      accountName: CHARITY_ACCOUNT_NAME,
      amount: ACTIVATION_AMOUNT,
      content: qrContent,
      bankCode: 'mbbank',
    });

    return NextResponse.json({
      success: true,
      activated: false,
      activationCode,
      paymentCode: pendingTransaction?.paymentCode || paymentCode,
      qrCodeUrl,
      deepLink,
      accountInfo: {
        accountNo: CHARITY_ACCOUNT_NO,
        accountName: CHARITY_ACCOUNT_NAME,
        bank: CHARITY_BANK,
      },
      amount: ACTIVATION_AMOUNT,
      transferContent: qrContent,
      expiresAt,
    });
  } catch (error) {
    console.error('[Activation API] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/activation
 * Verify activation payment
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getAuthSession();

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const userId = session.user.id;
    const body = await request.json();

    // Handle verify action
    if (body.action === 'verify') {
      const paymentUseCase = getPaymentUseCase();

      // Get user's payment code from pending transaction
      const pendingTransaction = await db.paymentTransaction.findFirst({
        where: {
          userId,
          type: TransactionType.ACTIVATION,
          status: TransactionStatus.PENDING,
        },
        orderBy: { createdAt: 'desc' },
      });

      const result = await paymentUseCase.verifyActivation({
        userId,
        paymentCode: pendingTransaction?.paymentCode,
      });

      return NextResponse.json(result);
    }

    return NextResponse.json(
      { success: false, error: 'Invalid action' },
      { status: 400 }
    );
  } catch (error) {
    console.error('[Activation API] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500 }
    );
  }
}
