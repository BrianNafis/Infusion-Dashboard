/*
  # IoT Infusion Monitoring System Database Schema

  1. New Tables
    - `infus_monitoring`
      - `id` (bigint, primary key, auto-increment)
      - `timestamp` (timestamptz) - Waktu pengukuran dari sensor
      - `drop_count` (integer) - Jumlah tetesan
      - `drop_rate` (real) - Laju tetesan per detik
      - `avg_drop_rate` (real) - Rata-rata laju tetesan
      - `weight` (real) - Berat cairan infus (gram)
      - `delta_weight` (real) - Perubahan berat
      - `fluctuation_deviation` (real) - Deviasi fluktuasi
      - `status` (text) - Status deteksi (Normal/Warning/Anomaly)
      - `alert` (text) - Pesan alert jika ada anomali
      - `status_color` (text) - Warna status (#00b894/#fdcb6e/#d63031)
      - `created_at` (timestamptz) - Waktu data masuk ke database
      
  2. Security
    - Enable RLS on `infus_monitoring` table
    - Add policy for public read access (dashboard)
    - Add policy for authenticated insert (ESP32 via service role)
    
  3. Indexes
    - Index on timestamp for faster query by time range
    - Index on created_at for latest data queries
*/

CREATE TABLE IF NOT EXISTS infus_monitoring (
  id bigserial PRIMARY KEY,
  timestamp timestamptz NOT NULL,
  drop_count integer NOT NULL DEFAULT 0,
  drop_rate real NOT NULL DEFAULT 0,
  avg_drop_rate real NOT NULL DEFAULT 0,
  weight real NOT NULL DEFAULT 0,
  delta_weight real NOT NULL DEFAULT 0,
  fluctuation_deviation real NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'Normal',
  alert text DEFAULT '',
  status_color text NOT NULL DEFAULT '#00b894',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE infus_monitoring ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access"
  ON infus_monitoring
  FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Allow authenticated insert"
  ON infus_monitoring
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow service role all access"
  ON infus_monitoring
  FOR ALL
  TO service_role
  WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_infus_monitoring_timestamp 
  ON infus_monitoring(timestamp DESC);

CREATE INDEX IF NOT EXISTS idx_infus_monitoring_created_at 
  ON infus_monitoring(created_at DESC);
