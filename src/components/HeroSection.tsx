'use client';

import { useEffect, useState } from 'react';

interface HeroSectionProps {
  title: string;
  subtitle: string;
  stats?: Array<{
    label: string;
    value: string | number;
  }>;
}

export function HeroSection({ title, subtitle, stats }: HeroSectionProps) {
  const [currentTime, setCurrentTime] = useState<string>('');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const updateTime = () => {
      setCurrentTime(
        new Date().toLocaleString('ko-KR', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative overflow-hidden rounded-3xl mb-8">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 animate-gradient" />

      {/* Animated shapes */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-20 -right-20 w-60 h-60 bg-white/10 rounded-full animate-morph" />
        <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-white/10 rounded-full animate-morph animation-delay-2000" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 bg-white/5 rounded-full animate-blob" />
      </div>

      {/* Grid overlay */}
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
          backgroundSize: '40px 40px'
        }}
      />

      {/* Content */}
      <div className="relative z-10 px-8 py-10 text-white">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <div className="relative flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm text-xs font-medium">
                <span className="relative w-2 h-2 bg-green-400 rounded-full live-indicator" />
                <span>Live</span>
              </div>
              {mounted && (
                <span className="text-white/70 text-sm font-mono animate-fadeIn">
                  {currentTime}
                </span>
              )}
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-3 animate-fadeInUp">
              {title}
            </h1>
            <p className="text-lg text-white/80 max-w-xl animate-fadeInUp stagger-1">
              {subtitle}
            </p>
          </div>

          {stats && stats.length > 0 && (
            <div className="flex flex-wrap gap-4 lg:gap-6">
              {stats.map((stat, index) => (
                <div
                  key={index}
                  className="px-6 py-4 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 animate-scaleUp"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <p className="text-3xl md:text-4xl font-bold">{stat.value}</p>
                  <p className="text-sm text-white/70">{stat.label}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Bottom glow */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/50 to-transparent" />
    </div>
  );
}
