/**
 * Activation Page (Server Component)
 * Handles authentication check and redirects
 */

import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { db } from '@/lib/db';
import { TransactionType, TransactionStatus } from '@prisma/client';
import {
  CHARITY_ACCOUNT_NO,
  CHARITY_ACCOUNT_NAME,
  CHARITY_BANK,
  ACTIVATION_AMOUNT,
} from '@/lib/constants';
import { VietQRService } from '@/infrastructure/external/viet-qr';
import {
  generateActivationPaymentCode,
  calculateCodeExpiry,
  ACTIVATION_CODE_LENGTH,
  generateRandomLetters,
} from '@/application/utils/payment-code';
import { ActivationClient } from './activation-client';

// Page configuration
export const dynamic = 'force-dynamic';

export interface IActivationPageData {
  activationCode: string;
  paymentCode: string;
  qrCodeUrl: string;
  deepLink: string;
  accountNo: string;
  accountName: string;
  bank: string;
  amount: number;
  transferContent: string;
  expiresAt: Date | null;
}

async function getActivationData(userId: string): Promise<IActivationPageData> {
  // Get user
  const user = await db.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new Error('User not found');
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
  const transferContent = `HOCTUTHIEN KICHHOAT ${activationCode}`;
  const qrCodeUrl = VietQRService.generateQRCodeUrl({
    accountNo: CHARITY_ACCOUNT_NO,
    accountName: CHARITY_ACCOUNT_NAME,
    amount: ACTIVATION_AMOUNT,
    content: transferContent,
    bankCode: 'mbbank',
  });

  // Generate deep link for banking apps
  const deepLink = VietQRService.generateDeepLink({
    accountNo: CHARITY_ACCOUNT_NO,
    accountName: CHARITY_ACCOUNT_NAME,
    amount: ACTIVATION_AMOUNT,
    content: transferContent,
    bankCode: 'mbbank',
  });

  return {
    activationCode: activationCode || '',
    paymentCode: pendingTransaction?.paymentCode || paymentCode || '',
    qrCodeUrl,
    deepLink,
    accountNo: CHARITY_ACCOUNT_NO,
    accountName: CHARITY_ACCOUNT_NAME,
    bank: CHARITY_BANK,
    amount: ACTIVATION_AMOUNT,
    transferContent,
    expiresAt,
  };
}

export default async function ActivationPage() {
  // Check authentication
  const user = await getCurrentUser();

  if (!user) {
    redirect('/login');
  }

  // Check if already activated
  const dbUser = await db.user.findUnique({
    where: { id: user.id },
    select: { isActivated: true },
  });

  if (dbUser?.isActivated) {
    redirect('/dashboard');
  }

  // Get activation data
  const activationData = await getActivationData(user.id);

  return <ActivationClient data={activationData} userName={user.name} />;
}
