import { NextResponse } from 'next/server';
import { getDailyAppStarts } from '@/lib/supabase';

export async function GET() {
  try {
    const data = await getDailyAppStarts(30);
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in daily-starts API:', error);
    return NextResponse.json([], { status: 500 });
  }
}
