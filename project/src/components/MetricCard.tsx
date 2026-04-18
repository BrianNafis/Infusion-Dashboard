// components/MetricCard.tsx
interface MetricCardProps {
  title: string;
  value: string;
  unit?: string;
  icon: React.ReactNode;
  compact?: boolean;
  fixedHeight?: boolean;
}

export function MetricCard({ title, value, unit, icon, compact = false, fixedHeight = false }: MetricCardProps) {
  return (
    <div className={`bg-white rounded-xl shadow-lg border border-gray-200 ${
      compact ? 'p-3' : 'p-6'
    } ${fixedHeight ? 'h-[100px]' : ''}`}>
      <div className="flex items-center justify-between h-full">
        <div className="flex-1">
          <p className={`text-gray-600 ${compact ? 'text-xs' : 'text-sm'} mb-1`}>
            {title}
          </p>
          <div className="flex items-baseline gap-1">
            <p className={`font-bold text-gray-900 ${
              compact ? 'text-lg' : 'text-2xl'
            }`}>
              {value}
            </p>
            {unit && (
              <span className={`text-gray-500 ${compact ? 'text-xs' : 'text-sm'}`}>
                {unit}
              </span>
            )}
          </div>
        </div>
        <div className={`text-blue-600 ${compact ? 'ml-2' : 'ml-4'}`}>
          {icon}
        </div>
      </div>
    </div>
  );
}