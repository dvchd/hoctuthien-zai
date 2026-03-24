/**
 * Mentor Profile API Route
 * GET: Get current mentor's profile
 * POST: Create/update mentor profile
 */

import { NextRequest, NextResponse } from 'next/server';
import { getAuthSession } from '@/lib/auth';
import { db } from '@/lib/db';
import { UserRole } from '@prisma/client';

interface MentorProfileRequestBody {
  title?: string;
  company?: string;
  experienceYears?: number;
  hourlyRate?: number;
  bio?: string;
  teachingFieldIds?: string[];
  charityAccountNo?: string;
  availableHours?: string;
}

/**
 * GET /api/mentor/profile
 * Get current mentor's profile
 */
export async function GET() {
  try {
    const session = await getAuthSession();

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const userId = session.user.id;

    // Get user with mentor profile and teaching fields
    const user = await db.user.findUnique({
      where: { id: userId },
      include: {
        mentorProfile: true,
        mentorFields: {
          include: {
            teachingField: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    // Check if user is a mentor
    const isMentor = user.role === 'MENTOR' || user.role === 'ADMIN';

    return NextResponse.json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          avatarUrl: user.avatarUrl,
          role: user.role,
          isMentor,
        },
        mentorProfile: user.mentorProfile
          ? {
              id: user.mentorProfile.id,
              title: user.mentorProfile.title,
              company: user.mentorProfile.company,
              experienceYears: user.mentorProfile.experienceYears,
              hourlyRate: user.mentorProfile.hourlyRate,
              bio: user.bio,
              rating: user.mentorProfile.rating,
              totalReviews: user.mentorProfile.totalReviews,
              totalSessions: user.mentorProfile.totalSessions,
              charityAccountNo: user.mentorProfile.charityAccountNo,
              charityAccountName: user.mentorProfile.charityAccountName,
              availableHours: user.mentorProfile.availableHours,
              isAvailable: user.mentorProfile.isAvailable,
              isVerified: user.mentorProfile.isVerified,
            }
          : null,
        teachingFields: user.mentorFields.map((mf) => ({
          id: mf.teachingField.id,
          name: mf.teachingField.name,
          slug: mf.teachingField.slug,
          icon: mf.teachingField.icon,
          color: mf.teachingField.color,
          experienceLevel: mf.experienceLevel,
          yearsOfExperience: mf.yearsOfExperience,
        })),
      },
    });
  } catch (error) {
    console.error('[Mentor Profile API] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/mentor/profile
 * Create or update mentor profile
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getAuthSession();

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const userId = session.user.id;
    const body: MentorProfileRequestBody = await request.json();

    const {
      title,
      company,
      experienceYears,
      hourlyRate,
      bio,
      teachingFieldIds,
      charityAccountNo,
      availableHours,
    } = body;

    // Get current user
    const user = await db.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    // Update user role to MENTOR if not already
    const shouldBeMentor = user.role === 'MENTOR' || user.role === 'ADMIN';
    
    // Use transaction to update profile
    const result = await db.$transaction(async (tx) => {
      // Update user bio and role if needed
      const updatedUser = await tx.user.update({
        where: { id: userId },
        data: {
          bio: bio ?? user.bio,
          ...(shouldBeMentor ? {} : { role: UserRole.MENTOR }),
        },
      });

      // Create or update mentor profile
      const mentorProfile = await tx.mentorProfile.upsert({
        where: { userId },
        create: {
          userId,
          title: title ?? null,
          company: company ?? null,
          experienceYears: experienceYears ?? 0,
          hourlyRate: hourlyRate ?? 0,
          charityAccountNo: charityAccountNo ?? null,
          availableHours: availableHours ?? null,
        },
        update: {
          title: title ?? null,
          company: company ?? null,
          experienceYears: experienceYears ?? 0,
          hourlyRate: hourlyRate ?? 0,
          charityAccountNo: charityAccountNo ?? null,
          availableHours: availableHours ?? null,
        },
      });

      // Update teaching fields if provided
      if (teachingFieldIds && teachingFieldIds.length > 0) {
        // Delete existing teaching fields
        await tx.mentorTeachingField.deleteMany({
          where: { mentorId: userId },
        });

        // Create new teaching fields
        await tx.mentorTeachingField.createMany({
          data: teachingFieldIds.map((fieldId) => ({
            mentorId: userId,
            teachingFieldId: fieldId,
          })),
        });
      }

      return { user: updatedUser, mentorProfile };
    });

    return NextResponse.json({
      success: true,
      message: 'Mentor profile saved successfully',
      data: result,
    });
  } catch (error) {
    console.error('[Mentor Profile API] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500 }
    );
  }
}
