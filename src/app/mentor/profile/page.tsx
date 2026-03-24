/**
 * Mentor Profile Page (Server Component)
 * Displays and edits mentor profile
 */

import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { db } from '@/lib/db';
import { MentorProfileForm } from './mentor-profile-form';

export default async function MentorProfilePage() {
  // Check authentication
  const user = await getCurrentUser();

  if (!user) {
    redirect('/login');
  }

  // Get mentor profile data
  const mentorData = await db.user.findUnique({
    where: { id: user.id },
    include: {
      mentorProfile: true,
      mentorFields: {
        include: {
          teachingField: true,
        },
      },
    },
  });

  // Get all teaching fields for the form
  const teachingFields = await db.teachingField.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: 'asc' },
  });

  // Check if user has mentor profile
  const hasMentorProfile = !!mentorData?.mentorProfile;
  const isMentor = user.role === 'MENTOR' || user.role === 'ADMIN';

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">
          {hasMentorProfile ? 'Hồ Sơ Mentor' : 'Trở Thành Mentor'}
        </h1>
        <p className="text-muted-foreground mb-8">
          {hasMentorProfile
            ? 'Cập nhật thông tin hồ sơ mentor của bạn'
            : 'Điền thông tin để bắt đầu hành trình mentor'}
        </p>

        <MentorProfileForm
          user={user}
          mentorProfile={
            mentorData?.mentorProfile
              ? {
                  id: mentorData.mentorProfile.id,
                  title: mentorData.mentorProfile.title,
                  company: mentorData.mentorProfile.company,
                  experienceYears: mentorData.mentorProfile.experienceYears,
                  hourlyRate: mentorData.mentorProfile.hourlyRate,
                  charityAccountNo: mentorData.mentorProfile.charityAccountNo,
                  availableHours: mentorData.mentorProfile.availableHours,
                  isAvailable: mentorData.mentorProfile.isAvailable,
                  rating: mentorData.mentorProfile.rating,
                  totalReviews: mentorData.mentorProfile.totalReviews,
                  totalSessions: mentorData.mentorProfile.totalSessions,
                }
              : null
          }
          bio={mentorData?.bio ?? null}
          existingFieldIds={mentorData?.mentorFields.map((mf) => mf.teachingFieldId) ?? []}
          teachingFields={teachingFields.map((tf) => ({
            id: tf.id,
            name: tf.name,
            slug: tf.slug,
            description: tf.description,
            icon: tf.icon,
            color: tf.color,
          }))}
          isMentor={isMentor}
        />
      </div>
    </div>
  );
}
