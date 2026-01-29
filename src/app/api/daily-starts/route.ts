import { NextRequest, NextResponse } from 'next/server';
import { getDailyAppStarts } from '@/lib/supabase';

// 캐싱 비활성화
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const days = parseInt(searchParams.get('days') || '30', 10);
    const offset = parseInt(searchParams.get('offset') || '0', 10);
    const validDays = [7, 30, 90].includes(days) ? days : 30;

    const data = await getDailyAppStarts(validDays, offset);
    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
      },
    });
  } catch (error) {
    console.error('Error in daily-starts API:', error);
    return NextResponse.json([], { status: 500 });
  }
}
