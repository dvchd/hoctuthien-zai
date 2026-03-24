'use client';

/**
 * Become a Mentor Content (Client Component)
 */

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Heart,
  Users,
  DollarSign,
  Clock,
  Award,
  TrendingUp,
  CheckCircle,
  ArrowRight,
  Loader2,
} from 'lucide-react';

interface BecomeMentorContentProps {
  user: {
    id: string;
    email: string;
    name: string | null;
    avatarUrl: string | null;
    role: string;
  };
}

const BENEFITS = [
  {
    icon: <Heart className="h-6 w-6 text-pink-500" />,
    title: 'Đóng góp cho cộng đồng',
    description: 'Chia sẻ kiến thức và kinh nghiệm để giúp đỡ những người cần hỗ trợ.',
  },
  {
    icon: <Users className="h-6 w-6 text-blue-500" />,
    title: 'Mở rộng mạng lưới',
    description: 'Kết nối với những người có cùng đam mê và xây dựng cộng đồng.',
  },
  {
    icon: <DollarSign className="h-6 w-6 text-green-500" />,
    title: 'Quyên góp từ thiện',
    description: 'Nhận quyên góp từ mentee và đóng góp vào các hoạt động từ thiện.',
  },
  {
    icon: <Award className="h-6 w-6 text-yellow-500" />,
    title: 'Xây dựng thương hiệu cá nhân',
    description: 'Thể hiện chuyên môn và xây dựng uy tín trong lĩnh vực của bạn.',
  },
  {
    icon: <TrendingUp className="h-6 w-6 text-purple-500" />,
    title: 'Phát triển bản thân',
    description: 'Cải thiện kỹ năng giao tiếp, lãnh đạo và huấn luyện.',
  },
  {
    icon: <Clock className="h-6 w-6 text-cyan-500" />,
    title: 'Linh hoạt thời gian',
    description: 'Tự quản lý lịch trình và số giờ mentor mỗi tuần.',
  },
];

const STEPS = [
  {
    step: 1,
    title: 'Đăng ký làm Mentor',
    description: 'Điền thông tin hồ sơ và lĩnh vực chuyên môn.',
  },
  {
    step: 2,
    title: 'Thiết lập lịch trống',
    description: 'Chọn các khung giờ bạn có thể mentor.',
  },
  {
    step: 3,
    title: 'Nhận yêu cầu từ Mentee',
    description: 'Xem và chấp nhận các yêu cầu mentor.',
  },
  {
    step: 4,
    title: 'Bắt đầu mentor',
    description: 'Tham gia buổi học và chia sẻ kiến thức.',
  },
];

export function BecomeMentorContent({ user }: BecomeMentorContentProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleBecomeMentor = async () => {
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/mentor/profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: '',
          company: '',
          experienceYears: 0,
          hourlyRate: 50000,
          teachingFieldIds: [],
        }),
      });

      const result = await response.json();

      if (result.success) {
        router.push('/mentor/profile');
      } else {
        // If there's an error, still redirect to profile page to complete setup
        router.push('/mentor/profile');
      }
    } catch (error) {
      console.error('Error:', error);
      router.push('/mentor/profile');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      {/* Hero Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto text-center max-w-4xl">
          <Badge variant="secondary" className="mb-4">
            Trở thành Mentor
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Chia sẻ kiến thức, <br />
            <span className="text-primary">Lan tỏa yêu thương</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Trở thành mentor tại Học Từ Thiện để chia sẻ kiến thức, kinh nghiệm của bạn
            và giúp đỡ cộng đồng phát triển.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" onClick={handleBecomeMentor} disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Đăng ký ngay
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Button variant="outline" size="lg" asChild>
              <Link href="/mentors">Xem các Mentor</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-3xl font-bold text-center mb-12">
            Tại sao nên trở thành Mentor?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {BENEFITS.map((benefit, index) => (
              <Card key={index} className="border-0 shadow-sm">
                <CardContent className="pt-6">
                  <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center mb-4">
                    {benefit.icon}
                  </div>
                  <h3 className="font-semibold text-lg mb-2">{benefit.title}</h3>
                  <p className="text-muted-foreground">{benefit.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-4xl">
          <h2 className="text-3xl font-bold text-center mb-12">
            Cách thức hoạt động
          </h2>
          <div className="space-y-4">
            {STEPS.map((step, index) => (
              <div
                key={index}
                className="flex items-start gap-4 p-4 rounded-lg bg-card border"
              >
                <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold flex-shrink-0">
                  {step.step}
                </div>
                <div>
                  <h3 className="font-semibold text-lg">{step.title}</h3>
                  <p className="text-muted-foreground">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="container mx-auto max-w-3xl">
          <h2 className="text-3xl font-bold text-center mb-12">
            Câu hỏi thường gặp
          </h2>
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Tôi cần kinh nghiệm bao nhiêu năm?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Không có yêu cầu tối thiểu về số năm kinh nghiệm. Miễn là bạn có kiến thức
                  và kỹ năng trong lĩnh vực của mình và muốn chia sẻ với người khác.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Tôi nhận được gì khi mentor?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Bạn sẽ nhận được quyên góp từ mentee qua Thiện Nguyện App. Số tiền này
                  có thể được sử dụng cho các hoạt động từ thiện hoặc giữ lại cho cá nhân.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Tôi có thể mentor bao nhiêu giờ mỗi tuần?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Bạn hoàn toàn linh hoạt trong việc quản lý thời gian. Có thể mentor 1-2 giờ
                  mỗi tuần hoặc nhiều hơn tùy theo khả năng và lịch trình của bạn.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Làm thế nào để bắt đầu?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Đơn giản! Chỉ cần nhấn nút "Đăng ký ngay" ở trên và điền thông tin hồ sơ.
                  Sau đó bạn có thể bắt đầu nhận yêu cầu từ mentee ngay.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-4xl text-center">
          <Card className="border-0 shadow-lg bg-primary text-primary-foreground">
            <CardContent className="py-12">
              <h2 className="text-3xl font-bold mb-4">
                Sẵn sàng chia sẻ kiến thức?
              </h2>
              <p className="text-lg opacity-90 mb-8 max-w-xl mx-auto">
                Tham gia cộng đồng mentor tại Học Từ Thiện và bắt đầu hành trình
                chia sẻ kiến thức của bạn ngay hôm nay.
              </p>
              <Button
                size="lg"
                variant="secondary"
                onClick={handleBecomeMentor}
                disabled={isSubmitting}
              >
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Bắt đầu ngay
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
