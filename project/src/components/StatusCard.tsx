interface StatusCardProps {
  status: string;
  statusColor: string;
  alert: string;
}

export function StatusCard({ status, statusColor, alert }: StatusCardProps) {
  return (
    <div
      className="p-6 rounded-lg shadow-lg border-4 transition-all duration-300"
      style={{ borderColor: statusColor, backgroundColor: `${statusColor}15` }}
    >
      <div className="text-center">
        <h3 className="text-lg font-semibold text-gray-700 mb-2">System Status</h3>
        <div
          className="text-4xl font-bold mb-2"
          style={{ color: statusColor }}
        >
          {status}
        </div>
        {alert && (
          <div className="mt-3 text-sm text-gray-600 italic">
            {alert}
          </div>
        )}
      </div>
    </div>
  );
}
