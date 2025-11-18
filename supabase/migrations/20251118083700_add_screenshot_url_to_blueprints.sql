/*
  # Add Screenshot URL to Blueprints Table

  1. Changes
    - Add `screenshot_url` column to `blueprints` table
      - Stores URL to a screenshot image of the blueprint site
      - Optional field (can be null)
      - Allows blueprints to display visual previews in the gallery
    
  2. Notes
    - Screenshots can be hosted on external services like Pexels, Unsplash, or uploaded to Supabase Storage
    - This enhances the gallery view with visual previews
    - Existing blueprints will have null screenshot_url by default
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'blueprints' AND column_name = 'screenshot_url'
  ) THEN
    ALTER TABLE blueprints ADD COLUMN screenshot_url text DEFAULT NULL;
  END IF;
END $$;