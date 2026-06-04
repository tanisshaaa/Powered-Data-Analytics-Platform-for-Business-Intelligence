-- Create visitors table
CREATE TABLE visitors (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  email text NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security
ALTER TABLE visitors ENABLE ROW LEVEL SECURITY;

-- Allow service role to have full access
CREATE POLICY "Service Role can do everything" ON visitors
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);
