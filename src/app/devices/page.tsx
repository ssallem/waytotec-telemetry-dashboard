'use client';

import { useEffect, useState } from 'react';

interface DeviceData {
  device_id: string;
  app_starts: number;
  last_active: string;
  os_version: string;
  app_version: string;
  resolution: string;
  features_used: string[];
}

export default function DevicesPage() {
  const [devices, setDevices] = useState<DeviceData[]>([]);
  const [loading, setLoading] = useState(true);

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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const shortenDeviceId = (id: string) => {
    return id.length > 12 ? `${id.substring(0, 8)}...` : id;
  };

  const totalStarts = devices.reduce((sum, d) => sum + d.app_starts, 0);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
        Devices
      </h1>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
            Total Devices
          </h3>
          <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
            {devices.length}
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
            Total App Starts
          </h3>
          <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
            {totalStarts}
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
            Avg Starts/Device
          </h3>
          <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
            {devices.length > 0 ? (totalStarts / devices.length).toFixed(1) : 0}
          </p>
        </div>
      </div>

      {/* Devices Table */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Device List (Last 30 Days)
        </h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Device ID
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  App Starts
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Last Active
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  OS
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  App Version
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Resolution
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Features Used
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {devices.map((device, index) => (
                <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-4 py-4 whitespace-nowrap text-sm font-mono text-gray-900 dark:text-white">
                    <span title={device.device_id}>
                      {shortenDeviceId(device.device_id)}
                    </span>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                      {device.app_starts}
                    </span>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                    {formatDate(device.last_active)}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                    {device.os_version.includes('Windows NT 10.0') ? 'Windows 10/11' : device.os_version}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                    {device.app_version}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                    {device.resolution}
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-500 dark:text-gray-300">
                    <div className="flex flex-wrap gap-1">
                      {device.features_used.length > 0 ? (
                        device.features_used.map((feature, i) => (
                          <span
                            key={i}
                            className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                          >
                            {feature}
                          </span>
                        ))
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {devices.length === 0 && (
          <div className="text-center text-gray-500 dark:text-gray-400 py-8">
            No device data available
          </div>
        )}
      </div>
    </div>
  );
}
