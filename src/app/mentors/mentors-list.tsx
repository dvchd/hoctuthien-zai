'use client';

/**
 * Mentors List (Client Component)
 * Display grid of mentor cards with filters
 */

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
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
  Search,
  Filter,
  Verified,
  ChevronRight,
} from 'lucide-react';

// Icon mapping
const iconMap: Record<string, React.ReactNode> = {
  Code: <Code className="h-3 w-3" />,
  Brain: <Brain className="h-3 w-3" />,
  Briefcase: <Briefcase className="h-3 w-3" />,
  Languages: <Languages className="h-3 w-3" />,
  Palette: <Palette className="h-3 w-3" />,
  User: <User className="h-3 w-3" />,
  Target: <Target className="h-3 w-3" />,
  DollarSign: <DollarSign className="h-3 w-3" />,
};

interface TeachingField {
  id: string;
  name: string;
  slug: string;
  icon: string | null;
  color: string | null;
}

interface Mentor {
  id: string;
  name: string | null;
  avatarUrl: string | null;
  bio: string | null;
  title: string | null;
  company: string | null;
  hourlyRate: number;
  rating: number;
  totalReviews: number;
  totalSessions: number;
  isVerified: boolean;
  teachingFields: TeachingField[];
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

interface MentorsListProps {
  mentors: Mentor[];
  teachingFields: TeachingField[];
  pagination: Pagination;
  searchParams: {
    teachingField?: string;
    search?: string;
    page?: string;
  };
}

export function MentorsList({
  mentors,
  teachingFields,
  pagination,
  searchParams,
}: MentorsListProps) {
  const router = useRouter();
  const searchParamsHook = useSearchParams();
  const [searchValue, setSearchValue] = useState(searchParams.search ?? '');

  // Handle search
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParamsHook.toString());
    if (searchValue) {
      params.set('search', searchValue);
    } else {
      params.delete('search');
    }
    params.delete('page');
    router.push(`/mentors?${params.toString()}`);
  };

  // Handle field filter
  const handleFieldFilter = (slug: string) => {
    const params = new URLSearchParams(searchParamsHook.toString());
    if (slug && slug !== 'all') {
      params.set('teachingField', slug);
    } else {
      params.delete('teachingField');
    }
    params.delete('page');
    router.push(`/mentors?${params.toString()}`);
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      maximumFractionDigits: 0,
    }).format(amount);
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

  return (
    <div className="container mx-auto py-8 px-4">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Tìm Mentor</h1>
        <p className="text-muted-foreground">
          Khám phá các mentor giàu kinh nghiệm sẵn sàng hỗ trợ bạn
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <form onSubmit={handleSearch} className="flex-1 flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Tìm kiếm mentor..."
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button type="submit">Tìm kiếm</Button>
        </form>

        <Select
          value={searchParams.teachingField ?? 'all'}
          onValueChange={handleFieldFilter}
        >
          <SelectTrigger className="w-full sm:w-[280px]">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Lọc theo lĩnh vực" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả lĩnh vực</SelectItem>
            {teachingFields.map((field) => (
              <SelectItem key={field.id} value={field.slug}>
                {field.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Results count */}
      <div className="mb-4">
        <p className="text-muted-foreground">
          Tìm thấy <span className="font-medium text-foreground">{pagination.total}</span> mentor
        </p>
      </div>

      {/* Mentor Grid */}
      {mentors.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-xl text-muted-foreground">
            Không tìm thấy mentor nào phù hợp
          </p>
          <Button
            variant="link"
            onClick={() => router.push('/mentors')}
            className="mt-2"
          >
            Xóa bộ lọc
          </Button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {mentors.map((mentor) => (
              <Link key={mentor.id} href={`/mentors/${mentor.id}`}>
                <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer">
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-4 mb-4">
                      <Avatar className="h-14 w-14">
                        <AvatarImage src={mentor.avatarUrl ?? undefined} alt={mentor.name ?? ''} />
                        <AvatarFallback>{getInitials(mentor.name)}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold truncate">{mentor.name}</h3>
                          {mentor.isVerified && (
                            <Verified className="h-4 w-4 text-primary flex-shrink-0" />
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground truncate">
                          {mentor.title}
                          {mentor.company && ` tại ${mentor.company}`}
                        </p>
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="flex items-center gap-4 mb-4 text-sm">
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                        <span className="font-medium">{mentor.rating.toFixed(1)}</span>
                        <span className="text-muted-foreground">({mentor.totalReviews})</span>
                      </div>
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Users className="h-4 w-4" />
                        <span>{mentor.totalSessions} buổi</span>
                      </div>
                    </div>

                    {/* Teaching Fields */}
                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {mentor.teachingFields.slice(0, 3).map((field) => (
                        <Badge
                          key={field.id}
                          variant="secondary"
                          className="text-xs"
                          style={{
                            backgroundColor: field.color ? `${field.color}15` : undefined,
                            color: field.color ?? undefined,
                          }}
                        >
                          {field.icon && iconMap[field.icon]}
                          <span className="ml-1">{field.name}</span>
                        </Badge>
                      ))}
                      {mentor.teachingFields.length > 3 && (
                        <Badge variant="secondary" className="text-xs">
                          +{mentor.teachingFields.length - 3}
                        </Badge>
                      )}
                    </div>

                    {/* Rate */}
                    <div className="flex items-center justify-between pt-3 border-t">
                      <span className="text-sm text-muted-foreground">Gợi ý đóng góp</span>
                      <span className="font-semibold text-primary">
                        {formatCurrency(mentor.hourlyRate)}/giờ
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="mt-8">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      href={
                        pagination.page > 1
                          ? `/mentors?${new URLSearchParams({
                              ...Object.fromEntries(searchParamsHook.entries()),
                              page: String(pagination.page - 1),
                            }).toString()}`
                          : '#'
                      }
                      className={pagination.page <= 1 ? 'pointer-events-none opacity-50' : ''}
                    />
                  </PaginationItem>

                  {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
                    .filter((p) => {
                      const current = pagination.page;
                      return p === 1 || p === pagination.totalPages || Math.abs(p - current) <= 1;
                    })
                    .map((p, i, arr) => {
                      // Add ellipsis
                      const prev = arr[i - 1];
                      if (prev && p - prev > 1) {
                        return (
                          <span key={`ellipsis-${p}`}>
                            <PaginationItem>
                              <PaginationEllipsis />
                            </PaginationItem>
                            <PaginationItem key={p}>
                              <PaginationLink
                                href={`/mentors?${new URLSearchParams({
                                  ...Object.fromEntries(searchParamsHook.entries()),
                                  page: String(p),
                                }).toString()}`}
                                isActive={p === pagination.page}
                              >
                                {p}
                              </PaginationLink>
                            </PaginationItem>
                          </span>
                        );
                      }
                      return (
                        <PaginationItem key={p}>
                          <PaginationLink
                            href={`/mentors?${new URLSearchParams({
                              ...Object.fromEntries(searchParamsHook.entries()),
                              page: String(p),
                            }).toString()}`}
                            isActive={p === pagination.page}
                          >
                            {p}
                          </PaginationLink>
                        </PaginationItem>
                      );
                    })}

                  <PaginationItem>
                    <PaginationNext
                      href={
                        pagination.page < pagination.totalPages
                          ? `/mentors?${new URLSearchParams({
                              ...Object.fromEntries(searchParamsHook.entries()),
                              page: String(pagination.page + 1),
                            }).toString()}`
                          : '#'
                      }
                      className={
                        pagination.page >= pagination.totalPages
                          ? 'pointer-events-none opacity-50'
                          : ''
                      }
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </>
      )}
    </div>
  );
}
