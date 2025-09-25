-- Create pulsedelta table in Supabase
CREATE TABLE pulsedelta (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  market_address TEXT,                    -- Will be empty initially
  market_id INTEGER,                      -- On-chain market ID
  category TEXT NOT NULL,                 -- crypto, sports, trends
  market_type TEXT NOT NULL,              -- binary, multi, scalar
  tags TEXT[],                            -- Array of tags
  resolution_source TEXT,                 -- UI reference
  template_name TEXT,                     -- Template name
  creator_address TEXT NOT NULL,          -- Creator's wallet address
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_pulsedelta_address ON pulsedelta(market_address);
CREATE INDEX idx_pulsedelta_category ON pulsedelta(category);
CREATE INDEX idx_pulsedelta_creator ON pulsedelta(creator_address);
CREATE INDEX idx_pulsedelta_type ON pulsedelta(market_type);

-- Enable Row Level Security (RLS)
ALTER TABLE pulsedelta ENABLE ROW LEVEL SECURITY;

-- Create policy to allow anyone to read market metadata
CREATE POLICY "Allow public read access" ON pulsedelta
  FOR SELECT USING (true);

-- Create policy to allow users to insert their own market metadata
CREATE POLICY "Allow users to insert own metadata" ON pulsedelta
  FOR INSERT WITH CHECK (auth.uid()::text = creator_address);

-- Create policy to allow users to update their own market metadata
CREATE POLICY "Allow users to update own metadata" ON pulsedelta
  FOR UPDATE USING (auth.uid()::text = creator_address);
