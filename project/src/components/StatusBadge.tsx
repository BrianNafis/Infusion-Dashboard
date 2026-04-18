// components/StatusBadge.tsx
interface StatusBadgeProps {
  status: string;
  statusColor: string;
}

export function StatusBadge({ status, statusColor }: StatusBadgeProps) {
  // Map status color dari database ke Tailwind classes
  const colorMap: { [key: string]: string } = {
    'green': 'bg-green-100 text-green-800 border-green-300',
    'red': 'bg-red-100 text-red-800 border-red-300',
    'orange': 'bg-orange-100 text-orange-800 border-orange-300',
    'yellow': 'bg-yellow-100 text-yellow-800 border-yellow-300'
  };

  const colorClass = colorMap[statusColor] || 'bg-gray-100 text-gray-800 border-gray-300';

  return (
    <div className={`inline-flex items-center px-4 py-2 rounded-full border-2 font-semibold text-lg ${colorClass}`}>
      {status}
    </div>
  );
}