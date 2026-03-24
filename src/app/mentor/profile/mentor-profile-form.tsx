'use client';

/**
 * Mentor Profile Form (Client Component)
 * Form for creating/updating mentor profile
 */

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
  Check,
  X,
  Loader2,
  Star,
  Users,
  Clock,
  CreditCard,
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

// Days of week
const DAYS_OF_WEEK = [
  { key: 'monday', label: 'Thứ 2' },
  { key: 'tuesday', label: 'Thứ 3' },
  { key: 'wednesday', label: 'Thứ 4' },
  { key: 'thursday', label: 'Thứ 5' },
  { key: 'friday', label: 'Thứ 6' },
  { key: 'saturday', label: 'Thứ 7' },
  { key: 'sunday', label: 'Chủ nhật' },
];

const TIME_SLOTS = [
  '08:00', '09:00', '10:00', '11:00', '12:00', '13:00',
  '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00',
];

// Form schema
const mentorProfileSchema = z.object({
  title: z.string().min(2, 'Chức danh phải có ít nhất 2 ký tự').max(100, 'Chức danh quá dài'),
  company: z.string().max(100, 'Tên công ty quá dài').optional(),
  experienceYears: z.number().min(0).max(50),
  hourlyRate: z.number().min(0, 'Giá phải là số dương'),
  bio: z.string().max(500, 'Giới thiệu không quá 500 ký tự').optional(),
  charityAccountNo: z.string().length(4, 'Số tài khoản phải có đúng 4 số').regex(/^\d{4}$/, 'Số tài khoản chỉ chứa số'),
  teachingFieldIds: z.array(z.string()).min(1, 'Chọn ít nhất một lĩnh vực giảng dạy'),
});

type MentorProfileFormValues = z.infer<typeof mentorProfileSchema>;

interface TeachingField {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  color: string | null;
}

interface MentorProfile {
  id: string;
  title: string | null;
  company: string | null;
  experienceYears: number;
  hourlyRate: number;
  charityAccountNo: string | null;
  availableHours: string | null;
  isAvailable: boolean;
  rating: number;
  totalReviews: number;
  totalSessions: number;
}

interface MentorProfileFormProps {
  user: {
    id: string;
    email: string;
    name: string | null;
    avatarUrl: string | null;
    role: string;
  };
  mentorProfile: MentorProfile | null;
  bio: string | null;
  existingFieldIds: string[];
  teachingFields: TeachingField[];
  isMentor: boolean;
}

// Available hours type
interface AvailableHours {
  [key: string]: string[];
}

