-- Create table for shortened links
CREATE TABLE public.links (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  original_url TEXT NOT NULL,
  short_code TEXT NOT NULL UNIQUE,
  clicks INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.links ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read links (needed for redirects)
CREATE POLICY "Links are publicly readable"
ON public.links
FOR SELECT
USING (true);

-- Allow anyone to insert links (no auth required for this app)
CREATE POLICY "Anyone can create links"
ON public.links
FOR INSERT
WITH CHECK (true);

-- Allow anyone to update click counts
CREATE POLICY "Anyone can update link clicks"
ON public.links
FOR UPDATE
USING (true);

-- Create index for fast short_code lookups
CREATE INDEX idx_links_short_code ON public.links(short_code);