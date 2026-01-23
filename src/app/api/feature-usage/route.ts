import { NextResponse } from 'next/server';
import { getFeatureUsage } from '@/lib/supabase';

export async function GET() {
  try {
    const data = await getFeatureUsage(30);
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in feature-usage API:', error);
    return NextResponse.json([], { status: 500 });
  }
}
