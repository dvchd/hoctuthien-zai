'use client';

/**
 * Activation Client Component
 * Displays QR code and handles activation verification
 */

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  CheckCircle2,
  Copy,
  QrCode,
  Loader2,
  AlertCircle,
  CheckCircle,
  Clock,
  Building2,
  User,
  DollarSign,
  CreditCard,
  ExternalLink,
  ArrowLeft,
} from 'lucide-react';
import type { IActivationPageData } from './page';
import { formatCurrency } from '@/lib/constants';

interface ActivationClientProps {
  data: IActivationPageData;
  userName?: string | null;
}

export function ActivationClient({ data, userName }: ActivationClientProps) {
  const router = useRouter();
  const [isVerifying, setIsVerifying] = useState(false);
  const [verifyResult, setVerifyResult] = useState<{
    success: boolean;
    message?: string;
    error?: string;
  } | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Copy to clipboard
  const copyToClipboard = useCallback(async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  }, []);

  // Handle verification
  const handleVerify = useCallback(async () => {
    setIsVerifying(true);
    setVerifyResult(null);

    try {
      const response = await fetch('/api/activation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: 'verify' }),
      });

      const result = await response.json();
      setVerifyResult(result);

      if (result.success && result.activated) {
        // Redirect to dashboard after successful activation
        setTimeout(() => {
          router.push('/dashboard');
        }, 2000);
      }
    } catch (err) {
      setVerifyResult({
        success: false,
        error: err instanceof Error ? err.message : 'Failed to verify activation',
      });
    } finally {
      setIsVerifying(false);
    }
  }, [router]);

  // Info item component
  const InfoItem = ({
    label,
    value,
    icon: Icon,
    copyValue,
    fieldId,
  }: {
    label: string;
    value: string;
    icon: React.ElementType;
    copyValue?: string;
    fieldId: string;
  }) => (
    <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
      <div className="flex items-center gap-3">
        <Icon className="h-5 w-5 text-muted-foreground" />
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="font-medium">{value}</p>
        </div>
      </div>
      {copyValue && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => copyToClipboard(copyValue, fieldId)}
          className="h-8 px-2"
        >
          {copiedField === fieldId ? (
            <CheckCircle className="h-4 w-4 text-green-500" />
          ) : (
            <Copy className="h-4 w-4" />
          )}
        </Button>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30 py-8 px-4">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => router.push('/dashboard')}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Quay lại Dashboard
        </Button>

        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold">Kích hoạt tài khoản</h1>
          <p className="text-muted-foreground">
            Chào {userName || 'bạn'}! Vui lòng hoàn tất kích hoạt tài khoản để bắt đầu học tập.
          </p>
        </div>

        {/* Success Alert */}
        {verifyResult?.success && verifyResult?.message && (
          <Alert className="border-green-500 bg-green-50 dark:bg-green-950">
            <CheckCircle2 className="h-4 w-4 text-green-500" />
            <AlertTitle className="text-green-700 dark:text-green-400">
              Kích hoạt thành công!
            </AlertTitle>
            <AlertDescription className="text-green-600 dark:text-green-300">
              {verifyResult.message}
            </AlertDescription>
          </Alert>
        )}

        {/* Error Alert */}
        {verifyResult && !verifyResult.success && verifyResult.error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Lỗi</AlertTitle>
            <AlertDescription>{verifyResult.error}</AlertDescription>
          </Alert>
        )}

        {/* Payment not found message */}
        {verifyResult && !verifyResult.success && verifyResult.message && !verifyResult.error && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Chưa tìm thấy giao dịch</AlertTitle>
            <AlertDescription>{verifyResult.message}</AlertDescription>
          </Alert>
        )}

        <div className="grid gap-6 md:grid-cols-2">
          {/* QR Code Card */}
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="flex items-center justify-center gap-2">
                <QrCode className="h-5 w-5" />
                Mã QR thanh toán
              </CardTitle>
              <CardDescription>
                Quét mã QR để chuyển khoản nhanh
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center space-y-4">
              {/* QR Code Image */}
              <div className="relative p-4 bg-white rounded-xl shadow-md">
                <img
                  src={data.qrCodeUrl}
                  alt="QR Code thanh toán"
                  className="w-48 h-48 object-contain"
                />
              </div>

              {/* Deep Link Button */}
              <Button
                variant="outline"
                className="w-full"
                onClick={() => window.open(data.deepLink, '_blank')}
              >
                <ExternalLink className="mr-2 h-4 w-4" />
                Mở ứng dụng ngân hàng
              </Button>

              {/* Expiry Badge */}
              {data.expiresAt && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span>
                    Hết hạn:{' '}
                    {new Date(data.expiresAt).toLocaleString('vi-VN', {
                      hour: '2-digit',
                      minute: '2-digit',
                      day: '2-digit',
                      month: '2-digit',
                    })}
                  </span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Account Info Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Thông tin chuyển khoản
              </CardTitle>
              <CardDescription>
                Hoặc chuyển khoản thủ công với thông tin bên dưới
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <InfoItem
                label="Số tài khoản"
                value={data.accountNo}
                icon={Building2}
                copyValue={data.accountNo}
                fieldId="accountNo"
              />
              <InfoItem
                label="Tên tài khoản"
                value={data.accountName}
                icon={User}
                copyValue={data.accountName}
                fieldId="accountName"
              />
              <InfoItem
                label="Ngân hàng"
                value={data.bank}
                icon={Building2}
                fieldId="bank"
              />
              <InfoItem
                label="Số tiền"
                value={formatCurrency(data.amount)}
                icon={DollarSign}
                copyValue={data.amount.toString()}
                fieldId="amount"
              />
            </CardContent>
          </Card>
        </div>

        {/* Transfer Content Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Nội dung chuyển khoản</CardTitle>
            <CardDescription>
              Quan trọng: Vui lòng nhập chính xác nội dung này để hệ thống tự động xác nhận
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Input
                value={data.transferContent}
                readOnly
                className="font-mono text-lg font-semibold"
              />
              <Button
                variant="outline"
                size="icon"
                onClick={() => copyToClipboard(data.transferContent, 'content')}
              >
                {copiedField === 'content' ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
            <div className="mt-4 flex items-center gap-2">
              <Badge variant="secondary" className="font-mono">
                Mã kích hoạt: {data.activationCode}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Verification Section */}
        <Card>
          <CardHeader>
            <CardTitle>Xác nhận thanh toán</CardTitle>
            <CardDescription>
              Sau khi chuyển khoản, nhấn nút bên dưới để hệ thống xác nhận
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-3 p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
              <AlertCircle className="h-5 w-5 text-blue-500 mt-0.5" />
              <div className="text-sm text-blue-700 dark:text-blue-300">
                <p className="font-medium mb-1">Lưu ý:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Số tiền chính xác: {formatCurrency(data.amount)}</li>
                  <li>Nội dung chuyển khoản phải đúng như trên</li>
                  <li>Giao dịch có thể mất 1-2 phút để được ghi nhận</li>
                </ul>
              </div>
            </div>

            <Button
              onClick={handleVerify}
              disabled={isVerifying}
              className="w-full"
              size="lg"
            >
              {isVerifying ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Đang xác nhận...
                </>
              ) : (
                <>
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  Tôi đã chuyển khoản
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Help Section */}
        <div className="text-center text-sm text-muted-foreground">
          <p>
            Cần hỗ trợ?{' '}
            <a href="#" className="text-primary hover:underline">
              Liên hệ admin
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
