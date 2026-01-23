'use client';

import { useEffect, useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

interface FeatureData {
  feature: string;
  count: number;
}

interface PageViewData {
  page: string;
  count: number;
}

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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const displayFeatures = featureUsage.length > 0 ? featureUsage : generateSampleFeatureData();
  const displayPages = pageViews.length > 0 ? pageViews : generateSamplePageData();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
        Feature Usage
      </h1>

      {/* Feature Usage Chart */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Feature Usage (Last 30 Days)
        </h2>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={displayFeatures} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" />
            <YAxis dataKey="feature" type="category" width={150} />
            <Tooltip />
            <Legend />
            <Bar dataKey="count" name="Usage Count" fill="#3b82f6" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Page Views Chart */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Page Views (Last 30 Days)
        </h2>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={displayPages} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" />
            <YAxis dataKey="page" type="category" width={150} />
            <Tooltip />
            <Legend />
            <Bar dataKey="count" name="Views" fill="#10b981" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Feature Usage Table */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Feature Details
        </h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Feature
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Usage Count
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Percentage
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {displayFeatures.map((feature, index) => {
                const total = displayFeatures.reduce((sum, f) => sum + f.count, 0);
                const percentage = ((feature.count / total) * 100).toFixed(1);
                return (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                      {feature.feature}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                      {feature.count.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                      <div className="flex items-center">
                        <div className="w-16 bg-gray-200 dark:bg-gray-600 rounded-full h-2 mr-2">
                          <div
                            className="bg-blue-500 h-2 rounded-full"
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                        {percentage}%
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {featureUsage.length === 0 && (
        <div className="text-center text-gray-500 dark:text-gray-400 py-4">
          Supabase 연결 후 실제 데이터가 표시됩니다. 현재는 샘플 데이터입니다.
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
    { feature: 'Factory Reset', count: 34 },
    { feature: 'IP Range Scan', count: 45 },
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
