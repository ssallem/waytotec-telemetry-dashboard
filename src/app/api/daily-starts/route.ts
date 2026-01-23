import { NextResponse } from 'next/server';
import { getDailyAppStarts } from '@/lib/supabase';

// 캐싱 비활성화
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    const data = await getDailyAppStarts(30);
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
