import { getAuthSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { LoginForm } from '@/components/auth/login-form';

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string; error?: string }>;
}) {
  const session = await getAuthSession();

  if (session) {
    redirect('/dashboard');
  }

  // Await searchParams (Next.js 15+ requirement)
  const params = await searchParams;

  // Get error message
  const getErrorMessage = (error: string) => {
    console.log('Login error received:', error);
    
    switch (error) {
      case 'google':
        return 'Lỗi kết nối với Google. Vui lòng kiểm tra cấu hình OAuth và thử lại.';
      case 'OAuthAccountNotLinked':
        return 'Tài khoản Google này chưa được liên kết. Vui lòng đăng nhập lại.';
      case 'OAuthSignin':
        return 'Lỗi khi khởi tạo đăng nhập Google. Vui lòng thử lại.';
      case 'OAuthCallback':
        return 'Lỗi khi xử lý phản hồi từ Google. Vui lòng kiểm tra Redirect URI trong Google Cloud Console.';
      case 'OAuthCreateAccount':
        return 'Lỗi khi tạo tài khoản. Vui lòng thử lại.';
      case 'EmailCreateAccount':
        return 'Lỗi khi tạo tài khoản với email này.';
      case 'Callback':
        return 'Lỗi callback. Vui lòng kiểm tra cấu hình NextAuth.';
      case 'AccessDenied':
        return 'Truy cập bị từ chối. Vui lòng liên hệ quản trị viên.';
      case 'Configuration':
        return 'Lỗi cấu hình hệ thống. Vui lòng kiểm tra biến môi trường GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, NEXTAUTH_URL.';
      default:
        return `Đã xảy ra lỗi (${error}). Vui lòng thử lại.`;
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-background via-background to-primary/5 p-4">
      <div className="w-full max-w-md space-y-8">
        {params.error && (
          <div className="bg-destructive/10 text-destructive text-sm p-4 rounded-lg text-center">
            {getErrorMessage(params.error)}
          </div>
        )}
        <LoginForm callbackUrl={params.callbackUrl} />

        <div className="text-center space-y-2">
          <p className="text-sm text-muted-foreground">
            Bằng việc đăng nhập, bạn đồng ý với{' '}
            <span className="text-primary hover:underline cursor-pointer">
              Điều khoản dịch vụ
            </span>{' '}
            và{' '}
            <span className="text-primary hover:underline cursor-pointer">
              Chính sách bảo mật
            </span>
          </p>
        </div>
      </div>

      <footer className="mt-auto pt-8 text-center text-sm text-muted-foreground">
        <p>© 2024 Học Từ Thiện. Kết nối tri thức - Lan tỏa yêu thương.</p>
      </footer>
    </div>
  );
}
