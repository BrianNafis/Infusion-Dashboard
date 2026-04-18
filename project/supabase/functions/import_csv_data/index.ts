import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

interface CsvRow {
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

function parseCSV(csvText: string): CsvRow[] {
  const lines = csvText.split('\n').filter(line => line.trim());
  const headers = lines[0].split(',').map(h => h.replace(/"/g, '').trim());
  const rows: CsvRow[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values: string[] = [];
    let current = '';
    let inQuotes = false;

    for (const char of lines[i]) {
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        values.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    values.push(current.trim());

    if (values.length === headers.length) {
      const row: any = {};
      headers.forEach((header, index) => {
        row[header] = values[index].replace(/"/g, '');
      });
      rows.push(row as CsvRow);
    }
  }

  return rows;
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return new Response(
        JSON.stringify({ error: 'No file provided' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const csvText = await file.text();
    const rows = parseCSV(csvText);

    const batchSize = 100;
    let imported = 0;
    let errors = 0;

    for (let i = 0; i < rows.length; i += batchSize) {
      const batch = rows.slice(i, i + batchSize);
      const records = batch.map(row => {
        const statusColorMap: Record<string, string> = {
          'green': '#00b894',
          'red': '#d63031',
          'orange': '#fdcb6e'
        };

        return {
          timestamp: new Date().toISOString(),
          drop_count: parseInt(row.drop_count) || 0,
          drop_rate: parseFloat(row.drop_rate) || 0,
          avg_drop_rate: parseFloat(row.avg_drop_rate) || 0,
          weight: parseFloat(row.weight) || 0,
          delta_weight: parseFloat(row.delta_weight) || 0,
          fluctuation_deviation: parseFloat(row.fluctuation_deviation) || 0,
          status: row.status === '0' ? 'Normal' : row.status,
          alert: row.alert === '0' ? '' : row.alert === '1' ? 'Anomaly detected' : row.alert,
          status_color: statusColorMap[row.status_color.toLowerCase()] || '#00b894',
        };
      });

      const { error } = await supabase
        .from('infus_monitoring')
        .insert(records);

      if (error) {
        console.error(`Batch error:`, error);
        errors += batch.length;
      } else {
        imported += batch.length;
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        imported,
        errors,
        total: rows.length,
        message: `Successfully imported ${imported} records`
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