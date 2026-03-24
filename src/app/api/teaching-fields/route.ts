/**
 * Teaching Fields API Route
 */

import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const fields = await db.teachingField.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
    });

    return NextResponse.json(fields);
  } catch (error) {
    console.error('Error getting teaching fields:', error);
    return NextResponse.json(
      { error: 'Failed to get teaching fields' },
      { status: 500 }
    );
  }
}
