import { getCurrentUser } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  Users,
  BookOpen,
  Calendar,
  TrendingUp,
  Heart,
  Clock,
  Star,
  MessageSquare,
  AlertCircle,
  ArrowRight,
} from 'lucide-react';
import Link from 'next/link';

// Dashboard cho Admin
async function AdminDashboard() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard Quản trị</h1>
          <p className="text-muted-foreground">Tổng quan hoạt động hệ thống</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tổng người dùng</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,234</div>
            <p className="text-xs text-muted-foreground">+12% so với tháng trước</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Mentors hoạt động</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">156</div>
            <p className="text-xs text-muted-foreground">+5 Mentor mới tháng này</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Buổi học tháng này</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">432</div>
            <p className="text-xs text-muted-foreground">+23% so với tháng trước</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Quỹ thiện nguyện</CardTitle>
            <Heart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">52.5M VND</div>
            <p className="text-xs text-muted-foreground">Đã quyên góp tháng này</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Thao tác nhanh</CardTitle>
          <CardDescription>Các chức năng quản trị phổ biến</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <Button asChild variant="outline">
              <Link href="/admin/users">
                <Users className="mr-2 h-4 w-4" />
                Quản lý người dùng
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/admin/mentors">
                <Star className="mr-2 h-4 w-4" />
                Duyệt Mentor
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/admin/transactions">
                <TrendingUp className="mr-2 h-4 w-4" />
                Giao dịch
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/admin/reports">
                <MessageSquare className="mr-2 h-4 w-4" />
                Báo cáo
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Dashboard cho Mentor
async function MentorDashboard() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard Mentor</h1>
          <p className="text-muted-foreground">Quản lý lịch dạy và học viên</p>
        </div>
        <Button asChild>
          <Link href="/sessions/new">Tạo buổi học mới</Link>
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Buổi học tháng này</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">24</div>
            <p className="text-xs text-muted-foreground">8 buổi sắp tới</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Đánh giá trung bình</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">4.9</div>
            <p className="text-xs text-muted-foreground">Từ 156 đánh giá</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Học viên đang theo</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">18</div>
            <p className="text-xs text-muted-foreground">3 học viên mới tuần này</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Đóng góp thiện nguyện</CardTitle>
            <Heart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12.5M VND</div>
            <p className="text-xs text-muted-foreground">Tổng số đã quyên góp</p>
          </CardContent>
        </Card>
      </div>

      {/* Upcoming Sessions */}
      <Card>
        <CardHeader>
          <CardTitle>Buổi học sắp tới</CardTitle>
          <CardDescription>Lịch dạy trong những ngày tới</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Calendar className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">Tư vấn lập trình {i}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(Date.now() + i * 86400000).toLocaleDateString('vi-VN')}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant="secondary">60 phút</Badge>
                  <Button size="sm" variant="outline">
                    Chi tiết
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Dashboard cho Mentee
interface MenteeDashboardProps {
  isActivated?: boolean;
}

async function MenteeDashboard({ isActivated }: MenteeDashboardProps) {
  // Show activation banner if not activated
  if (!isActivated) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Dashboard Học viên</h1>
            <p className="text-muted-foreground">Chào mừng bạn đến với Học Từ Thiện</p>
          </div>
        </div>

        {/* Activation Required Banner */}
        <Alert className="border-primary/50 bg-primary/5">
          <AlertCircle className="h-5 w-5 text-primary" />
          <AlertTitle className="text-lg font-semibold">Kích hoạt tài khoản</AlertTitle>
          <AlertDescription className="mt-2">
            <p className="mb-4">
              Để bắt đầu học tập và đặt lịch với Mentor, bạn cần kích hoạt tài khoản bằng cách
              chuyển khoản <strong>10,000 VND</strong> đến quỹ Thiện Nguyện.
            </p>
            <Button asChild size="lg" className="mt-2">
              <Link href="/activation">
                Kích hoạt ngay
                <ArrowRight className="ml-2 w-4 h-4" />
              </Link>
            </Button>
          </AlertDescription>
        </Alert>

        {/* Info Cards */}
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="w-5 h-5 text-primary" />
                Tại sao cần kích hoạt?
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Đặt lịch học với Mentor</li>
                <li>• Tham gia các buổi tư vấn 1-1</li>
                <li>• Đóng góp vào quỹ thiện nguyện</li>
                <li>• Theo dõi tiến độ học tập</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="w-5 h-5 text-primary" />
                Quy trình đơn giản
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ol className="space-y-2 text-sm text-muted-foreground">
                <li>1. Bấm "Kích hoạt ngay"</li>
                <li>2. Chuyển khoản 10,000 VND</li>
                <li>3. Xác nhận thanh toán</li>
                <li>4. Bắt đầu học ngay!</li>
              </ol>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard Học viên</h1>
          <p className="text-muted-foreground">Theo dõi tiến độ học tập của bạn</p>
        </div>
        <Button asChild>
          <Link href="/mentors">Tìm Mentor</Link>
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Buổi học đã hoàn thành</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">Tổng số buổi đã học</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Buổi học sắp tới</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <p className="text-xs text-muted-foreground">Trong tuần này</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Mentors đang theo</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2</div>
            <p className="text-xs text-muted-foreground">Đang hoạt động</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Đóng góp thiện nguyện</CardTitle>
            <Heart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2.4M VND</div>
            <p className="text-xs text-muted-foreground">Tổng số đã quyên góp</p>
          </CardContent>
        </Card>
      </div>

      {/* Learning Progress */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Buổi học sắp tới</CardTitle>
            <CardDescription>Lịch học trong những ngày tới</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[1, 2].map((i) => (
                <div key={i} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Calendar className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">Học React.js cơ bản</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(Date.now() + i * 86400000).toLocaleDateString('vi-VN')} - 10:00
                      </p>
                    </div>
                  </div>
                  <Badge>Đã đặt</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Mục tiêu học tập</CardTitle>
            <CardDescription>Theo dõi tiến độ của bạn</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Học React.js cơ bản</span>
                  <span className="text-muted-foreground">75%</span>
                </div>
                <div className="h-2 bg-secondary rounded-full">
                  <div className="h-2 bg-primary rounded-full" style={{ width: '75%' }}></div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Làm dự án thực tế</span>
                  <span className="text-muted-foreground">40%</span>
                </div>
                <div className="h-2 bg-secondary rounded-full">
                  <div className="h-2 bg-primary rounded-full" style={{ width: '40%' }}></div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Ôn tập JavaScript</span>
                  <span className="text-muted-foreground">100%</span>
                </div>
                <div className="h-2 bg-secondary rounded-full">
                  <div className="h-2 bg-primary rounded-full" style={{ width: '100%' }}></div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default async function DashboardPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/login');
  }

  // Render dashboard based on role
  if (user.isAdmin) {
    return <AdminDashboard />;
  }

  if (user.isMentor) {
    return <MentorDashboard />;
  }

  return <MenteeDashboard isActivated={user.isActivated} />;
}
