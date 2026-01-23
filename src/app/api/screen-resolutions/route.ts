import { NextResponse } from 'next/server';
import { getScreenResolutions } from '@/lib/supabase';

export async function GET() {
  try {
    const data = await getScreenResolutions(30);
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in screen-resolutions API:', error);
    return NextResponse.json([], { status: 500 });
  }
}
