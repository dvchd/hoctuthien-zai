/**
 * Mentor Detail API Route
 */

import { NextRequest, NextResponse } from 'next/server';
import { MentorUseCase } from '@/application';

const mentorUseCase = new MentorUseCase();

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const profile = await mentorUseCase.getMentorProfile(id);

    if (!profile) {
      return NextResponse.json({ error: 'Mentor not found' }, { status: 404 });
    }

    return NextResponse.json(profile);
  } catch (error) {
    console.error('Error getting mentor:', error);
    return NextResponse.json(
      { error: 'Failed to get mentor' },
      { status: 500 }
    );
  }
}
