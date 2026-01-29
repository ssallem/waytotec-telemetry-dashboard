import { NextRequest, NextResponse } from 'next/server';
import { getWeeklyTrend } from '@/lib/supabase';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const days = parseInt(searchParams.get('days') || '30', 10);
    // 날짜 범위에 따른 주 수 계산
    const weeks = Math.ceil(days / 7);

    const data = await getWeeklyTrend(weeks);
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
