import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim().replace(/\s+/g, '');

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export async function GET() {
  try {
    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json([]);
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30);

    const { data, error } = await supabase
      .from('telemetry_events')
      .select('timestamp')
      .gte('timestamp', startDate.toISOString());

    if (error) {
      console.error('Error fetching hourly heatmap:', error);
      return NextResponse.json([]);
    }

    // Create heatmap data: [day][hour] = count
    const heatmap: Record<string, Record<number, number>> = {};
    DAYS.forEach(day => {
      heatmap[day] = {};
      for (let h = 0; h < 24; h++) {
        heatmap[day][h] = 0;
      }
    });

    data?.forEach((event) => {
      const date = new Date(event.timestamp);
      // Convert to KST (UTC+9)
      const kstDate = new Date(date.getTime() + 9 * 60 * 60 * 1000);
      const day = DAYS[kstDate.getUTCDay()];
      const hour = kstDate.getUTCHours();
      heatmap[day][hour]++;
    });

    // Convert to array format for visualization
    const result: Array<{ day: string; hour: number; count: number }> = [];
    DAYS.forEach(day => {
      for (let hour = 0; hour < 24; hour++) {
        result.push({ day, hour, count: heatmap[day][hour] });
      }
    });

    return NextResponse.json(result, {
      headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate' },
    });
  } catch (error) {
    console.error('Error in hourly-heatmap API:', error);
    return NextResponse.json([], { status: 500 });
  }
}
