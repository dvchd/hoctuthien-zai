'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Star, Clock, Users, Search, Filter } from 'lucide-react';
import { SiteHeader } from '@/components/layout/site-header';
import { SiteFooter } from '@/components/layout/site-footer';

interface TeachingField {
  id: string;
  name: string;
  slug: string;
  icon: string | null;
  color: string | null;
}

interface Mentor {
  id: string;
  userId: string;
  title: string | null;
  company: string | null;
  hourlyRate: number | null;
  rating: number;
  totalReviews: number;
  totalSessions: number;
  isAvailable: boolean;
  teachingFields: Array<{
    id: string;
    name: string;
    slug: string;
    icon: string | null;
    color: string | null;
  }>;
  user: {
    id: string;
    name: string | null;
    avatarUrl: string | null;
  };
}

interface MentorsClientProps {
  user: {
    id: string;
    email: string;
    name: string | null;
    avatarUrl: string | null;
    role: string;
    isAdmin: boolean;
    isMentor: boolean;
    isMentee: boolean;
  };
  teachingFields: TeachingField[];
  initialFieldId?: string;
  initialSearch?: string;
}

export function MentorsClient({
  user,
  teachingFields,
  initialFieldId,
  initialSearch,
}: MentorsClientProps) {
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFieldId, setSelectedFieldId] = useState<string>(initialFieldId || '');
  const [searchQuery, setSearchQuery] = useState(initialSearch || '');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchMentors();
  }, [selectedFieldId, searchQuery, page]);

  const fetchMentors = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedFieldId) params.append('teachingFieldId', selectedFieldId);
      if (searchQuery) params.append('search', searchQuery);
      params.append('page', page.toString());
      params.append('limit', '12');

      const response = await fetch(`/api/mentors?${params.toString()}`);
      const data = await response.json();

      setMentors(data.data || []);
      setTotalPages(data.totalPages || 1);
    } catch (error) {
      console.error('Error fetching mentors:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFieldChange = (value: string) => {
    setSelectedFieldId(value === 'all' ? '' : value);
    setPage(1);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchMentors();
  };

  const formatPrice = (price: number | null) => {
    if (!price) return 'Liên hệ';
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price);
  };

  const getInitials = (name: string | null) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="flex-1 container py-8">
        <div className="space-y-8">
          {/* Header */}
          <div className="space-y-4">
            <h1 className="text-3xl font-bold">Tìm Mentor</h1>
            <p className="text-muted-foreground">
              Kết nối với những người có kinh nghiệm, sẵn sàng chia sẻ kiến thức và hỗ trợ bạn phát triển.
              Học phí sẽ được chuyển trực tiếp sang quỹ Thiện Nguyện App của MBBank.
            </p>
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <form onSubmit={handleSearch} className="flex-1 flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Tìm kiếm mentor..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button type="submit">Tìm kiếm</Button>
            </form>
            <Select value={selectedFieldId || 'all'} onValueChange={handleFieldChange}>
              <SelectTrigger className="w-full sm:w-[250px]">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Lĩnh vực" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả lĩnh vực</SelectItem>
                {teachingFields.map((field) => (
                  <SelectItem key={field.id} value={field.id}>
                    {field.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Results */}
          {loading ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardHeader className="space-y-4">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-full bg-muted" />
                      <div className="space-y-2 flex-1">
                        <div className="h-4 bg-muted rounded w-3/4" />
                        <div className="h-3 bg-muted rounded w-1/2" />
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="h-3 bg-muted rounded" />
                      <div className="h-3 bg-muted rounded w-3/4" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : mentors.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold">Không tìm thấy mentor</h3>
                <p className="text-muted-foreground mt-2">
                  Hãy thử tìm kiếm với từ khóa khác hoặc bỏ bộ lọc
                </p>
              </CardContent>
            </Card>
          ) : (
            <>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {mentors.map((mentor) => (
                  <Link
                    key={mentor.id}
                    href={`/mentors/${mentor.userId}`}
                    className="group"
                  >
                    <Card className="h-full hover:shadow-lg transition-all duration-200 hover:border-primary/50">
                      <CardHeader className="space-y-4">
                        <div className="flex items-start gap-4">
                          <Avatar className="h-14 w-14">
                            <AvatarImage src={mentor.user.avatarUrl ?? undefined} />
                            <AvatarFallback>
                              {getInitials(mentor.user.name)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <CardTitle className="text-lg truncate group-hover:text-primary transition-colors">
                              {mentor.user.name || 'Mentor'}
                            </CardTitle>
                            <CardDescription className="truncate">
                              {mentor.title}
                            </CardDescription>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex flex-wrap gap-2">
                          {mentor.teachingFields.slice(0, 3).map((field) => (
                            <Badge key={field.id} variant="secondary" className="text-xs">
                              {field.name}
                            </Badge>
                          ))}
                          {mentor.teachingFields.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{mentor.teachingFields.length - 3}
                            </Badge>
                          )}
                        </div>

                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-1 text-yellow-500">
                            <Star className="h-4 w-4 fill-current" />
                            <span className="font-medium">
                              {mentor.rating.toFixed(1)}
                            </span>
                            <span className="text-muted-foreground">
                              ({mentor.totalReviews})
                            </span>
                          </div>
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <Clock className="h-4 w-4" />
                            <span>{mentor.totalSessions} buổi</span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-2 border-t">
                          <span className="font-semibold text-primary">
                            {formatPrice(mentor.hourlyRate)}
                            {mentor.hourlyRate && '/buổi'}
                          </span>
                          {!mentor.isAvailable && (
                            <Badge variant="outline" className="text-xs">
                              Đang bận
                            </Badge>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                  >
                    Trước
                  </Button>
                  <div className="flex items-center px-4">
                    Trang {page} / {totalPages}
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                  >
                    Sau
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
