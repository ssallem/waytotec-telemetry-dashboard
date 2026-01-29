'use client';

import { useEffect, useState } from 'react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { Card, StatCard } from '@/components/Card';
import { StatCardSkeleton, ChartSkeleton } from '@/components/Skeleton';
import { DeviceIcon, SettingsIcon } from '@/components/Icons';
import { HeroSection } from '@/components/HeroSection';

interface OsData {
  os: string;
  count: number;
}

interface ResolutionData {
  resolution: string;
  count: number;
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6'];

export default function EnvironmentPage() {
  const [osDistribution, setOsDistribution] = useState<OsData[]>([]);
  const [resolutions, setResolutions] = useState<ResolutionData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [osRes, resRes] = await Promise.all([
          fetch('/api/os-distribution'),
          fetch('/api/screen-resolutions'),
        ]);

        if (osRes.ok) {
          setOsDistribution(await osRes.json());
        }
        if (resRes.ok) {
          setResolutions(await resRes.json());
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  const displayOs = osDistribution.length > 0 ? osDistribution : generateSampleOsData();
  const displayResolutions = resolutions.length > 0 ? resolutions : generateSampleResolutionData();

  const totalDevices = displayOs.reduce((sum, o) => sum + o.count, 0);
  const topOs = displayOs.reduce((max, o) => o.count > max.count ? o : max, displayOs[0]);
  const topResolution = displayResolutions.reduce((max, r) => r.count > max.count ? r : max, displayResolutions[0]);

  if (loading) {
    return (
      <div className="space-y-8 animate-pulse">
        <div>
          <div className="h-10 w-48 bg-gray-200 dark:bg-gray-700 rounded-lg mb-2" />
          <div className="h-5 w-72 bg-gray-200 dark:bg-gray-700 rounded-lg" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCardSkeleton />
          <StatCardSkeleton />
          <StatCardSkeleton />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ChartSkeleton />
          <ChartSkeleton />
        </div>
      </div>
    );
  }

  const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    if (percent < 0.05) return null;

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor="middle"
        dominantBaseline="central"
        className="font-semibold text-sm"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <HeroSection
        title="Environment"
        subtitle="사용자 환경 및 시스템 구성을 분석합니다"
        stats={[
          { label: 'Total Devices', value: totalDevices },
          { label: 'OS Types', value: displayOs.length },
        ]}
      />

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          title="Total Devices"
          value={totalDevices}
          icon={<DeviceIcon className="w-6 h-6" />}
          gradient="blue"
        />
        <StatCard
          title="Most Common OS"
          value={topOs?.os || '-'}
          icon={<SettingsIcon className="w-6 h-6" />}
          gradient="green"
        />
        <StatCard
          title="Top Resolution"
          value={topResolution?.resolution || '-'}
          icon={<DeviceIcon className="w-6 h-6" />}
          gradient="purple"
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* OS Distribution */}
        <Card hover={false} className="p-6">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              OS Distribution
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              운영체제별 사용 분포
            </p>
          </div>
          <div className="flex flex-col lg:flex-row items-center gap-6">
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={displayOs}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={renderCustomLabel}
                  outerRadius={110}
                  innerRadius={60}
                  fill="#8884d8"
                  dataKey="count"
                  nameKey="os"
                  strokeWidth={3}
                  stroke="rgba(255,255,255,0.5)"
                >
                  {displayOs.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    borderRadius: '12px',
                    border: 'none',
                    boxShadow: '0 10px 40px rgba(0, 0, 0, 0.15)',
                  }}
                  labelStyle={{ color: '#1f2937' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Legend */}
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
            {displayOs.map((os, index) => {
              const percentage = ((os.count / totalDevices) * 100).toFixed(1);
              return (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span
                      className="w-4 h-4 rounded-lg"
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    />
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {os.os}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {os.count}
                    </span>
                    <span className="text-xs text-gray-400 dark:text-gray-500">
                      ({percentage}%)
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Screen Resolution Distribution */}
        <Card hover={false} className="p-6">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Screen Resolutions
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              화면 해상도별 분포
            </p>
          </div>
          <div className="flex flex-col lg:flex-row items-center gap-6">
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={displayResolutions}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={renderCustomLabel}
                  outerRadius={110}
                  innerRadius={60}
                  fill="#8884d8"
                  dataKey="count"
                  nameKey="resolution"
                  strokeWidth={3}
                  stroke="rgba(255,255,255,0.5)"
                >
                  {displayResolutions.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[(index + 3) % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    borderRadius: '12px',
                    border: 'none',
                    boxShadow: '0 10px 40px rgba(0, 0, 0, 0.15)',
                  }}
                  labelStyle={{ color: '#1f2937' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Legend */}
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
            {displayResolutions.map((res, index) => {
              const percentage = ((res.count / displayResolutions.reduce((s, r) => s + r.count, 0)) * 100).toFixed(1);
              return (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span
                      className="w-4 h-4 rounded-lg"
                      style={{ backgroundColor: COLORS[(index + 3) % COLORS.length] }}
                    />
                    <span className="text-sm font-medium text-gray-900 dark:text-white font-mono">
                      {res.resolution}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {res.count}
                    </span>
                    <span className="text-xs text-gray-400 dark:text-gray-500">
                      ({percentage}%)
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      {/* Resolution Insights */}
      <Card hover={false} className="p-6">
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Resolution Insights
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            화면 해상도 분석 결과
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Full HD (1920x1080)', ratio: '45%', category: 'Most Popular' },
            { label: 'QHD (2560x1440)', ratio: '25%', category: 'Growing' },
            { label: 'HD (1366x768)', ratio: '15%', category: 'Legacy' },
            { label: '4K (3840x2160)', ratio: '10%', category: 'High-End' },
          ].map((item, index) => (
            <div
              key={index}
              className="p-4 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-800/50 border border-gray-200/50 dark:border-gray-700/50"
            >
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                {item.category}
              </p>
              <p className="mt-2 text-lg font-semibold text-gray-900 dark:text-white">
                {item.label}
              </p>
              <p className="mt-1 text-2xl font-bold text-blue-600 dark:text-blue-400">
                {item.ratio}
              </p>
            </div>
          ))}
        </div>
      </Card>

      {osDistribution.length === 0 && (
        <div className="text-center py-4">
          <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300">
            Supabase 연결 후 실제 데이터가 표시됩니다. 현재는 샘플 데이터입니다.
          </span>
        </div>
      )}
    </div>
  );
}

function generateSampleOsData(): OsData[] {
  return [
    { os: 'Windows 10/11', count: 85 },
    { os: 'Windows 7', count: 12 },
    { os: 'Windows 8.1', count: 3 },
  ];
}

function generateSampleResolutionData(): ResolutionData[] {
  return [
    { resolution: '1920x1080', count: 45 },
    { resolution: '2560x1440', count: 25 },
    { resolution: '1366x768', count: 15 },
    { resolution: '3840x2160', count: 10 },
    { resolution: '1280x720', count: 5 },
  ];
}
