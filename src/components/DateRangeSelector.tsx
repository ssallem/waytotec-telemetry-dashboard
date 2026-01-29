'use client';

import { useState } from 'react';

interface DateRangeSelectorProps {
  value: number;
  onChange: (days: number) => void;
  showComparison?: boolean;
  comparisonEnabled?: boolean;
  onComparisonChange?: (enabled: boolean) => void;
}

const ranges = [
  { label: '7일', value: 7 },
  { label: '30일', value: 30 },
  { label: '90일', value: 90 },
];

export function DateRangeSelector({
  value,
  onChange,
  showComparison = false,
  comparisonEnabled = false,
  onComparisonChange,
}: DateRangeSelectorProps) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      {/* 날짜 범위 선택 */}
      <div className="flex items-center bg-gray-100 dark:bg-gray-800 rounded-xl p-1">
        {ranges.map((range) => (
          <button
            key={range.value}
            onClick={() => onChange(range.value)}
            className={`
              px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200
              ${value === range.value
                ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }
            `}
          >
            {range.label}
          </button>
        ))}
      </div>

      {/* 비교 모드 토글 */}
      {showComparison && onComparisonChange && (
        <button
          onClick={() => onComparisonChange(!comparisonEnabled)}
          className={`
            flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200
            ${comparisonEnabled
              ? 'bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300 ring-2 ring-purple-500/30'
              : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
            }
          `}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          이전 기간 비교
        </button>
      )}
    </div>
  );
}
