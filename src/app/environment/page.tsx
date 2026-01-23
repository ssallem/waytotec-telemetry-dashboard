'use client';

import { useEffect, useState } from 'react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const displayOs = osDistribution.length > 0 ? osDistribution : generateSampleOsData();
  const displayResolutions = resolutions.length > 0 ? resolutions : generateSampleResolutionData();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
        Environment
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* OS Distribution */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            OS Distribution
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={displayOs}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="count"
                nameKey="os"
              >
                {displayOs.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>

          {/* OS Table */}
          <div className="mt-4 overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                    OS
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                    Devices
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {displayOs.map((os, index) => (
                  <tr key={index}>
                    <td className="px-4 py-2 text-sm text-gray-900 dark:text-white flex items-center">
                      <span
                        className="w-3 h-3 rounded-full mr-2"
                        style={{ backgroundColor: COLORS[index % COLORS.length] }}
                      ></span>
                      {os.os}
                    </td>
                    <td className="px-4 py-2 text-sm text-gray-500 dark:text-gray-300">
                      {os.count}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Screen Resolution Distribution */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Screen Resolutions
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={displayResolutions}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="count"
                nameKey="resolution"
              >
                {displayResolutions.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>

          {/* Resolution Table */}
          <div className="mt-4 overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                    Resolution
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                    Devices
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {displayResolutions.map((res, index) => (
                  <tr key={index}>
                    <td className="px-4 py-2 text-sm text-gray-900 dark:text-white flex items-center">
                      <span
                        className="w-3 h-3 rounded-full mr-2"
                        style={{ backgroundColor: COLORS[index % COLORS.length] }}
                      ></span>
                      {res.resolution}
                    </td>
                    <td className="px-4 py-2 text-sm text-gray-500 dark:text-gray-300">
                      {res.count}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Culture/Language Distribution would go here if needed */}

      {osDistribution.length === 0 && (
        <div className="text-center text-gray-500 dark:text-gray-400 py-4">
          Supabase 연결 후 실제 데이터가 표시됩니다. 현재는 샘플 데이터입니다.
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
