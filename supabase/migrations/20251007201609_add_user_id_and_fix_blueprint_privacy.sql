/*
  # Add User ID and Fix Blueprint Privacy

  1. Changes
    - Add `user_id` column to track blueprint ownership
    - Update RLS policies to separate private and public blueprint access
    - Private blueprints (is_public = false) can only be seen by their creator
    - Public blueprints (is_public = true) can be seen by everyone

  2. Security
    - Users can only read their own private blueprints
    - All users can read public blueprints
    - Users can insert both public and private blueprints
    - Users can only update/delete their own blueprints

  3. Important Notes
    - For now, user_id will be stored in localStorage and set by the application
    - This allows blueprint privacy without requiring full authentication
    - Future enhancement: integrate with Supabase Auth when authentication is added
*/

-- Add user_id column to track blueprint ownership
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'blueprints' AND column_name = 'user_id'
  ) THEN
    ALTER TABLE blueprints ADD COLUMN user_id text DEFAULT '';
  END IF;
END $$;

-- Drop existing policies
DROP POLICY IF EXISTS "Anyone can read all blueprints" ON blueprints;
DROP POLICY IF EXISTS "Anyone can insert blueprints" ON blueprints;
DROP POLICY IF EXISTS "Anyone can update blueprints" ON blueprints;

-- Create new policies that respect privacy

-- SELECT: Users can read public blueprints OR their own private blueprints
CREATE POLICY "Users can read public blueprints or their own"
  ON blueprints
  FOR SELECT
  USING (is_public = true OR user_id = current_setting('app.user_id', true));

-- INSERT: Anyone can insert blueprints (with their user_id)
CREATE POLICY "Users can insert their own blueprints"
  ON blueprints
  FOR INSERT
  WITH CHECK (true);

-- UPDATE: Users can only update their own blueprints
CREATE POLICY "Users can update their own blueprints"
  ON blueprints
  FOR UPDATE
  USING (user_id = current_setting('app.user_id', true))
  WITH CHECK (user_id = current_setting('app.user_id', true));

-- DELETE: Users can only delete their own blueprints
CREATE POLICY "Users can delete their own blueprints"
  ON blueprints
  FOR DELETE
  USING (user_id = current_setting('app.user_id', true));

-- Create index on user_id for efficient queries
CREATE INDEX IF NOT EXISTS idx_blueprints_user_id ON blueprints(user_id);
