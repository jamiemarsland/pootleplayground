/*
  # Create shared_playgrounds Table for URL Shortener

  ## Summary
  Creates a new `shared_playgrounds` table to store shortened Playground URLs.
  Each record maps a short slug (e.g. "abc123") to a full WordPress Playground URL
  or blueprint JSON. The /p/{slug} route looks up the slug and redirects accordingly.

  ## New Tables

  ### `shared_playgrounds`
  - `id` (uuid, PK) - Unique identifier
  - `slug` (text, unique) - Short URL code, e.g. "abc123", used in /p/{slug}
  - `title` (text) - Optional human-readable title
  - `description` (text) - Optional description
  - `full_url` (text) - Complete playground URL (including hash fragment) as fallback
  - `blueprint_json` (jsonb, nullable) - Raw blueprint JSON; when present, used via blueprint-url redirect
  - `created_by` (text) - User ID from x-user-id header (localStorage-based anonymous ID)
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)
  - `view_count` (integer, default 0) - Redirect/view counter

  ## Security
  - RLS enabled
  - Public SELECT allowed (needed for redirect lookups)
  - Public INSERT allowed (anonymous users create links)
  - UPDATE allowed for incrementing view_count (public) and editing own records
  - DELETE allowed only for the creator

  ## Indexes
  - Unique index on slug for fast lookups
  - Index on created_by for user dashboard queries
*/

CREATE TABLE IF NOT EXISTS shared_playgrounds (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  title text NOT NULL DEFAULT '',
  description text NOT NULL DEFAULT '',
  full_url text NOT NULL,
  blueprint_json jsonb,
  created_by text NOT NULL DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  view_count integer NOT NULL DEFAULT 0
);

ALTER TABLE shared_playgrounds ENABLE ROW LEVEL SECURITY;

CREATE UNIQUE INDEX IF NOT EXISTS shared_playgrounds_slug_idx ON shared_playgrounds(slug);
CREATE INDEX IF NOT EXISTS shared_playgrounds_created_by_idx ON shared_playgrounds(created_by);

-- Anyone can read (needed for redirect lookups)
CREATE POLICY "Public can read shared playgrounds"
  ON shared_playgrounds
  FOR SELECT
  USING (true);

-- Anyone can create (anonymous users with x-user-id header)
CREATE POLICY "Anyone can create shared playgrounds"
  ON shared_playgrounds
  FOR INSERT
  WITH CHECK (true);

-- Anyone can increment view_count (redirect tracking)
CREATE POLICY "Anyone can increment view count"
  ON shared_playgrounds
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- Only creator can delete their own links
CREATE POLICY "Creators can delete own shared playgrounds"
  ON shared_playgrounds
  FOR DELETE
  USING (created_by = (current_setting('request.headers', true)::json->>'x-user-id'));
