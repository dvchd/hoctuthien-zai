/**
 * Session Use Cases
 */

import { db } from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';

export type SessionStatus = 'PENDING_PAYMENT' | 'SCHEDULED' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW';

export interface ICreateSessionDto {
  mentorId: string;
  title: string;
  description?: string;
  teachingFieldId?: string;
  scheduledAt: Date;
  duration?: number;
}

export interface IUpdateSessionDto {
  title?: string;
  description?: string;
  scheduledAt?: Date;
  duration?: number;
}

export interface ISessionFilterDto {
  mentorId?: string;
  menteeId?: string;
  status?: SessionStatus;
  teachingFieldId?: string;
  fromDate?: Date;
  toDate?: Date;
  page?: number;
  limit?: number;
}

export interface ISessionResponse {
  id: string;
  mentorId: string;
  menteeId: string;
  title: string;
  description: string | null;
  teachingFieldId: string | null;
  scheduledAt: Date;
  duration: number;
  meetingLink: string | null;
  meetingId: string | null;
  amount: number;
  isPaid: boolean;
  paidAt: Date | null;
  paymentCode: string | null;
  status: string;
  mentorNotes: string | null;
  menteeNotes: string | null;
  rating: number | null;
  review: string | null;
  reviewedAt: Date | null;
  createdAt: Date;
  mentor: {
    id: string;
    name: string | null;
    email: string;
    avatarUrl: string | null;
  };
  mentee: {
    id: string;
    name: string | null;
    email: string;
    avatarUrl: string | null;
  };
  teachingField?: {
    id: string;
    name: string;
    slug: string;
  } | null;
}

export class SessionUseCase {
  /**
   * Create a new session (booking)
   */
  async createSession(
    menteeId: string,
    data: ICreateSessionDto
  ): Promise<ISessionResponse> {
    // Check mentor availability
    const mentorProfile = await db.mentorProfile.findUnique({
      where: { userId: data.mentorId, isDeleted: false, isAvailable: true },
      include: {
        user: {
          select: { id: true, name: true, email: true, avatarUrl: true },
        },
      },
    });

    if (!mentorProfile) {
      throw new Error('Mentor not available');
    }

    // Check if mentee is activated
    const mentee = await db.user.findUnique({
      where: { id: menteeId },
      select: { id: true, name: true, email: true, avatarUrl: true, isActivated: true },
    });

    if (!mentee || !mentee.isActivated) {
      throw new Error('Please activate your account first');
    }

    // Check for scheduling conflicts
    const conflictingSession = await db.sessionMentoring.findFirst({
      where: {
        mentorId: data.mentorId,
        scheduledAt: data.scheduledAt,
        status: { in: ['PENDING_PAYMENT', 'SCHEDULED'] },
        isDeleted: false,
      },
    });

    if (conflictingSession) {
      throw new Error('This time slot is already booked');
    }

    // Generate payment code (only letters)
    const paymentCode = this.generatePaymentCode();

    // Calculate amount
    const amount = mentorProfile.hourlyRate || 0;

    // Create session
    const session = await db.sessionMentoring.create({
      data: {
        mentorId: data.mentorId,
        menteeId,
        title: data.title,
        description: data.description,
        teachingFieldId: data.teachingFieldId,
        scheduledAt: data.scheduledAt,
        duration: data.duration || 60,
        amount,
        paymentCode,
        status: 'PENDING_PAYMENT',
        createdBy: menteeId,
        updatedBy: menteeId,
      },
      include: {
        mentor: {
          select: { id: true, name: true, email: true, avatarUrl: true },
        },
        mentee: {
          select: { id: true, name: true, email: true, avatarUrl: true },
        },
      },
    });

    return {
      ...session,
      teachingField: null,
    };
  }

  /**
   * Get session by ID
   */
  async getSession(sessionId: string): Promise<ISessionResponse | null> {
    const session = await db.sessionMentoring.findUnique({
      where: { id: sessionId, isDeleted: false },
      include: {
        mentor: {
          select: { id: true, name: true, email: true, avatarUrl: true },
        },
        mentee: {
          select: { id: true, name: true, email: true, avatarUrl: true },
        },
      },
    });

    if (!session) return null;

    let teachingField = null;
    if (session.teachingFieldId) {
      const field = await db.teachingField.findUnique({
        where: { id: session.teachingFieldId },
      });
      if (field) {
        teachingField = {
          id: field.id,
          name: field.name,
          slug: field.slug,
        };
      }
    }

    return {
      ...session,
      teachingField,
    };
  }

