/*
  # Fix Shared Links RLS Policies v2

  1. Changes
    - Drop ALL existing policies first
    - Recreate simplified policies that work with anonymous users
    - Allow public creation since we're using custom user_id header

  2. Security
    - Permissive policies for creating and reading links
    - Users can manage their own links
*/

DO $$ 
DECLARE 
  pol record;
BEGIN
  FOR pol IN 
    SELECT policyname 
    FROM pg_policies 
    WHERE tablename = 'shared_links' 
      AND schemaname = 'public'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON shared_links', pol.policyname);
  END LOOP;
END $$;

CREATE POLICY "public_read_shared_links"
  ON shared_links
  FOR SELECT
  USING (true);

CREATE POLICY "public_insert_shared_links"
  ON shared_links
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "public_update_shared_links"
  ON shared_links
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "user_delete_own_links"
  ON shared_links
  FOR DELETE
  USING (
    created_by = COALESCE(
      current_setting('request.headers', true)::json->>'x-user-id',
      'anonymous'
    )
  );