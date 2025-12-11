/*
  # Fix WordPress Studio Blueprints RLS Policies

  1. Changes
    - Drop existing policies
    - Create new policies with explicit public access
    - Add policy for anon role to read blueprints
    - Add policy for anon role to insert blueprints

  2. Security
    - Allow anonymous users to read non-expired blueprints
    - Allow anonymous users to insert blueprints
    - Service role bypasses RLS automatically
*/

DROP POLICY IF EXISTS "Anyone can read blueprints" ON wordpress_studio_blueprints;
DROP POLICY IF EXISTS "Anyone can insert blueprints" ON wordpress_studio_blueprints;

CREATE POLICY "Public can read non-expired blueprints"
  ON wordpress_studio_blueprints
  FOR SELECT
  TO anon, authenticated
  USING (expires_at > now());

CREATE POLICY "Public can insert blueprints"
  ON wordpress_studio_blueprints
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);