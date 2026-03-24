/**
 * Mentors API Route
 * GET: List mentors with filtering
 * POST: Create/update mentor profile
 */

import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const teachingFieldId = searchParams.get('teachingFieldId') || undefined;
    const isAvailable = searchParams.get('isAvailable');
    const search = searchParams.get('search') || undefined;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {
      isDeleted: false,
    };

    if (isAvailable !== null && isAvailable !== undefined) {
      where.isAvailable = isAvailable === 'true';
    }

    // Filter by teaching field
    if (teachingFieldId) {
      const mentorIdsWithField = await db.mentorTeachingField.findMany({
        where: { teachingFieldId },
        select: { mentorId: true },
      });
      const mentorIds = [...new Set(mentorIdsWithField.map((m) => m.mentorId))];
      where.userId = { in: mentorIds };
    }

    // Search by name
    if (search) {
      const usersWithName = await db.user.findMany({
        where: {
          OR: [
            { name: { contains: search } },
            { email: { contains: search } },
          ],
        },
        select: { id: true },
      });
      const userIds = usersWithName.map((u) => u.id);
      if (where.userId) {
        where.userId = { in: (where.userId as { in: string[] }).in.filter((id) => userIds.includes(id)) };
      } else {
        where.userId = { in: userIds };
      }
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
        id: profile.id,
        userId: profile.userId,
        title: profile.title,
        company: profile.company,
        experienceYears: profile.experienceYears,
        hourlyRate: profile.hourlyRate,
        rating: profile.rating,
        totalReviews: profile.totalReviews,
        totalSessions: profile.totalSessions,
        charityAccountNo: profile.charityAccountNo,
        charityAccountName: profile.charityAccountName,
        isAvailable: profile.isAvailable,
        isVerified: profile.isVerified,
        teachingFields: mentorFields.map((mf) => ({
          id: mf.teachingField.id,
          name: mf.teachingField.name,
          slug: mf.teachingField.slug,
          icon: mf.teachingField.icon,
          color: mf.teachingField.color,
        })),
        user: profile.user,
      };
    });

    return NextResponse.json({
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error('Error listing mentors:', error);
    return NextResponse.json(
      { error: 'Failed to list mentors' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      title,
      company,
      experienceYears,
      hourlyRate,
      charityAccountNo,
      charityAccountName,
      teachingFieldIds,
      availableHours,
    } = body;

    // Update user role to MENTOR if not already
    const currentUser = await db.user.findUnique({
      where: { id: user.id },
    });

    if (currentUser && currentUser.role === 'MENTEE') {
      await db.user.update({
        where: { id: user.id },
        data: { role: 'MENTOR' },
      });
    }

    // Create or update mentor profile
    const profile = await db.mentorProfile.upsert({
      where: { userId: user.id },
      update: {
        title,
        company,
        experienceYears,
        hourlyRate,
        charityAccountNo,
        charityAccountName,
        availableHours,
        updatedAt: new Date(),
        updatedBy: user.id,
        version: { increment: 1 },
      },
      create: {
        userId: user.id,
        title,
        company,
        experienceYears,
        hourlyRate,
        charityAccountNo,
        charityAccountName,
        availableHours,
        createdBy: user.id,
        updatedBy: user.id,
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
        where: { mentorId: user.id },
      });

      // Create new
      await db.mentorTeachingField.createMany({
        data: teachingFieldIds.map((fieldId: string) => ({
          mentorId: user.id,
          teachingFieldId: fieldId,
        })),
      });
    }

    // Get teaching fields
    const mentorFields = await db.mentorTeachingField.findMany({
      where: { mentorId: user.id },
      include: {
        teachingField: true,
      },
    });

    return NextResponse.json({
      ...profile,
      teachingFields: mentorFields.map((mf) => ({
        id: mf.teachingField.id,
        name: mf.teachingField.name,
        slug: mf.teachingField.slug,
        icon: mf.teachingField.icon,
        color: mf.teachingField.color,
      })),
    });
  } catch (error) {
    console.error('Error creating mentor profile:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create mentor profile' },
      { status: 500 }
    );
  }
}
