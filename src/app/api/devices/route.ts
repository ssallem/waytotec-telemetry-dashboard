import { NextResponse } from 'next/server';
import { getDeviceStats } from '@/lib/supabase';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    const data = await getDeviceStats(30);
    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
      },
    });
  } catch (error) {
    console.error('Error in devices API:', error);
    return NextResponse.json([], { status: 500 });
  }
}
