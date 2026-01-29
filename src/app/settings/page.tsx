'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/Card';
import { HeroSection } from '@/components/HeroSection';

interface Settings {
  defaultDateRange: number;
  autoRefresh: boolean;
  refreshInterval: number;
  showComparisonByDefault: boolean;
}

const defaultSettings: Settings = {
  defaultDateRange: 30,
  autoRefresh: true,
  refreshInterval: 30,
  showComparisonByDefault: false,
};

export default function SettingsPage() {
  const [settings, setSettings] = useState<Settings>(defaultSettings);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('dashboardSettings');
    if (stored) {
      setSettings({ ...defaultSettings, ...JSON.parse(stored) });
    }
  }, []);

  const handleSave = () => {
    localStorage.setItem('dashboardSettings', JSON.stringify(settings));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleReset = () => {
    setSettings(defaultSettings);
    localStorage.removeItem('dashboardSettings');
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-8">
      <HeroSection
        title="Settings"
        subtitle="대시보드 설정을 관리합니다"
        stats={[]}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 기본 설정 */}
        <Card hover={false} className="p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
            기본 설정
          </h2>

          <div className="space-y-6">
            {/* 기본 날짜 범위 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                기본 날짜 범위
              </label>
              <select
                value={settings.defaultDateRange}
                onChange={(e) => setSettings({ ...settings, defaultDateRange: Number(e.target.value) })}
                className="w-full px-4 py-2 rounded-xl bg-gray-100 dark:bg-gray-800 border-0 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              >
                <option value={7}>7일</option>
                <option value={30}>30일</option>
                <option value={90}>90일</option>
              </select>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                대시보드에서 기본으로 표시할 기간
              </p>
            </div>

            {/* 비교 모드 기본값 */}
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  비교 모드 기본 활성화
                </label>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  대시보드 로드 시 이전 기간 비교 자동 활성화
                </p>
              </div>
              <button
                onClick={() => setSettings({ ...settings, showComparisonByDefault: !settings.showComparisonByDefault })}
                className={`relative w-14 h-8 rounded-full transition-colors ${
                  settings.showComparisonByDefault ? 'bg-blue-500' : 'bg-gray-300 dark:bg-gray-600'
                }`}
              >
                <span
                  className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow transition-transform ${
                    settings.showComparisonByDefault ? 'left-7' : 'left-1'
                  }`}
                />
              </button>
            </div>
          </div>
        </Card>

        {/* 자동 새로고침 설정 */}
        <Card hover={false} className="p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
            자동 새로고침
          </h2>

          <div className="space-y-6">
            {/* 자동 새로고침 토글 */}
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  자동 새로고침
                </label>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  실시간 데이터 자동 업데이트
                </p>
              </div>
              <button
                onClick={() => setSettings({ ...settings, autoRefresh: !settings.autoRefresh })}
                className={`relative w-14 h-8 rounded-full transition-colors ${
                  settings.autoRefresh ? 'bg-blue-500' : 'bg-gray-300 dark:bg-gray-600'
                }`}
              >
                <span
                  className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow transition-transform ${
                    settings.autoRefresh ? 'left-7' : 'left-1'
                  }`}
                />
              </button>
            </div>

            {/* 새로고침 간격 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                새로고침 간격
              </label>
              <select
                value={settings.refreshInterval}
                onChange={(e) => setSettings({ ...settings, refreshInterval: Number(e.target.value) })}
                disabled={!settings.autoRefresh}
                className="w-full px-4 py-2 rounded-xl bg-gray-100 dark:bg-gray-800 border-0 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
              >
                <option value={15}>15초</option>
                <option value={30}>30초</option>
                <option value={60}>1분</option>
                <option value={300}>5분</option>
              </select>
            </div>
          </div>
        </Card>

        {/* 정보 */}
        <Card hover={false} className="p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
            정보
          </h2>

          <div className="space-y-4">
            <div className="flex justify-between py-2 border-b border-gray-200 dark:border-gray-700">
              <span className="text-sm text-gray-600 dark:text-gray-400">버전</span>
              <span className="text-sm font-medium text-gray-900 dark:text-white">1.0.0</span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-200 dark:border-gray-700">
              <span className="text-sm text-gray-600 dark:text-gray-400">프레임워크</span>
              <span className="text-sm font-medium text-gray-900 dark:text-white">Next.js 14</span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-200 dark:border-gray-700">
              <span className="text-sm text-gray-600 dark:text-gray-400">데이터베이스</span>
              <span className="text-sm font-medium text-gray-900 dark:text-white">Supabase</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">차트 라이브러리</span>
              <span className="text-sm font-medium text-gray-900 dark:text-white">Recharts</span>
            </div>
          </div>
        </Card>

        {/* 단축키 */}
        <Card hover={false} className="p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
            단축키
          </h2>

          <div className="space-y-3">
            <div className="flex justify-between items-center py-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">전체화면</span>
              <kbd className="px-2 py-1 text-xs font-mono bg-gray-200 dark:bg-gray-700 rounded">F11</kbd>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">전체화면 종료</span>
              <kbd className="px-2 py-1 text-xs font-mono bg-gray-200 dark:bg-gray-700 rounded">ESC</kbd>
            </div>
          </div>
        </Card>
      </div>

      {/* 저장 버튼 */}
      <div className="flex items-center justify-end gap-4">
        <button
          onClick={handleReset}
          className="px-6 py-2.5 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
        >
          기본값으로 복원
        </button>
        <button
          onClick={handleSave}
          className="px-6 py-2.5 rounded-xl text-sm font-medium text-white bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 transition-all shadow-lg hover:shadow-xl"
        >
          {saved ? '저장됨!' : '설정 저장'}
        </button>
      </div>
    </div>
  );
}
