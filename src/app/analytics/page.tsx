'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/Card';
import { ChartSkeleton } from '@/components/Skeleton';
import { HeroSection } from '@/components/HeroSection';
import dynamic from 'next/dynamic';

// 지도 컴포넌트 동적 import (SSR 비활성화)
const KoreaMap = dynamic(() => import('@/components/KoreaMap').then(mod => mod.KoreaMap), {
  ssr: false,
  loading: () => <div className="h-[400px] bg-gray-100 dark:bg-gray-800 rounded-xl animate-pulse" />,
});
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie,
} from 'recharts';

interface VersionData {
  version: string;
  count: number;
}

interface HeatmapData {
  day: string;
  hour: number;
  count: number;
}

interface ActivityData {
  event_name: string;
  device_id: string;
  machine_name: string;
  timestamp: string;
  feature_name: string | null;
  app_version: string;
}

interface CultureData {
  culture: string;
  displayName: string;
  count: number;
}

const CHART_COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#06b6d4', '#ef4444'];
const DAYS_ORDER = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const EVENT_ICONS: Record<string, string> = {
  'app_start': '🚀',
  'feature_use': '⚡',
  'page_view': '📄',
  'error': '❌',
};

const EVENT_COLORS: Record<string, string> = {
  'app_start': 'bg-blue-500',
  'feature_use': 'bg-purple-500',
  'page_view': 'bg-green-500',
  'error': 'bg-red-500',
};

