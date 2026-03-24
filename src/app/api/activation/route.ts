/**
 * Activation API Route
 * Handles account activation requests and verification
 */

import { NextRequest, NextResponse } from 'next/server';
import { getAuthSession } from '@/lib/auth';
import { getPaymentUseCase } from '@/application/use-cases/payment.use-case';
import { db } from '@/lib/db';
import { TransactionType, TransactionStatus } from '@prisma/client';

/**
 * GET /api/activation
 * Get activation information for the current user
 * Uses PaymentUseCase to handle code reuse logic
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

    // Get user for additional info
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

    // Use PaymentUseCase to get or create activation
    const paymentUseCase = getPaymentUseCase();
    const result = await paymentUseCase.getOrCreateActivation({ userId });

    if (!result.success) {
      return NextResponse.json(result, { status: 400 });
    }

    // Return activation info with additional fields for frontend
    return NextResponse.json({
      ...result,
      activated: false,
      accountInfo: {
        accountNo: result.accountNo,
        accountName: result.accountName,
        bank: 'MBBank',
      },
      transferContent: `HOCTUTHIEN KICHHOAT ${result.activationCode}`,
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
