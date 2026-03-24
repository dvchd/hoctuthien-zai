import { getCurrentUser } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { MentorsClient } from './mentors-client';
import { db } from '@/lib/db';

export default async function MentorsPage({
  searchParams,
}: {
  searchParams: Promise<{ field?: string; search?: string }>;
}) {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/login?callbackUrl=/mentors');
  }

  // Await searchParams (Next.js 15+ requirement)
  const params = await searchParams;

  // Get teaching fields for filter
  const teachingFields = await db.teachingField.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: 'asc' },
  });

  return (
    <MentorsClient
      user={user}
      teachingFields={teachingFields}
      initialFieldId={params.field}
      initialSearch={params.search}
    />
  );
}
