import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim().replace(/\s+/g, '');

export async function GET() {
  try {
    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json([]);
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { data, error } = await supabase
      .from('telemetry_events')
      .select('event_name, device_id, machine_name, timestamp, properties, app_version')
      .order('timestamp', { ascending: false })
      .limit(50);

    if (error) {
      console.error('Error fetching recent activity:', error);
      return NextResponse.json([]);
    }

    const result = data?.map((event) => ({
      event_name: event.event_name,
      device_id: event.device_id,
      machine_name: event.machine_name || 'Unknown',
      timestamp: event.timestamp,
      feature_name: event.properties?.feature_name || event.properties?.page_name || null,
      app_version: event.app_version,
    })) || [];

    return NextResponse.json(result, {
      headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate' },
    });
  } catch (error) {
    console.error('Error in recent-activity API:', error);
    return NextResponse.json([], { status: 500 });
  }
}
