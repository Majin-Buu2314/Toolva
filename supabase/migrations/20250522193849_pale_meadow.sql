/*
  # Add persona and recommendation tables

  1. New Tables
    - `personas`
      - `id` (uuid, primary key)
      - `name` (text)
      - `description` (text)
      - `icon_name` (text)
      - `skills` (text[])
      - `tools` (text[])
      - `workflows` (text[])
      - `created_at` (timestamp)

    - `recommendations`
      - `id` (uuid, primary key)
      - `persona_id` (uuid, references personas)
      - `title` (text)
      - `description` (text)
      - `tools` (jsonb)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
*/

-- Personas Table
CREATE TABLE IF NOT EXISTS personas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text NOT NULL,
  icon_name text NOT NULL,
  skills text[] NOT NULL,
  tools text[] NOT NULL,
  workflows text[] NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Recommendations Table
CREATE TABLE IF NOT EXISTS recommendations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  persona_id uuid REFERENCES personas NOT NULL,
  title text NOT NULL,
  description text NOT NULL,
  tools jsonb NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE personas ENABLE ROW LEVEL SECURITY;
ALTER TABLE recommendations ENABLE ROW LEVEL SECURITY;

-- Personas Policies
CREATE POLICY "Anyone can view personas"
  ON personas FOR SELECT
  TO authenticated
  USING (true);

-- Recommendations Policies
CREATE POLICY "Anyone can view recommendations"
  ON recommendations FOR SELECT
  TO authenticated
  USING (true);