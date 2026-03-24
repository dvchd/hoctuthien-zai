'use client';

/**
 * Mentor Detail Content (Client Component)
 * Displays mentor profile with booking functionality
 */

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import {
  Code,
  Brain,
  Briefcase,
  Languages,
  Palette,
  User,
  Target,
  DollarSign,
  Star,
  Users,
  Clock,
  Calendar,
  Verified,
  ArrowLeft,
  BookOpen,
  Building,
  BriefcaseBusiness,
  CreditCard,
  MessageSquare,
  Send,
  Loader2,
} from 'lucide-react';

// Icon mapping
const iconMap: Record<string, React.ReactNode> = {
  Code: <Code className="h-4 w-4" />,
  Brain: <Brain className="h-4 w-4" />,
  Briefcase: <Briefcase className="h-4 w-4" />,
  Languages: <Languages className="h-4 w-4" />,
  Palette: <Palette className="h-4 w-4" />,
  User: <User className="h-4 w-4" />,
  Target: <Target className="h-4 w-4" />,
  DollarSign: <DollarSign className="h-4 w-4" />,
};

// Days mapping
const DAY_LABELS: Record<string, string> = {
  monday: 'Thứ 2',
  tuesday: 'Thứ 3',
  wednesday: 'Thứ 4',
  thursday: 'Thứ 5',
  friday: 'Thứ 6',
  saturday: 'Thứ 7',
  sunday: 'Chủ nhật',
};

interface TeachingField {
  id: string;
  name: string;
  slug: string;
  icon: string | null;
  color: string | null;
  description: string | null;
  experienceLevel: string | null;
  yearsOfExperience: number | null;
}

interface Review {
  id: string;
  rating: number | null;
  review: string | null;
  reviewedAt: string | null;
  mentee: {
    id: string;
    name: string;
    avatarUrl: string | null;
  };
}

interface AvailableSlot {
  day: string;
  slots: string[];
}

interface MentorDetail {
  id: string;
  name: string | null;
  email: string;
  avatarUrl: string | null;
  bio: string | null;
  title: string | null;
  company: string | null;
  experienceYears: number;
  hourlyRate: number;
  rating: number;
  totalReviews: number;
  totalSessions: number;
  totalEarnings: number;
  charityAccountNo: string | null;
  charityAccountName: string | null;
  isAvailable: boolean;
  isVerified: boolean;
  availableSlots: AvailableSlot[];
  teachingFields: TeachingField[];
  reviews: Review[];
}

interface MentorDetailContentProps {
  mentor: MentorDetail;
}

