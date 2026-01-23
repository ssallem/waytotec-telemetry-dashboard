'use client';

import { useEffect, useState } from 'react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

interface DailyData {
  date: string;
  count: number;
}

interface WeeklyData {
  week: string;
  users: number;
  sessions: number;
}

export default function Dashboard() {
  const [dailyStarts, setDailyStarts] = useState<DailyData[]>([]);
  const [weeklyTrend, setWeeklyTrend] = useState<WeeklyData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [dailyRes, weeklyRes] = await Promise.all([
          fetch('/api/daily-starts'),
          fetch('/api/weekly-trend'),
        ]);

        if (dailyRes.ok) {
          setDailyStarts(await dailyRes.json());
        }
        if (weeklyRes.ok) {
          setWeeklyTrend(await weeklyRes.json());
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

  // 데이터가 없는 경우 샘플 데이터 표시
  const displayDailyData = dailyStarts.length > 0 ? dailyStarts : generateSampleDailyData();
  const displayWeeklyData = weeklyTrend.length > 0 ? weeklyTrend : generateSampleWeeklyData();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
        Dashboard
      </h1>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard
          title="Total Sessions (30d)"
          value={displayDailyData.reduce((sum, d) => sum + d.count, 0)}
          change="+12%"
        />
        <StatCard
          title="Unique Users (30d)"
          value={displayWeeklyData.reduce((sum, d) => sum + d.users, 0)}
          change="+5%"
        />
        <StatCard
          title="Avg Sessions/Day"
          value={Math.round(displayDailyData.reduce((sum, d) => sum + d.count, 0) / Math.max(displayDailyData.length, 1))}
          change="+8%"
        />
      </div>

      {/* Daily App Starts Chart */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Daily App Starts
        </h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={displayDailyData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="date"
              tickFormatter={(value) => new Date(value).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })}
            />
            <YAxis />
            <Tooltip
              labelFormatter={(value) => new Date(value).toLocaleDateString('ko-KR')}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="count"
              name="App Starts"
              stroke="#3b82f6"
              strokeWidth={2}
              dot={{ r: 3 }}
              activeDot={{ r: 5 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Weekly Trend Chart */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Weekly Trend
        </h2>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={displayWeeklyData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="week"
              tickFormatter={(value) => new Date(value).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })}
            />
            <YAxis yAxisId="left" />
            <YAxis yAxisId="right" orientation="right" />
            <Tooltip
              labelFormatter={(value) => `Week of ${new Date(value).toLocaleDateString('ko-KR')}`}
            />
            <Legend />
            <Area
              yAxisId="left"
              type="monotone"
              dataKey="sessions"
              name="Sessions"
              stroke="#3b82f6"
              fill="#93c5fd"
              fillOpacity={0.6}
            />
            <Area
              yAxisId="right"
              type="monotone"
              dataKey="users"
              name="Unique Users"
              stroke="#10b981"
              fill="#6ee7b7"
              fillOpacity={0.6}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {dailyStarts.length === 0 && (
        <div className="text-center text-gray-500 dark:text-gray-400 py-4">
          Supabase 연결 후 실제 데이터가 표시됩니다. 현재는 샘플 데이터입니다.
        </div>
      )}
    </div>
  );
}

function StatCard({ title, value, change }: { title: string; value: number; change: string }) {
  const isPositive = change.startsWith('+');
  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
      <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</h3>
      <div className="mt-2 flex items-baseline">
        <span className="text-3xl font-bold text-gray-900 dark:text-white">{value.toLocaleString()}</span>
        <span className={`ml-2 text-sm font-medium ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
          {change}
        </span>
      </div>
    </div>
  );
}

// 샘플 데이터 생성 함수
function generateSampleDailyData(): DailyData[] {
  const data: DailyData[] = [];
  const now = new Date();
  for (let i = 29; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    data.push({
      date: date.toISOString().split('T')[0],
      count: Math.floor(Math.random() * 20) + 5,
    });
  }
  return data;
}

function generateSampleWeeklyData(): WeeklyData[] {
  const data: WeeklyData[] = [];
  const now = new Date();
  for (let i = 7; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i * 7);
    data.push({
      week: date.toISOString().split('T')[0],
      users: Math.floor(Math.random() * 30) + 10,
      sessions: Math.floor(Math.random() * 100) + 30,
    });
  }
  return data;
}
