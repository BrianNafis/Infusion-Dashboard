import { AlertTriangle, Droplets, Weight, TrendingUp } from 'lucide-react';

interface InfoGridProps {
  status: string;
  statusColor: string;
  alert: string;
  weight: number;
  avgDropRate: number;
  currentDropRate: number;
}

export function InfoGrid({
  status,
  statusColor,
  alert,
  weight,
  avgDropRate,
  currentDropRate,
}: InfoGridProps) {
  const avgDropRatePerMinute = avgDropRate * 60;
  const remainingVolume = Math.max(0, 500 - weight);
  const estimatedTime = avgDropRate > 0 ? Math.ceil(remainingVolume / (avgDropRate / 3)) : 0;

  return (
    <div className="space-y-4">
      <div
        className="p-5 rounded-lg border-2 transition-all duration-300"
        style={{ borderColor: statusColor, backgroundColor: `${statusColor}10` }}
      >
        <div className="flex items-center gap-3 mb-2">
          <div
            className="w-4 h-4 rounded-full"
            style={{ backgroundColor: statusColor }}
          ></div>
          <h3 className="text-sm font-semibold text-gray-700">Status</h3>
        </div>
        <p className="text-2xl font-bold" style={{ color: statusColor }}>
          {status}
        </p>
        {alert && (
          <div className="mt-3 pt-3 border-t" style={{ borderColor: `${statusColor}30` }}>
            <div className="flex gap-2 items-start">
              <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: statusColor }} />
              <p className="text-xs text-gray-600">{alert}</p>
            </div>
          </div>
        )}
      </div>

      <div className="p-5 rounded-lg bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex items-center gap-2 mb-2">
          <Weight className="w-5 h-5 text-amber-500" />
          <h3 className="text-sm font-semibold text-gray-700">Infusion Bottle</h3>
        </div>
        <div className="space-y-2">
          <div>
            <p className="text-xs text-gray-500 mb-1">Volume Used</p>
            <p className="text-xl font-bold text-gray-900">{weight.toFixed(1)}ml</p>
          </div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-400 to-blue-600 transition-all duration-300"
              style={{ width: `${(weight / 500) * 100}%` }}
            ></div>
          </div>
          <p className="text-xs text-gray-500">
            {remainingVolume.toFixed(1)}ml remaining
          </p>
        </div>
      </div>

      <div className="p-5 rounded-lg bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex items-center gap-2 mb-2">
          <TrendingUp className="w-5 h-5 text-emerald-500" />
          <h3 className="text-sm font-semibold text-gray-700">Drop Rate</h3>
        </div>
        <div className="space-y-3">
          <div>
            <p className="text-xs text-gray-500 mb-1">Current</p>
            <p className="text-2xl font-bold text-gray-900">
              {currentDropRate.toFixed(2)}
              <span className="text-xs font-normal text-gray-500 ml-1">drops/sec</span>
            </p>
          </div>
          <div className="pt-3 border-t border-gray-200">
            <p className="text-xs text-gray-500 mb-1">Average per Minute</p>
            <p className="text-2xl font-bold text-emerald-600">
              {avgDropRatePerMinute.toFixed(0)}
              <span className="text-xs font-normal text-gray-500 ml-1">drops/min</span>
            </p>
          </div>
        </div>
      </div>

      <div className="p-5 rounded-lg bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex items-center gap-2 mb-2">
          <Droplets className="w-5 h-5 text-cyan-500" />
          <h3 className="text-sm font-semibold text-gray-700">Estimated Time</h3>
        </div>
        <div className="space-y-2">
          <p className="text-3xl font-bold text-gray-900">
            {estimatedTime}
            <span className="text-xs font-normal text-gray-500 ml-1">minutes</span>
          </p>
          <p className="text-xs text-gray-500">
            Based on average drop rate
          </p>
        </div>
      </div>
    </div>
  );
}
