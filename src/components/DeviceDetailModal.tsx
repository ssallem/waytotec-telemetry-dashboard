'use client';

import { useEffect, useRef } from 'react';
import { DeviceIcon } from '@/components/Icons';

interface DeviceData {
  device_id: string;
  machine_name: string | null;
  ip_address: string | null;
  app_starts: number;
  last_active: string;
  os_version: string;
  app_version: string;
  resolution: string;
  features_used: string[];
}

interface DeviceDetailModalProps {
  device: DeviceData | null;
  onClose: () => void;
}

const FEATURE_COLORS: Record<string, string> = {
  'camera_scan': 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300',
  'firmware_update': 'bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300',
  'factory_reset': 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300',
  'config_upload': 'bg-orange-100 text-orange-800 dark:bg-orange-900/50 dark:text-orange-300',
  'camera_reboot': 'bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300',
  'set_ip_address': 'bg-teal-100 text-teal-800 dark:bg-teal-900/50 dark:text-teal-300',
  'arp_scan': 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/50 dark:text-cyan-300',
};

export function DeviceDetailModal({ device, onClose }: DeviceDetailModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  useEffect(() => {
    if (device) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [device]);

  if (!device) return null;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getOsDisplayName = (os: string) => {
    if (os.includes('Windows NT 10.0')) return 'Windows 10/11';
    if (os.includes('Windows NT 6.3')) return 'Windows 8.1';
    if (os.includes('Windows NT 6.1')) return 'Windows 7';
    return os;
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn"
      onClick={handleBackdropClick}
    >
      <div
        ref={modalRef}
        className="relative w-full max-w-lg bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden animate-slideUp"
      >
        {/* Gradient Header */}
        <div className="relative h-32 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 p-6">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <div className="absolute -bottom-8 left-6">
            <div className="w-16 h-16 rounded-2xl bg-white dark:bg-gray-800 shadow-lg flex items-center justify-center">
              <DeviceIcon className="w-8 h-8 text-blue-500" />
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="pt-12 px-6 pb-6">
          {/* Title */}
          <div className="mb-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              {device.machine_name || 'Unknown Computer'}
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 font-mono mt-1">
              {device.device_id}
            </p>
            {device.ip_address && (
              <p className="text-sm text-blue-600 dark:text-blue-400 font-mono mt-1">
                IP: {device.ip_address}
              </p>
            )}
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-700/50">
              <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">App Starts</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{device.app_starts}</p>
            </div>
            <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-700/50">
              <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">Resolution</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{device.resolution}</p>
            </div>
            <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-700/50">
              <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">OS</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white mt-1">{getOsDisplayName(device.os_version)}</p>
            </div>
            <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-700/50">
              <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">Version</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white mt-1">v{device.app_version}</p>
            </div>
          </div>

          {/* Last Active */}
          <div className="mb-6 p-4 rounded-xl bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-800">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <p className="text-sm text-gray-600 dark:text-gray-400">Last Active</p>
            </div>
            <p className="text-lg font-semibold text-gray-900 dark:text-white mt-1">
              {formatDate(device.last_active)}
            </p>
          </div>

          {/* Features Used */}
          <div>
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Features Used</p>
            {device.features_used.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {device.features_used.map((feature, i) => (
                  <span
                    key={i}
                    className={`inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-medium transition-transform hover:scale-105 ${
                      FEATURE_COLORS[feature] || 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                    }`}
                  >
                    {feature.replace(/_/g, ' ')}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-gray-400 dark:text-gray-500 text-sm">No features used</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
