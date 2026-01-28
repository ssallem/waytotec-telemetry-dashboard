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
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30);

    const { data, error } = await supabase
      .from('telemetry_events')
      .select('app_version, device_id')
      .eq('event_name', 'app_start')
      .gte('timestamp', startDate.toISOString());

    if (error) {
      console.error('Error fetching version distribution:', error);
      return NextResponse.json([]);
    }

    // Get latest version per device
    const deviceVersions: Record<string, string> = {};
    data?.forEach((event) => {
      if (event.app_version) {
        deviceVersions[event.device_id] = event.app_version;
      }
    });

    // Count versions
    const versionCounts: Record<string, number> = {};
    Object.values(deviceVersions).forEach((version) => {
      versionCounts[version] = (versionCounts[version] || 0) + 1;
    });

    const result = Object.entries(versionCounts)
      .map(([version, count]) => ({ version, count }))
      .sort((a, b) => {
        // Sort by version number descending
        const aVersion = a.version.split('.').map(Number);
        const bVersion = b.version.split('.').map(Number);
        for (let i = 0; i < Math.max(aVersion.length, bVersion.length); i++) {
          const diff = (bVersion[i] || 0) - (aVersion[i] || 0);
          if (diff !== 0) return diff;
        }
        return 0;
      });

    return NextResponse.json(result, {
      headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate' },
    });
  } catch (error) {
    console.error('Error in version-distribution API:', error);
    return NextResponse.json([], { status: 500 });
  }
}
