'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';

// Leaflet CSS
import 'leaflet/dist/leaflet.css';

interface IpLocation {
  ip: string;
  lat: number;
  lon: number;
  city: string;
  regionName: string;
  count: number;
}

interface KoreaMapProps {
  className?: string;
}

// 동적 import로 SSR 비활성화
const MapContainer = dynamic(
  () => import('react-leaflet').then((mod) => mod.MapContainer),
  { ssr: false }
);

const TileLayer = dynamic(
  () => import('react-leaflet').then((mod) => mod.TileLayer),
  { ssr: false }
);

const CircleMarker = dynamic(
  () => import('react-leaflet').then((mod) => mod.CircleMarker),
  { ssr: false }
);

const Popup = dynamic(
  () => import('react-leaflet').then((mod) => mod.Popup),
  { ssr: false }
);

export function KoreaMap({ className = '' }: KoreaMapProps) {
  const [locations, setLocations] = useState<IpLocation[]>([]);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    async function fetchLocations() {
      try {
        const res = await fetch('/api/ip-locations');
        if (res.ok) {
          const data = await res.json();
          setLocations(data);
        }
      } catch (error) {
        console.error('Error fetching locations:', error);
      } finally {
        setLoading(false);
      }
    }

    if (mounted) {
      fetchLocations();
    }
  }, [mounted]);

  // 지역별 집계
  const regionCounts = locations.reduce((acc, loc) => {
    const key = loc.regionName;
    acc[key] = (acc[key] || 0) + loc.count;
    return acc;
  }, {} as Record<string, number>);

  const totalCount = Object.values(regionCounts).reduce((a, b) => a + b, 0);

  if (!mounted) {
    return (
      <div className={`h-[400px] bg-gray-100 dark:bg-gray-800 rounded-xl animate-pulse ${className}`} />
    );
  }

  return (
    <div className={className}>
      <div className="relative h-[400px] rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700">
        {loading ? (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-800">
            <div className="flex items-center gap-2 text-gray-500">
              <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <span>지도 로딩 중...</span>
            </div>
          </div>
        ) : (
          <MapContainer
            center={[36.5, 127.5]}
            zoom={7}
            style={{ height: '100%', width: '100%' }}
            scrollWheelZoom={true}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {locations.map((loc, index) => (
              <CircleMarker
                key={`${loc.ip}-${index}`}
                center={[loc.lat, loc.lon]}
                radius={Math.min(Math.max(loc.count * 2, 8), 30)}
                pathOptions={{
                  color: '#3b82f6',
                  fillColor: '#3b82f6',
                  fillOpacity: 0.6,
                  weight: 2,
                }}
              >
                <Popup>
                  <div className="text-sm">
                    <p className="font-semibold">{loc.regionName} {loc.city}</p>
                    <p className="text-gray-600">접속 횟수: {loc.count}회</p>
                  </div>
                </Popup>
              </CircleMarker>
            ))}
          </MapContainer>
        )}
      </div>

      {/* 지역별 통계 */}
      {!loading && Object.keys(regionCounts).length > 0 && (
        <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-2">
          {Object.entries(regionCounts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 6)
            .map(([region, count]) => (
              <div
                key={region}
                className="flex items-center justify-between p-2 rounded-lg bg-gray-50 dark:bg-gray-800/50"
              >
                <span className="text-sm text-gray-700 dark:text-gray-300 truncate">
                  {region}
                </span>
                <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                  {count}
                </span>
              </div>
            ))}
        </div>
      )}

      {!loading && locations.length === 0 && (
        <div className="mt-4 text-center text-sm text-gray-500 dark:text-gray-400">
          위치 데이터가 없습니다
        </div>
      )}
    </div>
  );
}
