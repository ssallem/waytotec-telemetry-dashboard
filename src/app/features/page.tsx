'use client';

import { useEffect, useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { Card, StatCard } from '@/components/Card';
import { StatCardSkeleton, ChartSkeleton, TableSkeleton } from '@/components/Skeleton';
import { FeatureIcon, ChartIcon, TrendIcon } from '@/components/Icons';
import { HeroSection } from '@/components/HeroSection';

interface FeatureData {
  feature: string;
  count: number;
}

interface PageViewData {
  page: string;
  count: number;
}

const CHART_COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#06b6d4'];

export default function FeaturesPage() {
  const [featureUsage, setFeatureUsage] = useState<FeatureData[]>([]);
  const [pageViews, setPageViews] = useState<PageViewData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [featuresRes, pagesRes] = await Promise.all([
          fetch('/api/feature-usage'),
          fetch('/api/page-views'),
        ]);

        if (featuresRes.ok) {
          setFeatureUsage(await featuresRes.json());
        }
        if (pagesRes.ok) {
          setPageViews(await pagesRes.json());
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  const displayFeatures = featureUsage.length > 0 ? featureUsage : generateSampleFeatureData();
  const displayPages = pageViews.length > 0 ? pageViews : generateSamplePageData();

  const totalFeatureUsage = displayFeatures.reduce((sum, f) => sum + f.count, 0);
  const totalPageViews = displayPages.reduce((sum, p) => sum + p.count, 0);
  const topFeature = displayFeatures.reduce((max, f) => f.count > max.count ? f : max, displayFeatures[0]);

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
        <TableSkeleton rows={6} />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <HeroSection
        title="Feature Usage"
        subtitle="기능별 사용 빈도와 페이지 뷰를 분석합니다"
        stats={[
          { label: 'Feature Usage', value: totalFeatureUsage },
          { label: 'Page Views', value: totalPageViews },
        ]}
      />

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          title="Total Feature Usage"
          value={totalFeatureUsage}
          icon={<FeatureIcon className="w-6 h-6" />}
          gradient="purple"
        />
        <StatCard
          title="Total Page Views"
          value={totalPageViews}
          icon={<ChartIcon className="w-6 h-6" />}
          gradient="blue"
        />
        <StatCard
          title="Top Feature"
          value={topFeature?.feature || '-'}
          icon={<TrendIcon className="w-6 h-6" />}
          gradient="orange"
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Feature Usage Chart */}
        <Card hover={false} className="p-6">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Feature Usage
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              지난 30일간 기능별 사용 횟수
            </p>
          </div>
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={displayFeatures} layout="vertical" barCategoryGap="20%">
              <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
              <XAxis type="number" tick={{ fill: '#94a3b8', fontSize: 12 }} tickLine={false} axisLine={false} />
              <YAxis
                dataKey="feature"
                type="category"
                width={120}
                tick={{ fill: '#94a3b8', fontSize: 12 }}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  borderRadius: '12px',
                  border: 'none',
                  boxShadow: '0 10px 40px rgba(0, 0, 0, 0.15)',
                }}
                labelStyle={{ color: '#1f2937' }}
              />
              <Bar dataKey="count" name="Usage" radius={[0, 8, 8, 0]}>
                {displayFeatures.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Page Views Chart */}
        <Card hover={false} className="p-6">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Page Views
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              지난 30일간 페이지별 조회수
            </p>
          </div>
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={displayPages} layout="vertical" barCategoryGap="20%">
              <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
              <XAxis type="number" tick={{ fill: '#94a3b8', fontSize: 12 }} tickLine={false} axisLine={false} />
              <YAxis
                dataKey="page"
                type="category"
                width={120}
                tick={{ fill: '#94a3b8', fontSize: 12 }}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  borderRadius: '12px',
                  border: 'none',
                  boxShadow: '0 10px 40px rgba(0, 0, 0, 0.15)',
                }}
                labelStyle={{ color: '#1f2937' }}
              />
              <Bar dataKey="count" name="Views" radius={[0, 8, 8, 0]}>
                {displayPages.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={CHART_COLORS[(index + 2) % CHART_COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Feature Details Table */}
      <Card hover={false} className="p-6 overflow-hidden">
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Feature Details
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            각 기능의 상세 사용 통계
          </p>
        </div>
        <div className="overflow-x-auto -mx-6">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-800/50">
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Feature
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Usage Count
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Percentage
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {displayFeatures.map((feature, index) => {
                const percentage = ((feature.count / totalFeatureUsage) * 100).toFixed(1);
                return (
                  <tr
                    key={index}
                    className="hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors duration-200"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <span
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: CHART_COLORS[index % CHART_COLORS.length] }}
                        />
                        <span className="font-medium text-gray-900 dark:text-white">
                          {feature.feature}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white">
                        {feature.count.toLocaleString()}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex-1 max-w-32">
                          <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all duration-500"
                              style={{
                                width: `${percentage}%`,
                                backgroundColor: CHART_COLORS[index % CHART_COLORS.length]
                              }}
                            />
                          </div>
                        </div>
                        <span className="text-sm font-medium text-gray-600 dark:text-gray-400 w-14">
                          {percentage}%
                        </span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {featureUsage.length === 0 && (
        <div className="text-center py-4">
          <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300">
            Supabase 연결 후 실제 데이터가 표시됩니다. 현재는 샘플 데이터입니다.
          </span>
        </div>
      )}
    </div>
  );
}

function generateSampleFeatureData(): FeatureData[] {
  return [
    { feature: 'Camera Scan', count: 156 },
    { feature: 'Firmware Update', count: 89 },
    { feature: 'Network Config', count: 67 },
    { feature: 'IP Range Scan', count: 45 },
    { feature: 'Factory Reset', count: 34 },
    { feature: 'Camera Reboot', count: 28 },
  ];
}

function generateSamplePageData(): PageViewData[] {
  return [
    { page: 'Dashboard', count: 245 },
    { page: 'Camera Discovery', count: 189 },
    { page: 'Network Settings', count: 134 },
    { page: 'Camera Boards', count: 98 },
    { page: 'Settings', count: 67 },
    { page: 'Manual', count: 45 },
  ];
}