export function MentorProfileForm({
  user,
  mentorProfile,
  bio,
  existingFieldIds,
  teachingFields,
  isMentor,
}: MentorProfileFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedFields, setSelectedFields] = useState<string[]>(existingFieldIds);
  const [availableHours, setAvailableHours] = useState<AvailableHours>(() => {
    if (mentorProfile?.availableHours) {
      try {
        return JSON.parse(mentorProfile.availableHours);
      } catch {
        return {};
      }
    }
    return {};
  });

  // Initialize form
  const form = useForm<MentorProfileFormValues>({
    resolver: zodResolver(mentorProfileSchema),
    defaultValues: {
      title: mentorProfile?.title ?? '',
      company: mentorProfile?.company ?? '',
      experienceYears: mentorProfile?.experienceYears ?? 0,
      hourlyRate: mentorProfile?.hourlyRate ?? 0,
      bio: bio ?? '',
      charityAccountNo: mentorProfile?.charityAccountNo ?? '',
      teachingFieldIds: existingFieldIds,
    },
  });

  // Toggle teaching field selection
  const toggleField = (fieldId: string) => {
    setSelectedFields((prev) => {
      const newFields = prev.includes(fieldId)
        ? prev.filter((id) => id !== fieldId)
        : [...prev, fieldId];
      form.setValue('teachingFieldIds', newFields);
      return newFields;
    });
  };

  // Toggle time slot for a day
  const toggleTimeSlot = (day: string, slot: string) => {
    setAvailableHours((prev) => {
      const daySlots = prev[day] || [];
      const newSlots = daySlots.includes(slot)
        ? daySlots.filter((s) => s !== slot)
        : [...daySlots, slot].sort();
      return {
        ...prev,
        [day]: newSlots,
      };
    });
  };

  // Select all slots for a day
  const selectAllForDay = (day: string) => {
    setAvailableHours((prev) => ({
      ...prev,
      [day]: [...TIME_SLOTS],
    }));
  };

  // Clear all slots for a day
  const clearAllForDay = (day: string) => {
    setAvailableHours((prev) => {
      const newHours = { ...prev };
      delete newHours[day];
      return newHours;
    });
  };

  // Handle form submission
  const onSubmit = async (data: MentorProfileFormValues) => {
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/mentor/profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...data,
          availableHours: JSON.stringify(availableHours),
        }),
      });

      const result = await response.json();

      if (result.success) {
        toast.success('Lưu hồ sơ thành công!');
        router.refresh();
      } else {
        toast.error(result.error || 'Có lỗi xảy ra');
      }
    } catch (error) {
      console.error('Submit error:', error);
      toast.error('Có lỗi xảy ra khi lưu hồ sơ');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      {mentorProfile && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2">
                <Star className="h-5 w-5 text-yellow-500" />
                <div>
                  <p className="text-2xl font-bold">{mentorProfile.rating.toFixed(1)}</p>
                  <p className="text-sm text-muted-foreground">
                    {mentorProfile.totalReviews} đánh giá
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-blue-500" />
                <div>
                  <p className="text-2xl font-bold">{mentorProfile.totalSessions}</p>
                  <p className="text-sm text-muted-foreground">Buổi học</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-green-500" />
                <div>
                  <p className="text-2xl font-bold">{mentorProfile.experienceYears}</p>
                  <p className="text-sm text-muted-foreground">Năm kinh nghiệm</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Basic Info Card */}
          <Card>
            <CardHeader>
              <CardTitle>Thông tin cơ bản</CardTitle>
              <CardDescription>
                Thông tin này sẽ hiển thị trên hồ sơ mentor của bạn
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Chức danh *</FormLabel>
                      <FormControl>
                        <Input placeholder="VD: Senior Software Engineer" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="company"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Công ty</FormLabel>
                      <FormControl>
                        <Input placeholder="VD: Google, Facebook..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="experienceYears"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Số năm kinh nghiệm *</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={0}
                          max={50}
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="hourlyRate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Số tiền đề xuất / giờ (VND) *</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={0}
                          step={10000}
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormDescription>
                        Số tiền này là gợi ý quyên góp, mentee có thể đóng góp nhiều hơn
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="bio"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Giới thiệu bản thân</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Chia sẻ về kinh nghiệm, thành tựu và phong cách mentor của bạn..."
                        rows={4}
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Tối đa 500 ký tự ({field.value?.length || 0}/500)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Teaching Fields Card */}
          <Card>
            <CardHeader>
              <CardTitle>Lĩnh vực giảng dạy *</CardTitle>
              <CardDescription>
                Chọn các lĩnh vực bạn có thể hướng dẫn
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {teachingFields.map((field) => (
                  <button
                    key={field.id}
                    type="button"
                    onClick={() => toggleField(field.id)}
                    className={`flex items-center gap-3 p-3 rounded-lg border transition-all text-left ${
                      selectedFields.includes(field.id)
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: `${field.color}20` }}
                    >
                      <span style={{ color: field.color ?? undefined }}>
                        {field.icon && iconMap[field.icon]}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{field.name}</p>
                    </div>
                    {selectedFields.includes(field.id) && (
                      <Check className="h-4 w-4 text-primary flex-shrink-0" />
                    )}
                  </button>
                ))}
              </div>
              {form.formState.errors.teachingFieldIds && (
                <p className="text-sm text-destructive mt-2">
                  {form.formState.errors.teachingFieldIds.message}
                </p>
              )}
            </CardContent>
          </Card>

          {/* Charity Account Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Tài khoản Thiện Nguyện App
              </CardTitle>
              <CardDescription>
                Số tài khoản 4 số để nhận thanh toán từ mentee qua Thiện Nguyện App
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FormField
                control={form.control}
                name="charityAccountNo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Số tài khoản (4 số) *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="VD: 2000"
                        maxLength={4}
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Đây là số tài khoản từ Thiện Nguyện App (Ví Thiện Nguyễn) để nhận quyên góp
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Available Hours Card */}
          <Card>
            <CardHeader>
              <CardTitle>Lịch trống</CardTitle>
              <CardDescription>
                Chọn các khung giờ bạn có thể mentor
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {DAYS_OF_WEEK.map((day) => (
                  <div key={day.key} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="font-medium">{day.label}</Label>
                      <div className="flex gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => selectAllForDay(day.key)}
                        >
                          Chọn tất cả
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => clearAllForDay(day.key)}
                        >
                          Xóa tất cả
                        </Button>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {TIME_SLOTS.map((slot) => (
                        <button
                          key={slot}
                          type="button"
                          onClick={() => toggleTimeSlot(day.key, slot)}
                          className={`px-3 py-1.5 text-sm rounded-md border transition-all ${
                            availableHours[day.key]?.includes(slot)
                              ? 'bg-primary text-primary-foreground border-primary'
                              : 'bg-background border-border hover:border-primary/50'
                          }`}
                        >
                          {slot}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Submit Button */}
          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={isSubmitting}
            >
              Hủy
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {mentorProfile ? 'Cập nhật hồ sơ' : 'Tạo hồ sơ'}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
