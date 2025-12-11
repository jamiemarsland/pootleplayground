/*
  # Create WordPress Studio Blueprints Table

  1. New Tables
    - `wordpress_studio_blueprints`
      - `id` (uuid, primary key) - Unique identifier for the blueprint
      - `blueprint_data` (jsonb) - The blueprint JSON data
      - `created_at` (timestamptz) - When the blueprint was stored
      - `expires_at` (timestamptz) - When the blueprint should expire (5 minutes after creation)

  2. Security
    - Enable RLS on `wordpress_studio_blueprints` table
    - Add policy allowing anyone to read blueprints (public access for WordPress Studio)
    - Add policy allowing anyone to insert blueprints (needed for temporary storage)

  3. Notes
    - This table stores temporary blueprints for WordPress Studio
    - Blueprints expire after 5 minutes
    - No authentication required since WordPress Studio cannot authenticate
*/

CREATE TABLE IF NOT EXISTS wordpress_studio_blueprints (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  blueprint_data jsonb NOT NULL,
  created_at timestamptz DEFAULT now(),
  expires_at timestamptz DEFAULT (now() + interval '5 minutes')
);

ALTER TABLE wordpress_studio_blueprints ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read blueprints"
  ON wordpress_studio_blueprints
  FOR SELECT
  USING (expires_at > now());

CREATE POLICY "Anyone can insert blueprints"
  ON wordpress_studio_blueprints
  FOR INSERT
  WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_wordpress_studio_blueprints_expires_at 
  ON wordpress_studio_blueprints(expires_at);