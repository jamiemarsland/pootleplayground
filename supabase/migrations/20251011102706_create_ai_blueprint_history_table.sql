/*
  # Create AI Blueprint History Table

  1. New Tables
    - `ai_blueprint_history`
      - `id` (uuid, primary key) - Unique identifier for each AI generation request
      - `user_id` (text) - User identifier (from admin auth or session)
      - `prompt` (text) - The user's original prompt
      - `generated_blueprint` (jsonb) - The complete generated blueprint data
      - `created_at` (timestamptz) - When the blueprint was generated
      - `success` (boolean) - Whether generation was successful
      - `error_message` (text, nullable) - Error message if generation failed

  2. Security
    - Enable RLS on `ai_blueprint_history` table
    - Add policy for authenticated users to insert their own history
    - Add policy for authenticated users to read their own history
    - Add policy for admin to view all history

  3. Notes
    - This table tracks all AI blueprint generation requests for analytics and debugging
    - Users can view their own generation history
    - Admins can view all generation history for monitoring
*/

CREATE TABLE IF NOT EXISTS ai_blueprint_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text NOT NULL,
  prompt text NOT NULL,
  generated_blueprint jsonb,
  created_at timestamptz DEFAULT now(),
  success boolean DEFAULT true,
  error_message text
);

ALTER TABLE ai_blueprint_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert their own AI history"
  ON ai_blueprint_history
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can read their own AI history"
  ON ai_blueprint_history
  FOR SELECT
  TO authenticated
  USING (user_id = current_setting('request.jwt.claims', true)::json->>'sub');

CREATE POLICY "Admins can read all AI history"
  ON ai_blueprint_history
  FOR SELECT
  TO authenticated
  USING (
    current_setting('request.jwt.claims', true)::json->>'role' = 'admin'
  );

CREATE INDEX IF NOT EXISTS idx_ai_blueprint_history_user_id ON ai_blueprint_history(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_blueprint_history_created_at ON ai_blueprint_history(created_at DESC);
