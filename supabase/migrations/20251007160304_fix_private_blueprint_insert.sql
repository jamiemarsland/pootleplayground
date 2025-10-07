/*
  # Fix Private Blueprint Insert Issue

  1. Changes
    - Update SELECT policy to allow reading all blueprints (both public and private)
    - This allows users to save private blueprints and still retrieve the ID after insert
    - Gallery filtering by is_public is handled at the application level

  2. Security
    - All blueprints can be read (necessary for tracking saved blueprints)
    - Insert, update, and delete policies remain unchanged
    - Gallery displays only public blueprints via application-level filtering
*/

-- Drop the existing read policy that only allows public blueprints
DROP POLICY IF EXISTS "Anyone can read public blueprints" ON blueprints;

-- Create new policy that allows reading all blueprints
CREATE POLICY "Anyone can read all blueprints"
  ON blueprints
  FOR SELECT
  USING (true);
