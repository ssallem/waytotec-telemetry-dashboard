import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim().replace(/\s+/g, '');

// Culture code to display name mapping
const CULTURE_NAMES: Record<string, string> = {
  'ko-KR': '한국어 (Korea)',
  'en-US': 'English (US)',
  'en-GB': 'English (UK)',
  'ja-JP': '日本語 (Japan)',
  'zh-CN': '中文 (China)',
  'zh-TW': '中文 (Taiwan)',
  'de-DE': 'Deutsch',
  'fr-FR': 'Français',
  'es-ES': 'Español',
};

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
      .select('culture, device_id')
      .eq('event_name', 'app_start')
      .gte('timestamp', startDate.toISOString());

    if (error) {
      console.error('Error fetching culture distribution:', error);
      return NextResponse.json([]);
    }

    // Get latest culture per device
    const deviceCultures: Record<string, string> = {};
    data?.forEach((event) => {
      if (event.culture) {
        deviceCultures[event.device_id] = event.culture;
      }
    });

    // Count cultures
    const cultureCounts: Record<string, number> = {};
    Object.values(deviceCultures).forEach((culture) => {
      cultureCounts[culture] = (cultureCounts[culture] || 0) + 1;
    });

    const result = Object.entries(cultureCounts)
      .map(([culture, count]) => ({
        culture,
        displayName: CULTURE_NAMES[culture] || culture,
        count,
      }))
      .sort((a, b) => b.count - a.count);

    return NextResponse.json(result, {
      headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate' },
    });
  } catch (error) {
    console.error('Error in culture-distribution API:', error);
    return NextResponse.json([], { status: 500 });
  }
}
