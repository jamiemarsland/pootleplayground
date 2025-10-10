/*
  # Fix Critical Security Vulnerability in Blueprints RLS Policies

  ## Problem
  Current policies allow ANY user to:
  - Delete ANY blueprint (DELETE with qual = true)
  - Update ANY blueprint (UPDATE with qual = true)
  - The policies don't validate user_id ownership

  ## Solution
  1. Drop all existing insecure policies
  2. Create new restrictive policies that:
     - Allow public SELECT only for public blueprints
     - Allow INSERT for anyone (with user_id set)
     - Allow UPDATE only for blueprint owners (user_id match)
     - Allow DELETE only for blueprint owners (user_id match)

  ## Security Changes
  - SELECT: Only public blueprints OR owned blueprints
  - INSERT: Anyone can insert WITH their user_id
  - UPDATE: Only owner can update (user_id must match)
  - DELETE: Only owner can delete (user_id must match)
*/

-- Drop all existing insecure policies
DROP POLICY IF EXISTS "Allow reading all blueprints" ON blueprints;
DROP POLICY IF EXISTS "Allow inserting blueprints" ON blueprints;
DROP POLICY IF EXISTS "Allow updating blueprints" ON blueprints;
DROP POLICY IF EXISTS "Allow deleting blueprints" ON blueprints;

-- SELECT: Allow reading public blueprints OR blueprints owned by the current user
CREATE POLICY "Users can view public blueprints"
  ON blueprints
  FOR SELECT
  TO public
  USING (is_public = true);

CREATE POLICY "Users can view their own blueprints"
  ON blueprints
  FOR SELECT
  TO public
  USING (user_id = current_setting('request.headers', true)::json->>'x-user-id');

-- INSERT: Anyone can insert blueprints with their user_id
CREATE POLICY "Users can create blueprints"
  ON blueprints
  FOR INSERT
  TO public
  WITH CHECK (user_id = current_setting('request.headers', true)::json->>'x-user-id');

-- UPDATE: Only owners can update their blueprints
CREATE POLICY "Users can update own blueprints"
  ON blueprints
  FOR UPDATE
  TO public
  USING (user_id = current_setting('request.headers', true)::json->>'x-user-id')
  WITH CHECK (user_id = current_setting('request.headers', true)::json->>'x-user-id');

-- DELETE: Only owners can delete their blueprints
CREATE POLICY "Users can delete own blueprints"
  ON blueprints
  FOR DELETE
  TO public
  USING (user_id = current_setting('request.headers', true)::json->>'x-user-id');
