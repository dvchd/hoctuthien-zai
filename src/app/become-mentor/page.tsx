/**
 * Become a Mentor Page
 * Landing page for users who want to become mentors
 */

import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { BecomeMentorContent } from './become-mentor-content';

export default async function BecomeMentorPage() {
  // Check authentication
  const user = await getCurrentUser();

  if (!user) {
    redirect('/login');
  }

  // If already mentor, redirect to profile page
  if (user.role === 'MENTOR' || user.role === 'ADMIN') {
    redirect('/mentor/profile');
  }

  return <BecomeMentorContent user={user} />;
}
