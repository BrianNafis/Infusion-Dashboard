import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

interface SensorData {
  drop_count: number;
  drop_rate: number;
  avg_drop_rate: number;
  weight: number;
  delta_weight: number;
  fluctuation_deviation: number;
  timestamp: string;
}

interface PredictionResult {
  status: string;
  alert: string;
  status_color: string;
}

function detectAnomaly(data: SensorData): PredictionResult {
  let status = 'Normal';
  let alert = '';
  let status_color = '#00b894';

  if (data.fluctuation_deviation > 0.15) {
    status = 'Anomaly';
    alert = 'High fluctuation detected! Check infusion system immediately.';
    status_color = '#d63031';
  } else if (Math.abs(data.delta_weight) > 5) {
    status = 'Anomaly';
    alert = 'Abnormal weight change detected!';
    status_color = '#d63031';
  } else if (data.drop_rate < 0.5 || data.drop_rate > 2.0) {
    status = 'Warning';
    alert = 'Drop rate out of normal range';
    status_color = '#fdcb6e';
  } else if (Math.abs(data.avg_drop_rate - data.drop_rate) > 0.3) {
    status = 'Warning';
    alert = 'Drop rate deviation detected';
    status_color = '#fdcb6e';
  }

  return { status, alert, status_color };
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ error: 'Method not allowed' }),
        {
          status: 405,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const sensorData: SensorData = await req.json();

    const prediction = detectAnomaly(sensorData);

    const { data, error } = await supabase
      .from('infus_monitoring')
      .insert({
        timestamp: sensorData.timestamp,
        drop_count: sensorData.drop_count,
        drop_rate: sensorData.drop_rate,
        avg_drop_rate: sensorData.avg_drop_rate,
        weight: sensorData.weight,
        delta_weight: sensorData.delta_weight,
        fluctuation_deviation: sensorData.fluctuation_deviation,
        status: prediction.status,
        alert: prediction.alert,
        status_color: prediction.status_color,
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        data,
        message: 'Data received and stored successfully' 
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Internal server error' 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});