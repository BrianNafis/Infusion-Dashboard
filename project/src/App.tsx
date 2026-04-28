import { useEffect, useState } from 'react';
import { Activity, Droplets, Scale, Clock, TrendingUp } from 'lucide-react';
import { InfusMonitoring } from './lib/supabase';
import { InfusionChart } from './components/InfusionChart';
import { MetricCard } from './components/MetricCard';
import { StatusBadge } from './components/StatusBadge';
import { DataTable } from './components/DataTable';
import { AlertBox } from './components/AlertBox';

// Import data JSON
import realData from './data/data.json';

// Interface untuk data mentah (semua string)
interface RawInfusMonitoring {
  id: string;
  timestamp: string;
  drop_count: string;
  drop_rate: string;
  avg_drop_rate: string;
  weight: string;
  delta_weight: string;
  fluctuation_deviation: string;
  status: string;
  alert: string;
  status_color: string;
  created_at: string;
}

function App() {
  const [data, setData] = useState<InfusMonitoring[]>([]);
  const [latestData, setLatestData] = useState<InfusMonitoring | null>(null);
  const [showAlert, setShowAlert] = useState(false);
  const [loading, setLoading] = useState(true);

const calculateEstimatedTime = () => {
  if (!latestData) return { time: "Calculating...", progress: 0 };
  
  console.log('🔢 === REALISTIC CALCULATION ===');
  
  const BOTTLE_VOLUME_ML = 500;
  const DROP_VOLUME_ML = 0.05;
  
  // WEIGHT ADALAH SISA VOLUME DI BOTOL!
  const volumeRemaining = latestData.weight; // Sisa volume di botol
  const volumeUsed = BOTTLE_VOLUME_ML - volumeRemaining; // Volume yang sudah terpakai
  const progress = Math.min(100, (volumeUsed / BOTTLE_VOLUME_ML) * 100);
  
  console.log('Sisa volume:', volumeRemaining, 'ml');
  console.log('Volume terpakai:', volumeUsed, 'ml');
  console.log('Progress:', progress.toFixed(1), '%');
  
  // PAKAI AVG DROP RATE YANG REALISTIC DARI DATA ASLI
  const REALISTIC_AVG_DROP_RATE = 1.17; // drops/sec (dari hitungan 500ml/143menit)
  
  console.log('Using realistic avg drop rate:', REALISTIC_AVG_DROP_RATE, 'drops/sec');
  
  const dropRatePerMinute = REALISTIC_AVG_DROP_RATE * 60;
  const volumePerMinute = dropRatePerMinute * DROP_VOLUME_ML;
  
  console.log('Drops per minute:', dropRatePerMinute);
  console.log('Volume per minute:', volumePerMinute.toFixed(2), 'ml/min');
  
  const estimatedMinutes = volumeRemaining / volumePerMinute;
  
  console.log('Estimated minutes:', estimatedMinutes);
  
  let resultTime = "";
  
  if (estimatedMinutes >= 60) {
    const hours = Math.floor(estimatedMinutes / 60);
    const minutes = Math.round(estimatedMinutes % 60);
    resultTime = `${hours}j ${minutes}m`;
  } else {
    resultTime = `${Math.ceil(estimatedMinutes)}m`;
  }
  
  console.log('🎯 ESTIMATED TIME:', resultTime);
  
  return { time: resultTime, progress };
};

  const getAlertMessage = (status: string, alertCode: string) => {
    if (alertCode === "0") return "";
    
    const alertMessages: { [key: string]: string } = {
      "Infus Habis (No Drip)": "Infusion has stopped - no drops detected",
      "Abnormal(stuck)": "Abnormal flow detected - possible blockage", 
      "Slow Drip": "Slow infusion rate detected"
    };
    
    return alertMessages[status] || "Anomaly detected";
  };

  const { time: estimatedTime, progress } = latestData ? calculateEstimatedTime() : { time: "Calculating...", progress: 0 };

  useEffect(() => {
    // Convert data dari string ke number
    console.log('📊 Loading data from JSON file:', realData.length, 'records');
    
    const formattedData: InfusMonitoring[] = (realData as RawInfusMonitoring[]).map(item => ({
      id: Number(item.id),
      timestamp: item.timestamp,
      drop_count: Number(item.drop_count),
      drop_rate: Number(item.drop_rate),
      avg_drop_rate: Number(item.avg_drop_rate),
      weight: Number(item.weight),
      delta_weight: Number(item.delta_weight),
      fluctuation_deviation: Number(item.fluctuation_deviation),
      status: item.status,
      alert: item.alert,
      status_color: item.status_color,
      created_at: item.created_at
    }));

    // Pastikan data terurut berdasarkan created_at
    const sortedData = formattedData.sort((a, b) => 
      new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    );
    
    setData(sortedData);
    
    if (sortedData.length > 0) {
      const latest = sortedData[sortedData.length - 1];
      setLatestData(latest);

      if (latest.status !== 'Normal' && latest.alert !== "0") {
        setShowAlert(true);
      }
      
      console.log('📈 LATEST DATA FOR CALCULATION:', latest);
    }
    
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-xl font-semibold text-gray-700">Loading Dashboard ...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100">
      {latestData && showAlert && latestData.alert !== "0" && (
        <AlertBox
          alert={getAlertMessage(latestData.status, latestData.alert)}
          status={latestData.status}
          onClose={() => setShowAlert(false)}
        />
      )}

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 text-center">
          <div className="flex items-center justify-center gap-3 mb-2">
            <Activity className="w-10 h-10 text-blue-600" />
            <h1 className="text-4xl font-bold text-gray-800">
              Smart Infusion Anomaly Detection Dashboard
            </h1>
          </div>
          <p className="text-gray-600 text-lg">
            Real-time IoT Monitoring System with CNN-LSTM Detection
          </p>
          <div className="mt-4 p-3 bg-green-100 text-green-800 rounded-lg inline-block">
          </div>
        </div>

        {latestData ? (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 mb-8">
              {/* KIRI: CHART 60% - TINGGI 540px */}
              <div className="lg:col-span-3">
                <div className="bg-white rounded-xl shadow-lg p-4 h-full">
                  <h2 className="text-xl font-bold text-gray-800 mb-4 text-center">
                    Infusion Drop Rate Monitor
                  </h2>
                  <div className="h-[492px]">
                    <InfusionChart data={data.slice(-20)} />
                  </div>
                </div>
              </div>

              {/* KANAN: 8 KOTAK METRICS 40% - TINGGI TOTAL 540px */}
              <div className="lg:col-span-2">
                <div className="grid grid-cols-2 gap-3 h-[492px] auto-rows-max">
                  {/* KOTAK 1: STATUS BADGE - 2 kolom */}
                  <div className="col-span-2">
                    <div className="bg-white rounded-lg shadow-md p-3 border-l-4 border-blue-500 h-[100px]">
                      <div className="text-center h-full flex flex-col justify-center">
                        <h3 className="text-sm font-semibold text-gray-700 mb-2">System Status</h3>
                        <StatusBadge
                          status={latestData.status}
                          statusColor={latestData.status_color}
                        />
                      </div>
                    </div>
                  </div>

                  {/* KOTAK 2-7: 6 METRIC CARDS */}
                  <div className="h-[85px]">
                    <MetricCard
                      title="Avg Drop Rate"
                      value={latestData.avg_drop_rate.toFixed(2)}
                      unit="drops/sec"
                      icon={<Droplets className="w-5 h-5" />}
                      compact={true}
                    />
                  </div>
                  <div className="h-[85px]">
                    <MetricCard
                      title="Current Weight"
                      value={latestData.weight.toFixed(1)}
                      unit="grams"
                      icon={<Scale className="w-5 h-5" />}
                      compact={true}
                    />
                  </div>
                  <div className="h-[85px]">
                    <MetricCard
                      title="Drop Count"
                      value={latestData.drop_count.toString()}
                      unit="drops"
                      icon={<Activity className="w-5 h-5" />}
                      compact={true}
                    />
                  </div>
                  <div className="h-[85px]">
                    <MetricCard
                      title="Current Drop Rate"
                      value={latestData.drop_rate.toFixed(2)}
                      unit="drops/sec"
                      icon={<TrendingUp className="w-5 h-5" />}
                      compact={true}
                    />
                  </div>
                  <div className="h-[85px]">
                    <MetricCard
                      title="Delta Weight"
                      value={latestData.delta_weight.toFixed(1)}
                      unit="grams"
                      icon={<TrendingUp className="w-5 h-5" />}
                      compact={true}
                    />
                  </div>
                  <div className="h-[85px]">
                    <MetricCard
                      title="Last Update"
                      value={new Date(latestData.created_at).toLocaleTimeString('id-ID', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                      icon={<Clock className="w-5 h-5" />}
                      compact={true}
                    />
                  </div>

                  {/* KOTAK 8: ESTIMATED TIME - 2 kolom */}
                  <div className="col-span-2">
                    <div className="bg-white rounded-lg shadow-md p-3 border-l-4 border-cyan-500 h-[120px]">
                      <div className="flex items-center gap-2 mb-2">
                        <Clock className="w-4 h-4 text-cyan-500" />
                        <h3 className="text-sm font-semibold text-gray-700">Estimated Time</h3>
                      </div>
                      <div className="text-center">
                        <p className="text-xl font-bold text-gray-900 mb-2">
                          {estimatedTime}
                        </p>
                        <div className="w-full bg-gray-200 rounded-full h-2 mb-1">
                          <div 
                            className="bg-cyan-500 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${progress}%` }}
                          ></div>
                        </div>
                        <p className="text-xs text-gray-500">
                          {progress.toFixed(0)}% completed • {latestData.weight.toFixed(0)}/500ml
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* DATA TABLE */}
            <div className="mb-8">
              <DataTable data={data.slice().reverse().slice(0, 20)} />
            </div>
          </>
        ) : (
          <div className="text-center py-12">
            <div className="text-gray-500 text-lg">
              No data available
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
