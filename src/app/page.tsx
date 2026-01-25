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
import { Card, StatCard } from '@/components/Card';
import { StatCardSkeleton, ChartSkeleton } from '@/components/Skeleton';
import { ChartIcon, UsersIcon, TrendIcon } from '@/components/Icons';

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

  const displayDailyData = dailyStarts.length > 0 ? dailyStarts : generateSampleDailyData();
  const displayWeeklyData = weeklyTrend.length > 0 ? weeklyTrend : generateSampleWeeklyData();

  const totalSessions = displayDailyData.reduce((sum, d) => sum + d.count, 0);
  const totalUsers = displayWeeklyData.reduce((sum, d) => sum + d.users, 0);
  const avgSessionsPerDay = Math.round(totalSessions / Math.max(displayDailyData.length, 1));

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
        <ChartSkeleton />
        <ChartSkeleton />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Dashboard
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Waytotec Control System 사용 현황을 한눈에 확인하세요
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          title="Total Sessions (30d)"
          value={totalSessions}
          change="+12%"
          icon={<ChartIcon className="w-6 h-6" />}
          gradient="blue"
        />
        <StatCard
          title="Unique Users (30d)"
          value={totalUsers}
          change="+5%"
          icon={<UsersIcon className="w-6 h-6" />}
          gradient="green"
        />
        <StatCard
          title="Avg Sessions/Day"
          value={avgSessionsPerDay}
          change="+8%"
          icon={<TrendIcon className="w-6 h-6" />}
          gradient="purple"
        />
      </div>

      {/* Daily App Starts Chart */}
      <Card hover={false} className="p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Daily App Starts
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              지난 30일간 일별 앱 시작 횟수
            </p>
          </div>
          <div className="mt-4 sm:mt-0 flex items-center gap-2">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300">
              <span className="w-2 h-2 bg-blue-500 rounded-full mr-2" />
              App Starts
            </span>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={320}>
          <AreaChart data={displayDailyData}>
            <defs>
              <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="date"
              tickFormatter={(value) => new Date(value).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })}
              tick={{ fill: '#94a3b8', fontSize: 12 }}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              tick={{ fill: '#94a3b8', fontSize: 12 }}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip
              labelFormatter={(value) => new Date(value).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })}
              contentStyle={{
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                borderRadius: '12px',
                border: 'none',
                boxShadow: '0 10px 40px rgba(0, 0, 0, 0.15)',
              }}
            />
            <Area
              type="monotone"
              dataKey="count"
              name="App Starts"
              stroke="#3b82f6"
              strokeWidth={3}
              fill="url(#colorCount)"
              dot={false}
              activeDot={{ r: 6, fill: '#3b82f6', stroke: '#fff', strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </Card>

      {/* Weekly Trend Chart */}
      <Card hover={false} className="p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Weekly Trend
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              주간 사용자 및 세션 추이
            </p>
          </div>
          <div className="mt-4 sm:mt-0 flex items-center gap-3">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300">
              <span className="w-2 h-2 bg-blue-500 rounded-full mr-2" />
              Sessions
            </span>
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300">
              <span className="w-2 h-2 bg-emerald-500 rounded-full mr-2" />
              Users
            </span>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={320}>
          <AreaChart data={displayWeeklyData}>
            <defs>
              <linearGradient id="colorSessions" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="week"
              tickFormatter={(value) => new Date(value).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })}
              tick={{ fill: '#94a3b8', fontSize: 12 }}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              yAxisId="left"
              tick={{ fill: '#94a3b8', fontSize: 12 }}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              tick={{ fill: '#94a3b8', fontSize: 12 }}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip
              labelFormatter={(value) => `Week of ${new Date(value).toLocaleDateString('ko-KR')}`}
              contentStyle={{
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                borderRadius: '12px',
                border: 'none',
                boxShadow: '0 10px 40px rgba(0, 0, 0, 0.15)',
              }}
            />
            <Area
              yAxisId="left"
              type="monotone"
              dataKey="sessions"
              name="Sessions"
              stroke="#3b82f6"
              strokeWidth={3}
              fill="url(#colorSessions)"
              dot={false}
              activeDot={{ r: 6, fill: '#3b82f6', stroke: '#fff', strokeWidth: 2 }}
            />
            <Area
              yAxisId="right"
              type="monotone"
              dataKey="users"
              name="Unique Users"
              stroke="#10b981"
              strokeWidth={3}
              fill="url(#colorUsers)"
              dot={false}
              activeDot={{ r: 6, fill: '#10b981', stroke: '#fff', strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </Card>

      {dailyStarts.length === 0 && (
        <div className="text-center py-4">
          <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300">
            Supabase 연결 후 실제 데이터가 표시됩니다. 현재는 샘플 데이터입니다.
          </span>
        </div>
      )}
    </div>
  );
}

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
