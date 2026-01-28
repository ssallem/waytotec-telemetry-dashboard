'use client';

import { useEffect, useState } from 'react';
import { Card, StatCard } from '@/components/Card';
import { StatCardSkeleton, TableSkeleton } from '@/components/Skeleton';
import { DeviceIcon, ChartIcon, TrendIcon } from '@/components/Icons';
import { DeviceDetailModal } from '@/components/DeviceDetailModal';

interface DeviceData {
  device_id: string;
  machine_name: string | null;
  app_starts: number;
  last_active: string;
  os_version: string;
  app_version: string;
  resolution: string;
  features_used: string[];
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

export default function DevicesPage() {
  const [devices, setDevices] = useState<DeviceData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDevice, setSelectedDevice] = useState<DeviceData | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch('/api/devices');
        if (res.ok) {
          setDevices(await res.json());
        }
      } catch (error) {
        console.error('Error fetching devices:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffHours < 24) {
      return diffHours === 0 ? 'Just now' : `${diffHours}h ago`;
    } else if (diffDays < 7) {
      return `${diffDays}d ago`;
    }
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const shortenDeviceId = (id: string) => {
    return id.length > 12 ? `${id.substring(0, 8)}...${id.substring(id.length - 4)}` : id;
  };

  const getOsDisplayName = (os: string) => {
    if (os.includes('Windows NT 10.0')) return 'Win 10/11';
    if (os.includes('Windows NT 6.3')) return 'Win 8.1';
    if (os.includes('Windows NT 6.1')) return 'Win 7';
    return os;
  };

  const filteredDevices = devices.filter(device =>
    device.device_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (device.machine_name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    device.os_version.toLowerCase().includes(searchTerm.toLowerCase()) ||
    device.app_version.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalStarts = devices.reduce((sum, d) => sum + d.app_starts, 0);
  const avgStarts = devices.length > 0 ? (totalStarts / devices.length).toFixed(1) : '0';
  const activeToday = devices.filter(d => {
    const lastActive = new Date(d.last_active);
    const today = new Date();
    return lastActive.toDateString() === today.toDateString();
  }).length;

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
        <TableSkeleton rows={8} />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Devices
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          디바이스별 사용 현황을 확인합니다
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          title="Total Devices"
          value={devices.length}
          icon={<DeviceIcon className="w-6 h-6" />}
          gradient="blue"
        />
        <StatCard
          title="Total App Starts"
          value={totalStarts}
          icon={<ChartIcon className="w-6 h-6" />}
          gradient="green"
        />
        <StatCard
          title="Avg Starts/Device"
          value={avgStarts}
          icon={<TrendIcon className="w-6 h-6" />}
          gradient="purple"
        />
      </div>

      {/* Devices Table */}
      <Card hover={false} className="overflow-hidden">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Device List
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                지난 30일간 활동한 디바이스 ({filteredDevices.length}개)
              </p>
            </div>
            {/* Search */}
            <div className="relative">
              <input
                type="text"
                placeholder="Search devices..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full sm:w-64 px-4 py-2 pl-10 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
              <svg
                className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-800/50">
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Computer Name
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  App Starts
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Last Active
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  OS
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Version
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Features Used
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {filteredDevices.length > 0 ? (
                filteredDevices.map((device, index) => (
                  <tr
                    key={index}
                    onClick={() => setSelectedDevice(device)}
                    className="hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-all duration-200 cursor-pointer animate-tableRowEnter opacity-0"
                    style={{ animationDelay: `${index * 0.03}s`, animationFillMode: 'forwards' }}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
                          <DeviceIcon className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex flex-col">
                          <span className="font-medium text-sm text-gray-900 dark:text-white">
                            {device.machine_name || 'Unknown'}
                          </span>
                          <span
                            className="font-mono text-xs text-gray-500 dark:text-gray-400"
                            title={device.device_id}
                          >
                            {shortenDeviceId(device.device_id)}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-3 py-1.5 rounded-xl text-sm font-semibold bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300">
                        {device.app_starts}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${
                          new Date(device.last_active).getTime() > Date.now() - 24 * 60 * 60 * 1000
                            ? 'bg-green-500 animate-pulse'
                            : 'bg-gray-400'
                        }`} />
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {formatDate(device.last_active)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {getOsDisplayName(device.os_version)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-200">
                        v{device.app_version}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1.5 max-w-xs">
                        {device.features_used.length > 0 ? (
                          device.features_used.slice(0, 3).map((feature, i) => (
                            <span
                              key={i}
                              className={`inline-flex items-center px-2 py-1 rounded-lg text-xs font-medium ${
                                FEATURE_COLORS[feature] || 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'
                              }`}
                            >
                              {feature.replace(/_/g, ' ')}
                            </span>
                          ))
                        ) : (
                          <span className="text-gray-400 dark:text-gray-500 text-sm">-</span>
                        )}
                        {device.features_used.length > 3 && (
                          <span className="inline-flex items-center px-2 py-1 rounded-lg text-xs font-medium bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400">
                            +{device.features_used.length - 3}
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-16 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-16 h-16 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                        <DeviceIcon className="w-8 h-8 text-gray-400" />
                      </div>
                      <p className="text-gray-500 dark:text-gray-400">
                        {searchTerm ? 'No devices found matching your search' : 'No device data available'}
                      </p>
                      {searchTerm && (
                        <button
                          onClick={() => setSearchTerm('')}
                          className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                        >
                          Clear search
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Placeholder */}
        {filteredDevices.length > 0 && (
          <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Showing {filteredDevices.length} of {devices.length} devices
            </p>
            <div className="flex items-center gap-2">
              <button className="px-3 py-1.5 text-sm font-medium text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors disabled:opacity-50" disabled>
                Previous
              </button>
              <button className="px-3 py-1.5 text-sm font-medium text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors disabled:opacity-50" disabled>
                Next
              </button>
            </div>
          </div>
        )}
      </Card>

      {/* Device Detail Modal */}
      <DeviceDetailModal
        device={selectedDevice}
        onClose={() => setSelectedDevice(null)}
      />
    </div>
  );
}
