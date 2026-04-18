import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface InfusMonitoring {
  id: number;
  timestamp: string;        // Format: "0:0:3", "0:0:5" (duration)
  drop_count: number;
  drop_rate: number;
  avg_drop_rate: number;
  weight: number;
  delta_weight: number;
  fluctuation_deviation: number;
  status: string;          // "Normal", "Infus Habis (No Drip)", "Abnormal(stuck)", "Slow Drip"
  alert: string;           // "0" atau "1" (string)
  status_color: string;    // "green", "red", "orange", "yellow"
  created_at: string;      // "2025-10-18 13:05:33"
}