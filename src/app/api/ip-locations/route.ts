import { NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface IpLocation {
  ip: string;
  lat: number;
  lon: number;
  city: string;
  regionName: string;
  count: number;
}

export async function GET() {
  try {
    const client = getSupabase();
    if (!client) {
      return NextResponse.json([], { status: 500 });
    }

    // 최근 30일간의 IP 주소 목록 가져오기
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30);

    const { data, error } = await client
      .from('telemetry_events')
      .select('ip_address')
      .gte('timestamp', startDate.toISOString())
      .not('ip_address', 'is', null);

    if (error) {
      console.error('Error fetching IP addresses:', error);
      return NextResponse.json([], { status: 500 });
    }

    // IP 주소별 카운트
    const ipCounts: Record<string, number> = {};
    data?.forEach((event) => {
      if (event.ip_address) {
        ipCounts[event.ip_address] = (ipCounts[event.ip_address] || 0) + 1;
      }
    });

    // 고유 IP 주소 목록 (최대 100개)
    const uniqueIps = Object.keys(ipCounts).slice(0, 100);

    if (uniqueIps.length === 0) {
      return NextResponse.json([]);
    }

    // ip-api.com 배치 API 사용 (무료, 최대 100개)
    const response = await fetch('http://ip-api.com/batch?fields=status,city,regionName,lat,lon,query', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(uniqueIps),
    });

    if (!response.ok) {
      console.error('IP API error:', response.status);
      return NextResponse.json([], { status: 500 });
    }

    const ipData = await response.json();

    // 결과 매핑
    const locations: IpLocation[] = ipData
      .filter((item: any) => item.status === 'success')
      .map((item: any) => ({
        ip: item.query,
        lat: item.lat,
        lon: item.lon,
        city: item.city || '알 수 없음',
        regionName: item.regionName || '알 수 없음',
        count: ipCounts[item.query] || 1,
      }));

    return NextResponse.json(locations, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
      },
    });
  } catch (error) {
    console.error('Error in ip-locations API:', error);
    return NextResponse.json([], { status: 500 });
  }
}
