/**
 * Mentor Use Cases
 */

import { db } from '@/lib/db';
import { Prisma } from '@prisma/client';

export interface ICreateMentorProfileDto {
  title?: string;
  company?: string;
  experienceYears?: number;
  hourlyRate?: number;
  charityAccountNo?: string;
  charityAccountName?: string;
  teachingFieldIds?: string[];
  availableHours?: string;
}

export interface IUpdateMentorProfileDto extends ICreateMentorProfileDto {
  isAvailable?: boolean;
}

export interface IMentorFilterDto {
  teachingFieldId?: string;
  isAvailable?: boolean;
  isVerified?: boolean;
  search?: string;
  page?: number;
  limit?: number;
}

export interface IMentorProfileResponse {
  id: string;
  userId: string;
  title: string | null;
  company: string | null;
  experienceYears: number;
  hourlyRate: number | null;
  rating: number;
  totalReviews: number;
  totalSessions: number;
  charityAccountNo: string | null;
  charityAccountName: string | null;
  isAvailable: boolean;
  isVerified: boolean;
  availableHours: string | null;
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
    email: string;
    avatarUrl: string | null;
    bio: string | null;
  };
}

export class MentorUseCase {
  /**
   * Get mentor profile by user ID
   */
  async getMentorProfile(userId: string): Promise<IMentorProfileResponse | null> {
    const profile = await db.mentorProfile.findUnique({
      where: { userId, isDeleted: false },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatarUrl: true,
            bio: true,
          },
        },
      },
    });

    if (!profile) return null;

    // Get teaching fields
    const mentorFields = await db.mentorTeachingField.findMany({
      where: { mentorId: userId },
      include: {
        teachingField: true,
      },
    });

    return {
      ...profile,
      teachingFields: mentorFields.map((mf) => ({
        id: mf.teachingField.id,
        name: mf.teachingField.name,
        slug: mf.teachingField.slug,
        icon: mf.teachingField.icon,
        color: mf.teachingField.color,
      })),
    };
  }

  /**
   * Create or update mentor profile
   */
  async upsertMentorProfile(
    userId: string,
    data: ICreateMentorProfileDto
  ): Promise<IMentorProfileResponse> {
    const { teachingFieldIds, ...profileData } = data;

    // Check if user exists and update role to MENTOR if needed
    const user = await db.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new Error('User not found');
    }

    // Update user role to MENTOR (if not already)
    if (user.role !== 'MENTOR' && user.role !== 'ADMIN') {
      await db.user.update({
        where: { id: userId },
        data: { role: 'MENTOR' },
      });
    }

    // Create or update mentor profile
    const profile = await db.mentorProfile.upsert({
      where: { userId },
      update: {
        ...profileData,
        updatedAt: new Date(),
        updatedBy: userId,
        version: { increment: 1 },
      },
      create: {
        userId,
        ...profileData,
        createdBy: userId,
        updatedBy: userId,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatarUrl: true,
            bio: true,
          },
        },
      },
    });

    // Update teaching fields
    if (teachingFieldIds && teachingFieldIds.length > 0) {
      // Delete existing
      await db.mentorTeachingField.deleteMany({
        where: { mentorId: userId },
      });

      // Create new
      await db.mentorTeachingField.createMany({
        data: teachingFieldIds.map((fieldId) => ({
          mentorId: userId,
          teachingFieldId: fieldId,
        })),
      });
    }

    // Get teaching fields
    const mentorFields = await db.mentorTeachingField.findMany({
      where: { mentorId: userId },
      include: {
        teachingField: true,
      },
    });

    return {
      ...profile,
      teachingFields: mentorFields.map((mf) => ({
        id: mf.teachingField.id,
        name: mf.teachingField.name,
        slug: mf.teachingField.slug,
        icon: mf.teachingField.icon,
        color: mf.teachingField.color,
      })),
    };
  }

  /**
   * List mentors with filtering
   */
  async listMentors(filter: IMentorFilterDto): Promise<{
    data: IMentorProfileResponse[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const page = filter.page ?? 1;
    const limit = filter.limit ?? 10;
    const skip = (page - 1) * limit;

    const where: Prisma.MentorProfileWhereInput = {
      isDeleted: false,
      ...(filter.isAvailable !== undefined && { isAvailable: filter.isAvailable }),
      ...(filter.isVerified !== undefined && { isVerified: filter.isVerified }),
    };

    // Get mentor IDs with specific teaching field
    if (filter.teachingFieldId) {
      const mentorIdsWithField = await db.mentorTeachingField.findMany({
        where: { teachingFieldId: filter.teachingFieldId },
        select: { mentorId: true },
      });
      const mentorIds = [...new Set(mentorIdsWithField.map((m) => m.mentorId))];
      where.userId = { in: mentorIds };
    }

    // Search by name
    if (filter.search) {
      where.user = {
        OR: [
          { name: { contains: filter.search } },
          { email: { contains: filter.search } },
        ],
      };
    }

    const [profiles, total] = await Promise.all([
      db.mentorProfile.findMany({
        where,
        skip,
        take: limit,
        orderBy: [
          { isVerified: 'desc' },
          { rating: 'desc' },
          { totalSessions: 'desc' },
        ],
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              avatarUrl: true,
              bio: true,
            },
          },
        },
      }),
      db.mentorProfile.count({ where }),
    ]);

    // Get teaching fields for all mentors
    const mentorIds = profiles.map((p) => p.userId);
    const allMentorFields = await db.mentorTeachingField.findMany({
      where: { mentorId: { in: mentorIds } },
      include: {
        teachingField: true,
      },
    });

    const mentorFieldsMap = new Map<string, typeof allMentorFields>();
    allMentorFields.forEach((mf) => {
      const existing = mentorFieldsMap.get(mf.mentorId) || [];
      existing.push(mf);
      mentorFieldsMap.set(mf.mentorId, existing);
    });

    const data = profiles.map((profile) => {
      const mentorFields = mentorFieldsMap.get(profile.userId) || [];
      return {
        ...profile,
        teachingFields: mentorFields.map((mf) => ({
          id: mf.teachingField.id,
          name: mf.teachingField.name,
          slug: mf.teachingField.slug,
          icon: mf.teachingField.icon,
          color: mf.teachingField.color,
        })),
      };
    });

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Get mentor available slots
   */
  async getMentorAvailableSlots(
    mentorId: string,
    fromDate: Date,
    toDate: Date
  ): Promise<Array<{ date: string; slots: string[] }>> {
    const profile = await db.mentorProfile.findUnique({
      where: { userId: mentorId, isDeleted: false },
    });

    if (!profile || !profile.availableHours) {
      return [];
    }

    // Get existing sessions in the date range
    const existingSessions = await db.sessionMentoring.findMany({
      where: {
        mentorId,
        scheduledAt: {
          gte: fromDate,
          lte: toDate,
        },
        status: {
          in: ['SCHEDULED', 'PENDING_PAYMENT'],
        },
        isDeleted: false,
      },
      select: {
        scheduledAt: true,
        duration: true,
      },
    });

    // Parse available hours (simplified - return empty for now)
    // TODO: Implement proper availability calculation
    return [];
  }

  /**
   * Update mentor stats after session
   */
  async updateMentorStats(
    mentorId: string,
    sessionAmount: number
  ): Promise<void> {
    await db.mentorProfile.update({
      where: { userId: mentorId },
      data: {
        totalSessions: { increment: 1 },
        totalEarnings: { increment: sessionAmount },
        updatedAt: new Date(),
        version: { increment: 1 },
      },
    });
  }
}
