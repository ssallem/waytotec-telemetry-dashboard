'use client';

import { ReactNode } from 'react';
import { AnimatedCounter } from './AnimatedCounter';

interface CardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
}

export function Card({ children, className = '', hover = true }: CardProps) {
  return (
    <div
      className={`
        relative overflow-hidden
        bg-white/80 dark:bg-gray-800/80
        backdrop-blur-xl
        border border-gray-200/50 dark:border-gray-700/50
        rounded-2xl shadow-lg
        ${hover ? 'transition-all duration-300 hover:shadow-xl hover:scale-[1.02] hover:border-blue-200 dark:hover:border-blue-700' : ''}
        ${className}
      `}
    >
      {children}
    </div>
  );
}

interface StatCardProps {
  title: string;
  value: string | number;
  change?: string;
  icon?: ReactNode;
  gradient?: 'blue' | 'green' | 'purple' | 'orange';
}

const gradientColors = {
  blue: 'from-blue-500 to-cyan-500',
  green: 'from-emerald-500 to-teal-500',
  purple: 'from-purple-500 to-pink-500',
  orange: 'from-orange-500 to-amber-500',
};

export function StatCard({ title, value, change, icon, gradient = 'blue' }: StatCardProps) {
  const isPositive = change?.startsWith('+');
  const numericValue = typeof value === 'number' ? value : parseFloat(value.toString());
  const isNumeric = !isNaN(numericValue);

  return (
    <Card className="hover-spring">
      <div className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p>
            <div className="mt-2 flex items-baseline gap-2">
              {isNumeric ? (
                <AnimatedCounter
                  value={value}
                  className="text-3xl font-bold text-gray-900 dark:text-white"
                />
              ) : (
                <span className="text-3xl font-bold text-gray-900 dark:text-white">
                  {value}
                </span>
              )}
              {change && (
                <span
                  className={`
                    inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium
                    ${isPositive
                      ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300'
                      : 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300'}
                  `}
                >
                  {change}
                </span>
              )}
            </div>
          </div>
          {icon && (
            <div className={`p-3 rounded-xl bg-gradient-to-br ${gradientColors[gradient]} text-white shadow-lg animate-iconFloat`}>
              {icon}
            </div>
          )}
        </div>
        {/* Decorative gradient line with pulse */}
        <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${gradientColors[gradient]} animate-gradientPulse`} />
      </div>
    </Card>
  );
}
