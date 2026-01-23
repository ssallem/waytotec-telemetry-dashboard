import { NextResponse } from 'next/server';
import { getWeeklyTrend } from '@/lib/supabase';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    const data = await getWeeklyTrend(8);
    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
      },
    });
  } catch (error) {
    console.error('Error in weekly-trend API:', error);
    return NextResponse.json([], { status: 500 });
  }
}
