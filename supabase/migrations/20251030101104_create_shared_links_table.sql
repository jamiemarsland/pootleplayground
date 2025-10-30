/*
  # Create Shared Links Table for URL Shortening

  1. New Tables
    - `shared_links`
      - `id` (uuid, primary key) - Unique identifier for the shared link
      - `short_code` (text, unique, indexed) - The short code used in the URL (e.g., "abc123")
      - `blueprint_id` (uuid, nullable) - Reference to the blueprints table if the link is for a saved blueprint
      - `full_url` (text) - The complete playground.wordpress.net URL with encoded blueprint
      - `blueprint_data` (jsonb, nullable) - Snapshot of the blueprint data for direct sharing
      - `created_at` (timestamptz) - When the link was created
      - `created_by` (text) - User ID who created the link
      - `click_count` (integer) - Number of times this link has been accessed
      - `last_accessed_at` (timestamptz, nullable) - Last time the link was clicked

  2. Security
    - Enable RLS on `shared_links` table
    - Add policy for public read access (anyone can access shared links)
    - Add policy for authenticated users to create their own links
    - Add policy for users to view and manage their own links
    - Add policy for users to increment click counts (public access needed for redirect)

  3. Indexes
    - Unique index on `short_code` for fast lookups
    - Index on `created_by` for user's link management dashboard
    - Index on `blueprint_id` for blueprint-to-link relationships
*/

CREATE TABLE IF NOT EXISTS shared_links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  short_code text UNIQUE NOT NULL,
  blueprint_id uuid REFERENCES blueprints(id) ON DELETE SET NULL,
  full_url text NOT NULL,
  blueprint_data jsonb,
  created_at timestamptz DEFAULT now(),
  created_by text NOT NULL,
  click_count integer DEFAULT 0,
  last_accessed_at timestamptz
);

ALTER TABLE shared_links ENABLE ROW LEVEL SECURITY;

CREATE UNIQUE INDEX IF NOT EXISTS shared_links_short_code_idx ON shared_links(short_code);
CREATE INDEX IF NOT EXISTS shared_links_created_by_idx ON shared_links(created_by);
CREATE INDEX IF NOT EXISTS shared_links_blueprint_id_idx ON shared_links(blueprint_id);

CREATE POLICY "Anyone can read shared links"
  ON shared_links
  FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can create shared links"
  ON shared_links
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can view their own shared links"
  ON shared_links
  FOR SELECT
  USING (created_by = current_setting('request.headers')::json->>'x-user-id');

CREATE POLICY "Users can update their own shared links"
  ON shared_links
  FOR UPDATE
  USING (created_by = current_setting('request.headers')::json->>'x-user-id')
  WITH CHECK (created_by = current_setting('request.headers')::json->>'x-user-id');

CREATE POLICY "Users can delete their own shared links"
  ON shared_links
  FOR DELETE
  USING (created_by = current_setting('request.headers')::json->>'x-user-id');

CREATE POLICY "Anyone can increment click counts"
  ON shared_links
  FOR UPDATE
  USING (true)
  WITH CHECK (true);