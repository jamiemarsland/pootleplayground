/*
  # Add Voting System to Blueprints

  1. Changes
    - Add `votes` column to track upvote count
    - Add index on votes for efficient sorting
    - Update RLS policy to allow anyone to update vote counts
    
  2. Notes
    - Initial vote count defaults to 0
    - Vote tracking is simple count-based (no user tracking for now)
*/

-- Add votes column
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'blueprints' AND column_name = 'votes'
  ) THEN
    ALTER TABLE blueprints ADD COLUMN votes integer DEFAULT 0;
  END IF;
END $$;

-- Create index for sorting by votes
CREATE INDEX IF NOT EXISTS idx_blueprints_votes ON blueprints(votes DESC);

-- Drop existing update policy if it exists
DROP POLICY IF EXISTS "Anyone can update blueprints" ON blueprints;

-- Add policy to allow anyone to update votes
CREATE POLICY "Anyone can update blueprints"
  ON blueprints
  FOR UPDATE
  USING (true)
  WITH CHECK (true);