export default function AnalyticsPage() {
  const [versionData, setVersionData] = useState<VersionData[]>([]);
  const [heatmapData, setHeatmapData] = useState<HeatmapData[]>([]);
  const [activityData, setActivityData] = useState<ActivityData[]>([]);
  const [cultureData, setCultureData] = useState<CultureData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [versionRes, heatmapRes, activityRes, cultureRes] = await Promise.all([
          fetch('/api/version-distribution'),
          fetch('/api/hourly-heatmap'),
          fetch('/api/recent-activity'),
          fetch('/api/culture-distribution'),
        ]);

        if (versionRes.ok) setVersionData(await versionRes.json());
        if (heatmapRes.ok) setHeatmapData(await heatmapRes.json());
        if (activityRes.ok) setActivityData(await activityRes.json());
        if (cultureRes.ok) setCultureData(await cultureRes.json());
      } catch (error) {
        console.error('Error fetching analytics:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
    // Refresh activity feed every 30 seconds
    const interval = setInterval(async () => {
      try {
        const res = await fetch('/api/recent-activity');
        if (res.ok) setActivityData(await res.json());
      } catch (e) {}
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const date = new Date(timestamp);
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  const getHeatmapColor = (count: number, maxCount: number) => {
    if (count === 0) return 'bg-gray-100 dark:bg-gray-800';
    const intensity = count / maxCount;
    if (intensity < 0.2) return 'bg-blue-100 dark:bg-blue-900/30';
    if (intensity < 0.4) return 'bg-blue-200 dark:bg-blue-800/40';
    if (intensity < 0.6) return 'bg-blue-300 dark:bg-blue-700/50';
    if (intensity < 0.8) return 'bg-blue-400 dark:bg-blue-600/60';
    return 'bg-blue-500 dark:bg-blue-500/70';
  };

  const maxHeatmapCount = Math.max(...heatmapData.map(d => d.count), 1);
  const latestVersion = versionData.length > 0 ? versionData[0].version : '-';
  const totalVersionUsers = versionData.reduce((sum, v) => sum + v.count, 0);

  if (loading) {
    return (
      <div className="space-y-8 animate-pulse">
        <div>
          <div className="h-10 w-48 bg-gray-200 dark:bg-gray-700 rounded-lg mb-2" />
          <div className="h-5 w-72 bg-gray-200 dark:bg-gray-700 rounded-lg" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ChartSkeleton />
          <ChartSkeleton />
        </div>
        <ChartSkeleton />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <HeroSection
        title="Analytics"
        subtitle="상세 분석 데이터와 실시간 활동을 확인합니다"
        stats={[
          { label: 'Latest Version', value: `v${latestVersion}` },
          { label: 'Total Users', value: totalVersionUsers },
        ]}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Version Distribution */}
        <Card hover={false} className="p-6">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Version Distribution
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              앱 버전별 사용자 분포
            </p>
          </div>
          {versionData.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={versionData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal vertical={false} />
                <XAxis type="number" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                <YAxis
                  dataKey="version"
                  type="category"
                  width={60}
                  tick={{ fill: '#94a3b8', fontSize: 12 }}
                  tickFormatter={(v) => `v${v}`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    borderRadius: '12px',
                    border: 'none',
                    boxShadow: '0 10px 40px rgba(0, 0, 0, 0.15)',
                  }}
                  labelStyle={{ color: '#1f2937' }}
                  formatter={(value: number) => [`${value} users`, 'Users']}
                  labelFormatter={(v) => `Version ${v}`}
                />
                <Bar dataKey="count" radius={[0, 8, 8, 0]}>
                  {versionData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={index === 0 ? '#10b981' : CHART_COLORS[index % CHART_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-64 flex items-center justify-center text-gray-400">
              No version data available
            </div>
          )}
          {versionData.length > 0 && (
            <div className="mt-4 p-3 rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
              <div className="flex items-center gap-2">
                <span className="text-2xl">🎯</span>
                <div>
                  <p className="text-sm font-medium text-green-800 dark:text-green-300">
                    Latest Version Adoption
                  </p>
                  <p className="text-lg font-bold text-green-600 dark:text-green-400">
                    {totalVersionUsers > 0 ? ((versionData[0]?.count / totalVersionUsers) * 100).toFixed(1) : 0}%
                  </p>
                </div>
              </div>
            </div>
          )}
        </Card>

        {/* 지역별 사용자 분포 지도 */}
        <Card hover={false} className="p-6">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Regional Distribution
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              IP 기반 지역별 사용자 분포
            </p>
          </div>
          <KoreaMap />
        </Card>
      </div>

      {/* Hourly Heatmap */}
      <Card hover={false} className="p-6">
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Usage Heatmap
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            시간대별/요일별 사용 패턴 (KST 기준)
          </p>
        </div>
        <div className="overflow-x-auto">
          <div className="min-w-[600px]">
            {/* Hour labels */}
            <div className="flex mb-2 ml-12">
              {Array.from({ length: 24 }, (_, i) => (
                <div key={i} className="flex-1 text-center text-xs text-gray-400">
                  {i % 3 === 0 ? `${i}시` : ''}
                </div>
              ))}
            </div>
            {/* Heatmap grid */}
            {DAYS_ORDER.map((day) => (
              <div key={day} className="flex items-center mb-1">
                <div className="w-12 text-sm text-gray-500 dark:text-gray-400">{day}</div>
                <div className="flex flex-1 gap-0.5">
                  {Array.from({ length: 24 }, (_, hour) => {
                    const data = heatmapData.find(d => d.day === day && d.hour === hour);
                    const count = data?.count || 0;
                    return (
                      <div
                        key={hour}
                        className={`flex-1 h-6 rounded-sm ${getHeatmapColor(count, maxHeatmapCount)} transition-all hover:scale-110 cursor-pointer`}
                        title={`${day} ${hour}:00 - ${count} events`}
                      />
                    );
                  })}
                </div>
              </div>
            ))}
            {/* Legend */}
            <div className="flex items-center justify-end mt-4 gap-2 text-xs text-gray-500">
              <span>Less</span>
              <div className="flex gap-0.5">
                <div className="w-4 h-4 rounded-sm bg-gray-100 dark:bg-gray-800" />
                <div className="w-4 h-4 rounded-sm bg-blue-100 dark:bg-blue-900/30" />
                <div className="w-4 h-4 rounded-sm bg-blue-200 dark:bg-blue-800/40" />
                <div className="w-4 h-4 rounded-sm bg-blue-300 dark:bg-blue-700/50" />
                <div className="w-4 h-4 rounded-sm bg-blue-400 dark:bg-blue-600/60" />
                <div className="w-4 h-4 rounded-sm bg-blue-500 dark:bg-blue-500/70" />
              </div>
              <span>More</span>
            </div>
          </div>
        </div>
      </Card>

      {/* Real-time Activity Feed */}
      <Card hover={false} className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Real-time Activity
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              최근 활동 (30초마다 자동 새로고침)
            </p>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-sm">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
            </span>
            Live
          </div>
        </div>

        <div className="space-y-3 max-h-96 overflow-y-auto">
          {activityData.length > 0 ? (
            activityData.map((activity, index) => (
              <div
                key={index}
                className="flex items-center gap-4 p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors animate-fadeIn"
                style={{ animationDelay: `${index * 0.02}s` }}
              >
                <div className={`w-10 h-10 rounded-xl ${EVENT_COLORS[activity.event_name] || 'bg-gray-500'} flex items-center justify-center text-lg`}>
                  {EVENT_ICONS[activity.event_name] || '📌'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-900 dark:text-white truncate">
                      {activity.machine_name}
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400">
                      v{activity.app_version}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {activity.event_name === 'app_start' && 'App started'}
                    {activity.event_name === 'feature_use' && `Used: ${activity.feature_name}`}
                    {activity.event_name === 'page_view' && `Viewed: ${activity.feature_name}`}
                    {!['app_start', 'feature_use', 'page_view'].includes(activity.event_name) && activity.event_name}
                  </p>
                </div>
                <div className="text-sm text-gray-400 dark:text-gray-500 whitespace-nowrap">
                  {formatTimeAgo(activity.timestamp)}
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12 text-gray-400">
              No recent activity
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
