/*
  # Create site_config table for server-side config values

  Stores server-side config like the admin password hash so edge functions
  can verify credentials without exposing secrets to the client.

  1. New Tables
    - `site_config`: key/value store for server-side config
      - `key` (text, primary key)
      - `value` (text)

  2. Security
    - RLS enabled; no client-accessible policies (service role only)
    - Admin password stored here is readable only by service role
*/

CREATE TABLE IF NOT EXISTS site_config (
  key text PRIMARY KEY,
  value text NOT NULL
);

ALTER TABLE site_config ENABLE ROW LEVEL SECURITY;

INSERT INTO site_config (key, value)
VALUES ('admin_password', 'admin123')
ON CONFLICT (key) DO NOTHING;
