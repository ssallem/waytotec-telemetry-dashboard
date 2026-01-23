import { NextResponse } from 'next/server';
import { getWeeklyTrend } from '@/lib/supabase';

export async function GET() {
  try {
    const data = await getWeeklyTrend(8);
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in weekly-trend API:', error);
    return NextResponse.json([], { status: 500 });
  }
}
