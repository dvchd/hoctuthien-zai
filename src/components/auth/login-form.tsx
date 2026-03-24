'use client';

/**
 * Login Form Component
 * Google OAuth login button for Hoc Tu Thien platform
 */

import { signIn } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Chrome, Heart, Users, BookOpen } from 'lucide-react';
import { useState } from 'react';

interface LoginFormProps {
  callbackUrl?: string;
}

export function LoginForm({ callbackUrl }: LoginFormProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleLogin = async () => {
    try {
      setIsLoading(true);
      // Always redirect to dashboard after login
      const redirectUrl = callbackUrl || '/dashboard';
      await signIn('google', {
        callbackUrl: redirectUrl,
        redirect: true,
      });
    } catch (error) {
      console.error('Login error:', error);
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto shadow-xl">
      <CardHeader className="text-center space-y-4">
        <div className="flex justify-center">
          <div className="p-3 bg-primary/10 rounded-full">
            <Heart className="w-12 h-12 text-primary" />
          </div>
        </div>
        <CardTitle className="text-2xl font-bold">Học Từ Thiện</CardTitle>
        <CardDescription className="text-base">
          Nền tảng kết nối Mentor và Mentee với trái tim nhân ái
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="space-y-4">
          <Button
            onClick={handleGoogleLogin}
            className="w-full h-12 text-base font-medium"
            size="lg"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <div className="mr-3 h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Đang xử lý...
              </>
            ) : (
              <>
                <Chrome className="mr-3 w-5 h-5" />
                Đăng nhập với Google
              </>
            )}
          </Button>
        </div>

        <div className="pt-4 border-t">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="space-y-2">
              <div className="flex justify-center">
                <Users className="w-6 h-6 text-muted-foreground" />
              </div>
              <p className="text-xs text-muted-foreground">Kết nối 1-1</p>
            </div>
            <div className="space-y-2">
              <div className="flex justify-center">
                <BookOpen className="w-6 h-6 text-muted-foreground" />
              </div>
              <p className="text-xs text-muted-foreground">Học hiệu quả</p>
            </div>
            <div className="space-y-2">
              <div className="flex justify-center">
                <Heart className="w-6 h-6 text-muted-foreground" />
              </div>
              <p className="text-xs text-muted-foreground">Thiện nguyện</p>
            </div>
          </div>
        </div>

        <p className="text-xs text-center text-muted-foreground">
          Học phí được chuyển trực tiếp sang quỹ Thiện Nguyện App của MBBank
        </p>
      </CardContent>
    </Card>
  );
}
