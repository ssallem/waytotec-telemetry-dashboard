import { createClient, SupabaseClient } from '@supabase/supabase-js';

// TODO: 실제 Supabase 프로젝트 설정 후 환경 변수로 교체
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Supabase 클라이언트 (환경 변수가 설정된 경우에만 생성)
let supabase: SupabaseClient | null = null;

function getSupabase(): SupabaseClient | null {
  if (supabase) return supabase;

  if (supabaseUrl && supabaseServiceKey &&
      supabaseUrl.startsWith('http') && supabaseServiceKey.length > 10) {
    supabase = createClient(supabaseUrl, supabaseServiceKey);
    return supabase;
  }

  return null;
}

export interface TelemetryEvent {
  id: string;
  event_name: string;
  session_id: string;
  device_id: string;
  timestamp: string;
  properties: Record<string, string>;
  os_version: string | null;
  app_version: string | null;
  screen_width: number | null;
  screen_height: number | null;
  culture: string | null;
  created_at: string;
}

// 일별 앱 시작 횟수 조회
export async function getDailyAppStarts(days: number = 30) {
  const client = getSupabase();
  if (!client) return [];

  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const { data, error } = await client
    .from('telemetry_events')
    .select('timestamp')
    .eq('event_name', 'app_start')
    .gte('timestamp', startDate.toISOString())
    .order('timestamp', { ascending: true });

  if (error) {
    console.error('Error fetching daily app starts:', error);
    return [];
  }

  // 일별 집계
  const dailyCounts: Record<string, number> = {};
  data?.forEach((event) => {
    const date = new Date(event.timestamp).toISOString().split('T')[0];
    dailyCounts[date] = (dailyCounts[date] || 0) + 1;
  });

  return Object.entries(dailyCounts).map(([date, count]) => ({
    date,
    count,
  }));
}

// 기능별 사용 빈도 조회
export async function getFeatureUsage(days: number = 30) {
  const client = getSupabase();
  if (!client) return [];

  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const { data, error } = await client
    .from('telemetry_events')
    .select('properties')
    .eq('event_name', 'feature_use')
    .gte('timestamp', startDate.toISOString());

  if (error) {
    console.error('Error fetching feature usage:', error);
    return [];
  }

  // 기능별 집계
  const featureCounts: Record<string, number> = {};
  data?.forEach((event) => {
    const featureName = event.properties?.feature_name || 'unknown';
    featureCounts[featureName] = (featureCounts[featureName] || 0) + 1;
  });

  return Object.entries(featureCounts)
    .map(([feature, count]) => ({ feature, count }))
    .sort((a, b) => b.count - a.count);
}

// 페이지 뷰 집계
export async function getPageViews(days: number = 30) {
  const client = getSupabase();
  if (!client) return [];

  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const { data, error } = await client
    .from('telemetry_events')
    .select('properties')
    .eq('event_name', 'page_view')
    .gte('timestamp', startDate.toISOString());

  if (error) {
    console.error('Error fetching page views:', error);
    return [];
  }

  const pageCounts: Record<string, number> = {};
  data?.forEach((event) => {
    const pageName = event.properties?.page_name || 'unknown';
    pageCounts[pageName] = (pageCounts[pageName] || 0) + 1;
  });

  return Object.entries(pageCounts)
    .map(([page, count]) => ({ page, count }))
    .sort((a, b) => b.count - a.count);
}

// OS 분포 조회
export async function getOsDistribution(days: number = 30) {
  const client = getSupabase();
  if (!client) return [];

  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const { data, error } = await client
    .from('telemetry_events')
    .select('os_version, device_id')
    .eq('event_name', 'app_start')
    .gte('timestamp', startDate.toISOString());

  if (error) {
    console.error('Error fetching OS distribution:', error);
    return [];
  }

  // 디바이스별 최신 OS 버전만 집계
  const deviceOs: Record<string, string> = {};
  data?.forEach((event) => {
    if (event.os_version) {
      deviceOs[event.device_id] = event.os_version;
    }
  });

  const osCounts: Record<string, number> = {};
  Object.values(deviceOs).forEach((os) => {
    // OS 버전 단순화 (예: "Microsoft Windows NT 10.0.19045.0" -> "Windows 10")
    const simplifiedOs = simplifyOsVersion(os);
    osCounts[simplifiedOs] = (osCounts[simplifiedOs] || 0) + 1;
  });

  return Object.entries(osCounts)
    .map(([os, count]) => ({ os, count }))
    .sort((a, b) => b.count - a.count);
}

// 화면 해상도 분포 조회
export async function getScreenResolutions(days: number = 30) {
  const client = getSupabase();
  if (!client) return [];

  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const { data, error } = await client
    .from('telemetry_events')
    .select('screen_width, screen_height, device_id')
    .eq('event_name', 'app_start')
    .gte('timestamp', startDate.toISOString());

  if (error) {
    console.error('Error fetching screen resolutions:', error);
    return [];
  }

  // 디바이스별 해상도 집계
  const deviceResolutions: Record<string, string> = {};
  data?.forEach((event) => {
    if (event.screen_width && event.screen_height) {
      deviceResolutions[event.device_id] = `${event.screen_width}x${event.screen_height}`;
    }
  });

  const resolutionCounts: Record<string, number> = {};
  Object.values(deviceResolutions).forEach((resolution) => {
    resolutionCounts[resolution] = (resolutionCounts[resolution] || 0) + 1;
  });

  return Object.entries(resolutionCounts)
    .map(([resolution, count]) => ({ resolution, count }))
    .sort((a, b) => b.count - a.count);
}

// 주간 사용 추이
export async function getWeeklyTrend(weeks: number = 8) {
  const client = getSupabase();
  if (!client) return [];

  const startDate = new Date();
  startDate.setDate(startDate.getDate() - weeks * 7);

  const { data, error } = await client
    .from('telemetry_events')
    .select('timestamp, device_id')
    .eq('event_name', 'app_start')
    .gte('timestamp', startDate.toISOString());

  if (error) {
    console.error('Error fetching weekly trend:', error);
    return [];
  }

  // 주차별 유니크 디바이스 수 집계
  const weeklyUsers: Record<string, Set<string>> = {};
  data?.forEach((event) => {
    const date = new Date(event.timestamp);
    const weekStart = getWeekStart(date);
    const weekKey = weekStart.toISOString().split('T')[0];

    if (!weeklyUsers[weekKey]) {
      weeklyUsers[weekKey] = new Set();
    }
    weeklyUsers[weekKey].add(event.device_id);
  });

  return Object.entries(weeklyUsers)
    .map(([week, users]) => ({
      week,
      users: users.size,
      sessions: data?.filter(e => getWeekStart(new Date(e.timestamp)).toISOString().split('T')[0] === week).length || 0,
    }))
    .sort((a, b) => a.week.localeCompare(b.week));
}

// 헬퍼 함수
function simplifyOsVersion(os: string): string {
  if (os.includes('Windows NT 10.0')) {
    return 'Windows 10/11';
  } else if (os.includes('Windows NT 6.3')) {
    return 'Windows 8.1';
  } else if (os.includes('Windows NT 6.2')) {
    return 'Windows 8';
  } else if (os.includes('Windows NT 6.1')) {
    return 'Windows 7';
  }
  return os;
}

function getWeekStart(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
}
