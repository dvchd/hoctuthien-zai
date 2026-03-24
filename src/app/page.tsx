import { getAuthSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Heart,
  Users,
  BookOpen,
  Shield,
  ArrowRight,
  Star,
  Globe,
  CreditCard,
} from 'lucide-react';
import { SiteHeader } from '@/components/layout/site-header';
import { SiteFooter } from '@/components/layout/site-footer';

export default async function HomePage() {
  const session = await getAuthSession();

  if (session) {
    redirect('/dashboard');
  }

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-br from-background via-background to-primary/5">
          <div className="container py-24 md:py-32">
            <div className="grid gap-12 md:grid-cols-2 items-center">
              <div className="space-y-6">
                <div className="inline-flex items-center px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">
                  <Heart className="w-4 h-4 mr-2" />
                  Học đi đôi với thiện nguyện
                </div>
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
                  Học Từ Thiện
                  <span className="text-primary block">Kết nối tri thức</span>
                </h1>
                <p className="text-lg text-muted-foreground max-w-lg">
                  Nền tảng kết nối 1-1 giữa Mentor và Mentee. Học phí được chuyển trực tiếp
                  sang quỹ Thiện Nguyện App của MBBank, lan tỏa yêu thương đến cộng đồng.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button asChild size="lg" className="text-lg">
                    <Link href="/login">
                      Bắt đầu ngay
                      <ArrowRight className="ml-2 w-5 h-5" />
                    </Link>
                  </Button>
                  <Button asChild variant="outline" size="lg">
                    <Link href="/mentors">Tìm Mentor</Link>
                  </Button>
                </div>
              </div>
              <div className="relative hidden md:block">
                <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-transparent rounded-3xl transform rotate-3"></div>
                <div className="relative bg-background border rounded-3xl p-8 shadow-xl">
                  <div className="grid grid-cols-2 gap-4">
                    <Card>
                      <CardContent className="pt-6">
                        <div className="text-3xl font-bold text-primary">1,000+</div>
                        <p className="text-sm text-muted-foreground">Mentors chất lượng</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="pt-6">
                        <div className="text-3xl font-bold text-primary">5,000+</div>
                        <p className="text-sm text-muted-foreground">Học viên</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="pt-6">
                        <div className="text-3xl font-bold text-primary">10,000+</div>
                        <p className="text-sm text-muted-foreground">Buổi học</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="pt-6">
                        <div className="text-3xl font-bold text-primary">500M+</div>
                        <p className="text-sm text-muted-foreground">VND quyên góp</p>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-24 bg-muted/50">
          <div className="container">
            <div className="text-center space-y-4 mb-16">
              <h2 className="text-3xl md:text-4xl font-bold">Cách thức hoạt động</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Quy trình đơn giản và minh bạch, đảm bảo học phí đến đúng nơi cần thiết
              </p>
            </div>
            <div className="grid gap-8 md:grid-cols-3">
              <Card className="relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16"></div>
                <CardHeader>
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                    <Users className="w-6 h-6 text-primary" />
                  </div>
                  <CardTitle>Kết nối 1-1</CardTitle>
                  <CardDescription>
                    Tìm kiếm và kết nối trực tiếp với Mentor phù hợp với nhu cầu học tập của bạn
                  </CardDescription>
                </CardHeader>
              </Card>
              <Card className="relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16"></div>
                <CardHeader>
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                    <BookOpen className="w-6 h-6 text-primary" />
                  </div>
                  <CardTitle>Học hiệu quả</CardTitle>
                  <CardDescription>
                    Lịch học linh hoạt, nội dung được thiết kế riêng cho từng học viên
                  </CardDescription>
                </CardHeader>
              </Card>
              <Card className="relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16"></div>
                <CardHeader>
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                    <Heart className="w-6 h-6 text-primary" />
                  </div>
                  <CardTitle>Thiện nguyện</CardTitle>
                  <CardDescription>
                    Học phí được chuyển trực tiếp sang quỹ Thiện Nguyện App của MBBank
                  </CardDescription>
                </CardHeader>
              </Card>
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="py-24">
          <div className="container">
            <div className="text-center space-y-4 mb-16">
              <h2 className="text-3xl md:text-4xl font-bold">Tại sao chọn chúng tôi?</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Những giá trị chúng tôi mang đến cho cộng đồng
              </p>
            </div>
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
              <div className="text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                  <Star className="w-8 h-8 text-primary" />
                </div>
                <h3 className="font-semibold text-lg">Mentor chất lượng</h3>
                <p className="text-sm text-muted-foreground">
                  Đội ngũ Mentor được tuyển chọn kỹ lưỡng, có kinh nghiệm thực tế
                </p>
              </div>
              <div className="text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                  <Shield className="w-8 h-8 text-primary" />
                </div>
                <h3 className="font-semibold text-lg">Minh bạch</h3>
                <p className="text-sm text-muted-foreground">
                  Mọi giao dịch đều được ghi nhận và công khai minh bạch
                </p>
              </div>
              <div className="text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                  <Globe className="w-8 h-8 text-primary" />
                </div>
                <h3 className="font-semibold text-lg">Học mọi lúc mọi nơi</h3>
                <p className="text-sm text-muted-foreground">
                  Học online linh hoạt theo lịch trình cá nhân
                </p>
              </div>
              <div className="text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                  <CreditCard className="w-8 h-8 text-primary" />
                </div>
                <h3 className="font-semibold text-lg">Quyên góp trực tiếp</h3>
                <p className="text-sm text-muted-foreground">
                  Học phí chuyển thẳng đến quỹ Thiện Nguyện App MBBank
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24 bg-primary text-primary-foreground">
          <div className="container text-center space-y-8">
            <h2 className="text-3xl md:text-4xl font-bold">
              Bắt đầu hành trình học tập và sẻ chia hôm nay
            </h2>
            <p className="text-lg opacity-90 max-w-2xl mx-auto">
              Tham gia cộng đồng Học Từ Thiện, vừa được học hỏi từ những Mentor giỏi,
              vừa đóng góp cho các hoạt động thiện nguyện
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" variant="secondary" className="text-lg">
                <Link href="/login">Đăng ký miễn phí</Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="text-lg !bg-transparent !border-white !text-white hover:!bg-white hover:!text-primary"
              >
                <Link href="/about">Tìm hiểu thêm</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
