/*
  # Create Blueprints Table

  1. New Tables
    - `blueprints`
      - `id` (uuid, primary key) - Unique identifier for each blueprint
      - `title` (text) - The title of the blueprint
      - `description` (text) - Optional description of what the blueprint does
      - `blueprint_data` (jsonb) - The complete blueprint data (steps, config, etc.)
      - `landing_page_type` (text) - Either 'wp-admin' or 'front-page'
      - `step_count` (integer) - Number of steps in the blueprint
      - `is_public` (boolean) - Whether the blueprint appears in the public gallery
      - `created_at` (timestamptz) - When the blueprint was created
      - `updated_at` (timestamptz) - When the blueprint was last updated
      - `created_by` (text) - Creator name (optional, for future auth integration)
      
  2. Security
    - Enable RLS on `blueprints` table
    - Add policy for anyone to read public blueprints
    - Add policy for anyone to insert blueprints (for now, until auth is added)
    - Add policy for anyone to update/delete their own blueprints (for future auth)

  3. Indexes
    - Add index on `is_public` for efficient gallery queries
    - Add index on `created_at` for sorting
*/

CREATE TABLE IF NOT EXISTS blueprints (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text DEFAULT '',
  blueprint_data jsonb NOT NULL,
  landing_page_type text DEFAULT 'wp-admin',
  step_count integer DEFAULT 0,
  is_public boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  created_by text DEFAULT ''
);

ALTER TABLE blueprints ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read public blueprints"
  ON blueprints
  FOR SELECT
  USING (is_public = true);

CREATE POLICY "Anyone can insert blueprints"
  ON blueprints
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can update blueprints"
  ON blueprints
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Anyone can delete blueprints"
  ON blueprints
  FOR DELETE
  USING (true);

CREATE INDEX IF NOT EXISTS idx_blueprints_public ON blueprints(is_public);
CREATE INDEX IF NOT EXISTS idx_blueprints_created_at ON blueprints(created_at DESC);