export function MentorDetailContent({ mentor }: MentorDetailContentProps) {
  const router = useRouter();
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [selectedDay, setSelectedDay] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Format date
  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '';
    return new Intl.DateTimeFormat('vi-VN', {
      dateStyle: 'long',
    }).format(new Date(dateStr));
  };

  // Get initials for avatar fallback
  const getInitials = (name: string | null) => {
    if (!name) return 'M';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Get available days
  const availableDays = mentor.availableSlots
    .filter((slot) => slot.slots.length > 0)
    .map((slot) => ({
      value: slot.day,
      label: DAY_LABELS[slot.day] || slot.day,
      slots: slot.slots,
    }));

  // Get available slots for selected day
  const availableTimes = availableDays.find((d) => d.value === selectedDay)?.slots || [];

  // Handle booking
  const handleBooking = async () => {
    if (!selectedDay || !selectedTime) {
      toast.error('Vui lòng chọn ngày và giờ');
      return;
    }

    setIsSubmitting(true);
    try {
      // For now, just show a success message
      // In a real app, this would create a session request
      toast.success('Đã gửi yêu cầu đặt lịch. Mentor sẽ xác nhận sớm.');
      setIsBookingOpen(false);
      setSelectedDay('');
      setSelectedTime('');
      setNotes('');
    } catch (error) {
      console.error('Booking error:', error);
      toast.error('Có lỗi xảy ra khi đặt lịch');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto py-8 px-4">
      {/* Back Button */}
      <Button variant="ghost" className="mb-6" asChild>
        <Link href="/mentors">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Quay lại danh sách
        </Link>
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Profile Header */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col sm:flex-row gap-6">
                <Avatar className="h-24 w-24 flex-shrink-0">
                  <AvatarImage src={mentor.avatarUrl ?? undefined} alt={mentor.name ?? ''} />
                  <AvatarFallback className="text-2xl">{getInitials(mentor.name)}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h1 className="text-2xl font-bold">{mentor.name}</h1>
                    {mentor.isVerified && (
                      <Badge variant="default" className="gap-1">
                        <Verified className="h-3 w-3" />
                        Đã xác minh
                      </Badge>
                    )}
                  </div>
                  <p className="text-muted-foreground mb-3">
                    {mentor.title}
                    {mentor.company && (
                      <>
                        {' • '}
                        <Building className="h-4 w-4 inline-block" />
                        {mentor.company}
                      </>
                    )}
                  </p>

                  {/* Stats */}
                  <div className="flex flex-wrap gap-4 text-sm">
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                      <span className="font-medium">{mentor.rating.toFixed(1)}</span>
                      <span className="text-muted-foreground">({mentor.totalReviews} đánh giá)</span>
                    </div>
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Users className="h-4 w-4" />
                      <span>{mentor.totalSessions} buổi học</span>
                    </div>
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      <span>{mentor.experienceYears} năm kinh nghiệm</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tabs */}
          <Tabs defaultValue="about" className="space-y-4">
            <TabsList>
              <TabsTrigger value="about">Giới thiệu</TabsTrigger>
              <TabsTrigger value="schedule">Lịch trống</TabsTrigger>
              <TabsTrigger value="reviews">Đánh giá</TabsTrigger>
            </TabsList>

            {/* About Tab */}
            <TabsContent value="about" className="space-y-6">
              {/* Bio */}
              {mentor.bio && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Về tôi</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="whitespace-pre-line text-muted-foreground">{mentor.bio}</p>
                  </CardContent>
                </Card>
              )}

              {/* Teaching Fields */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Lĩnh vực giảng dạy</CardTitle>
                  <CardDescription>Các lĩnh vực mentor có thể hướng dẫn</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {mentor.teachingFields.map((field) => (
                      <div
                        key={field.id}
                        className="flex items-start gap-3 p-3 rounded-lg bg-muted/50"
                      >
                        <div
                          className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                          style={{ backgroundColor: field.color ? `${field.color}20` : undefined }}
                        >
                          <span style={{ color: field.color ?? undefined }}>
                            {field.icon && iconMap[field.icon]}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium">{field.name}</p>
                          {field.description && (
                            <p className="text-sm text-muted-foreground">{field.description}</p>
                          )}
                          {field.yearsOfExperience && (
                            <p className="text-xs text-muted-foreground mt-1">
                              {field.yearsOfExperience} năm kinh nghiệm
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Schedule Tab */}
            <TabsContent value="schedule">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Lịch trống hàng tuần</CardTitle>
                  <CardDescription>Khung giờ mentor có thể dạy</CardDescription>
                </CardHeader>
                <CardContent>
                  {availableDays.length === 0 ? (
                    <p className="text-muted-foreground text-center py-8">
                      Mentor chưa cập nhật lịch trống
                    </p>
                  ) : (
                    <div className="space-y-4">
                      {availableDays.map((day) => (
                        <div key={day.value}>
                          <p className="font-medium mb-2">{day.label}</p>
                          <div className="flex flex-wrap gap-2">
                            {day.slots.map((slot) => (
                              <Badge key={slot} variant="outline">
                                {slot}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Reviews Tab */}
            <TabsContent value="reviews">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Đánh giá từ học viên</CardTitle>
                  <CardDescription>
                    {mentor.totalReviews} đánh giá • {mentor.rating.toFixed(1)} sao trung bình
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {mentor.reviews.length === 0 ? (
                    <p className="text-muted-foreground text-center py-8">
                      Chưa có đánh giá nào
                    </p>
                  ) : (
                    <div className="space-y-4">
                      {mentor.reviews.map((review) => (
                        <div key={review.id} className="p-4 rounded-lg border">
                          <div className="flex items-center gap-3 mb-2">
                            <Avatar className="h-10 w-10">
                              <AvatarImage
                                src={review.mentee.avatarUrl ?? undefined}
                                alt={review.mentee.name}
                              />
                              <AvatarFallback>{getInitials(review.mentee.name)}</AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">{review.mentee.name}</p>
                              <div className="flex items-center gap-2">
                                <div className="flex">
                                  {[1, 2, 3, 4, 5].map((star) => (
                                    <Star
                                      key={star}
                                      className={`h-3 w-3 ${
                                        review.rating && star <= review.rating
                                          ? 'text-yellow-500 fill-yellow-500'
                                          : 'text-muted'
                                      }`}
                                    />
                                  ))}
                                </div>
                                <span className="text-xs text-muted-foreground">
                                  {formatDate(review.reviewedAt)}
                                </span>
                              </div>
                            </div>
                          </div>
                          <p className="text-muted-foreground">{review.review}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Booking Card */}
          <Card className="sticky top-4">
            <CardHeader>
              <CardTitle>Đặt lịch học</CardTitle>
              <CardDescription>Chọn thời gian phù hợp để học với mentor</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Rate */}
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <span className="text-muted-foreground">Gợi ý đóng góp</span>
                <span className="text-xl font-bold text-primary">
                  {formatCurrency(mentor.hourlyRate)}
                  <span className="text-sm font-normal text-muted-foreground">/giờ</span>
                </span>
              </div>

              {/* Status */}
              <div className="flex items-center gap-2 text-sm">
                <div
                  className={`w-2 h-2 rounded-full ${
                    mentor.isAvailable ? 'bg-green-500' : 'bg-red-500'
                  }`}
                />
                <span className="text-muted-foreground">
                  {mentor.isAvailable ? 'Đang nhận học viên' : 'Tạm ngưng nhận học viên'}
                </span>
              </div>

              {/* Book Button */}
              <Dialog open={isBookingOpen} onOpenChange={setIsBookingOpen}>
                <DialogTrigger asChild>
                  <Button className="w-full" disabled={!mentor.isAvailable}>
                    <Calendar className="h-4 w-4 mr-2" />
                    Đặt lịch học
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Đặt lịch học với {mentor.name}</DialogTitle>
                    <DialogDescription>
                      Chọn ngày và giờ bạn muốn học. Mentor sẽ xác nhận yêu cầu của bạn.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label>Ngày trong tuần</Label>
                      <Select value={selectedDay} onValueChange={setSelectedDay}>
                        <SelectTrigger>
                          <SelectValue placeholder="Chọn ngày" />
                        </SelectTrigger>
                        <SelectContent>
                          {availableDays.map((day) => (
                            <SelectItem key={day.value} value={day.value}>
                              {day.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Khung giờ</Label>
                      <Select
                        value={selectedTime}
                        onValueChange={setSelectedTime}
                        disabled={!selectedDay}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Chọn giờ" />
                        </SelectTrigger>
                        <SelectContent>
                          {availableTimes.map((time) => (
                            <SelectItem key={time} value={time}>
                              {time}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Ghi chú cho mentor</Label>
                      <Textarea
                        placeholder="Mô tả những gì bạn muốn học..."
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        rows={3}
                      />
                    </div>

                    <div className="flex justify-end gap-2 pt-4">
                      <Button variant="outline" onClick={() => setIsBookingOpen(false)}>
                        Hủy
                      </Button>
                      <Button onClick={handleBooking} disabled={isSubmitting}>
                        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Gửi yêu cầu
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>

              {/* Charity Account */}
              {mentor.charityAccountNo && (
                <div className="pt-4 border-t">
                  <div className="flex items-center gap-2 mb-2">
                    <CreditCard className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Tài khoản quyên góp</span>
                  </div>
                  <p className="font-mono text-lg">{mentor.charityAccountNo}</p>
                  {mentor.charityAccountName && (
                    <p className="text-sm text-muted-foreground">{mentor.charityAccountName}</p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