  /**
   * List sessions
   */
  async listSessions(filter: ISessionFilterDto): Promise<{
    data: ISessionResponse[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const page = filter.page ?? 1;
    const limit = filter.limit ?? 10;
    const skip = (page - 1) * limit;

    const where: any = {
      isDeleted: false,
    };

    if (filter.mentorId) where.mentorId = filter.mentorId;
    if (filter.menteeId) where.menteeId = filter.menteeId;
    if (filter.status) where.status = filter.status;
    if (filter.teachingFieldId) where.teachingFieldId = filter.teachingFieldId;

    if (filter.fromDate || filter.toDate) {
      where.scheduledAt = {};
      if (filter.fromDate) where.scheduledAt.gte = filter.fromDate;
      if (filter.toDate) where.scheduledAt.lte = filter.toDate;
    }

    const [sessions, total] = await Promise.all([
      db.sessionMentoring.findMany({
        where,
        skip,
        take: limit,
        orderBy: { scheduledAt: 'desc' },
        include: {
          mentor: {
            select: { id: true, name: true, email: true, avatarUrl: true },
          },
          mentee: {
            select: { id: true, name: true, email: true, avatarUrl: true },
          },
        },
      }),
      db.sessionMentoring.count({ where }),
    ]);

    const data = sessions.map((session) => ({
      ...session,
      teachingField: null,
    }));

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Update session status
   */
  async updateSessionStatus(
    sessionId: string,
    status: SessionStatus,
    userId: string
  ): Promise<ISessionResponse> {
    const session = await db.sessionMentoring.update({
      where: { id: sessionId },
      data: {
        status,
        updatedAt: new Date(),
        updatedBy: userId,
        version: { increment: 1 },
      },
      include: {
        mentor: {
          select: { id: true, name: true, email: true, avatarUrl: true },
        },
        mentee: {
          select: { id: true, name: true, email: true, avatarUrl: true },
        },
      },
    });

    return {
      ...session,
      teachingField: null,
    };
  }

  /**
   * Cancel session
   */
  async cancelSession(sessionId: string, userId: string): Promise<ISessionResponse> {
    const session = await this.getSession(sessionId);

    if (!session) {
      throw new Error('Session not found');
    }

    // Check if user is mentor or mentee of this session
    if (session.mentorId !== userId && session.menteeId !== userId) {
      throw new Error('Unauthorized');
    }

    // Can only cancel if not completed
    if (session.status === 'COMPLETED') {
      throw new Error('Cannot cancel completed session');
    }

    return this.updateSessionStatus(sessionId, 'CANCELLED', userId);
  }

  /**
   * Complete session and add review
   */
  async completeSession(
    sessionId: string,
    userId: string,
    rating: number,
    review?: string
  ): Promise<ISessionResponse> {
    const session = await this.getSession(sessionId);

    if (!session) {
      throw new Error('Session not found');
    }

    if (session.menteeId !== userId) {
      throw new Error('Only mentee can complete session');
    }

    if (!session.isPaid) {
      throw new Error('Please complete payment first');
    }

    const updatedSession = await db.sessionMentoring.update({
      where: { id: sessionId },
      data: {
        status: 'COMPLETED',
        rating,
        review,
        reviewedAt: new Date(),
        updatedAt: new Date(),
        updatedBy: userId,
        version: { increment: 1 },
      },
      include: {
        mentor: {
          select: { id: true, name: true, email: true, avatarUrl: true },
        },
        mentee: {
          select: { id: true, name: true, email: true, avatarUrl: true },
        },
      },
    });

    // Update mentor stats
    if (rating) {
      const mentorSessions = await db.sessionMentoring.findMany({
        where: {
          mentorId: session.mentorId,
          status: 'COMPLETED',
          rating: { not: null },
        },
        select: { rating: true },
      });

      const totalReviews = mentorSessions.length;
      const avgRating =
        mentorSessions.reduce((sum, s) => sum + (s.rating || 0), 0) / totalReviews;

      await db.mentorProfile.update({
        where: { userId: session.mentorId },
        data: {
          rating: avgRating,
          totalReviews,
          totalSessions: { increment: 1 },
        },
      });
    }

    // Update mentee stats
    await db.menteeProfile.updateMany({
      where: { userId },
      data: {
        totalSessions: { increment: 1 },
      },
    });

    return {
      ...updatedSession,
      teachingField: null,
    };
  }

  /**
   * Generate payment code (letters only)
   */
  private generatePaymentCode(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let code = '';
    for (let i = 0; i < 8; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return `HOCPHI${code}`;
  }

  /**
   * Generate Google Meet link (placeholder)
   */
  async generateMeetingLink(sessionId: string): Promise<string> {
    // In production, integrate with Google Calendar API
    const meetId = uuidv4().replace(/-/g, '').substring(0, 12);
    return `https://meet.google.com/${meetId}`;
  }
}
