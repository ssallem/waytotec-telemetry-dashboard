import { NextResponse } from 'next/server';
import { getOsDistribution } from '@/lib/supabase';

export async function GET() {
  try {
    const data = await getOsDistribution(30);
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in os-distribution API:', error);
    return NextResponse.json([], { status: 500 });
  }
}
