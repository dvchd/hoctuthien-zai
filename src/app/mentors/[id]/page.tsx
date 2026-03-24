/**
 * Mentor Detail Page (Server Component)
 * Shows detailed mentor profile with booking option
 */

import { notFound } from 'next/navigation';
import { db } from '@/lib/db';
import { MentorDetailContent } from './mentor-detail-content';

export default async function MentorDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  // Get mentor with full profile
  const mentor = await db.user.findUnique({
    where: {
      id,
      role: { in: ['MENTOR', 'ADMIN'] },
      isDeleted: false,
    },
    include: {
      mentorProfile: true,
      mentorFields: {
        include: {
          teachingField: {
            select: {
              id: true,
              name: true,
              slug: true,
              icon: true,
              color: true,
              description: true,
            },
          },
        },
      },
    },
  });

  if (!mentor || !mentor.mentorProfile) {
    notFound();
  }

  // Get reviews from sessions
  const reviews = await db.sessionMentoring.findMany({
    where: {
      mentorId: id,
      rating: { not: null },
      review: { not: null },
    },
    select: {
      id: true,
      rating: true,
      review: true,
      reviewedAt: true,
      mentee: {
        select: {
          id: true,
          name: true,
          avatarUrl: true,
        },
      },
    },
    orderBy: {
      reviewedAt: 'desc',
    },
    take: 10,
  });

  // Parse available hours
  let availableSlots: { day: string; slots: string[] }[] = [];
  if (mentor.mentorProfile.availableHours) {
    try {
      availableSlots = JSON.parse(mentor.mentorProfile.availableHours);
    } catch {
      // Invalid JSON, return empty
    }
  }

  const mentorDetail = {
    id: mentor.id,
    name: mentor.name,
    email: mentor.email,
    avatarUrl: mentor.avatarUrl,
    bio: mentor.bio,
    title: mentor.mentorProfile.title,
    company: mentor.mentorProfile.company,
    experienceYears: mentor.mentorProfile.experienceYears,
    hourlyRate: mentor.mentorProfile.hourlyRate,
    rating: mentor.mentorProfile.rating,
    totalReviews: mentor.mentorProfile.totalReviews,
    totalSessions: mentor.mentorProfile.totalSessions,
    totalEarnings: mentor.mentorProfile.totalEarnings,
    charityAccountNo: mentor.mentorProfile.charityAccountNo,
    charityAccountName: mentor.mentorProfile.charityAccountName,
    isAvailable: mentor.mentorProfile.isAvailable,
    isVerified: mentor.mentorProfile.isVerified,
    availableSlots,
    teachingFields: mentor.mentorFields.map((mf) => ({
      id: mf.teachingField.id,
      name: mf.teachingField.name,
      slug: mf.teachingField.slug,
      icon: mf.teachingField.icon,
      color: mf.teachingField.color,
      description: mf.teachingField.description,
      experienceLevel: mf.experienceLevel,
      yearsOfExperience: mf.yearsOfExperience,
    })),
    reviews: reviews.map((r) => ({
      id: r.id,
      rating: r.rating,
      review: r.review,
      reviewedAt: r.reviewedAt?.toISOString() ?? null,
      mentee: {
        id: r.mentee.id,
        name: r.mentee.name ?? 'Anonymous',
        avatarUrl: r.mentee.avatarUrl,
      },
    })),
  };

  return <MentorDetailContent mentor={mentorDetail} />;
}
