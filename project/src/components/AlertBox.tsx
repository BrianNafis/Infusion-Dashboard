import { AlertTriangle, X } from 'lucide-react';
import { useEffect, useState } from 'react';

interface AlertBoxProps {
  alert: string;
  status: string;
  onClose: () => void;
}

export function AlertBox({ alert, status, onClose }: AlertBoxProps) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (status === 'Anomaly') {
      setVisible(true);
      const timer = setTimeout(() => {
        setVisible(false);
        setTimeout(onClose, 300);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [alert, status, onClose]);

  if (!visible || status !== 'Anomaly') return null;

  return (
    <div
      className={`fixed top-4 right-4 z-50 max-w-md bg-red-600 text-white p-4 rounded-lg shadow-2xl transition-all duration-300 ${
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'
      }`}
    >
      <div className="flex items-start gap-3">
        <AlertTriangle className="w-6 h-6 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <h4 className="font-bold text-lg mb-1">Anomaly Detected!</h4>
          <p className="text-sm">{alert}</p>
        </div>
        <button
          onClick={() => {
            setVisible(false);
            setTimeout(onClose, 300);
          }}
          className="text-white hover:bg-red-700 rounded p-1 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
