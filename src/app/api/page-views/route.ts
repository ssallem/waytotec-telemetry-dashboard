import { NextResponse } from 'next/server';
import { getPageViews } from '@/lib/supabase';

export async function GET() {
  try {
    const data = await getPageViews(30);
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in page-views API:', error);
    return NextResponse.json([], { status: 500 });
  }
}
