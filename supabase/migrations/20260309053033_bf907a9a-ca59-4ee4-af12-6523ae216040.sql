
-- Add new columns to links table
ALTER TABLE public.links 
  ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  ADD COLUMN max_clicks INTEGER DEFAULT NULL,
  ADD COLUMN is_active BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN last_accessed_at TIMESTAMP WITH TIME ZONE DEFAULT NULL;

-- Drop old permissive policies
DROP POLICY IF EXISTS "Anyone can create links" ON public.links;
DROP POLICY IF EXISTS "Anyone can update link clicks" ON public.links;
DROP POLICY IF EXISTS "Links are publicly readable" ON public.links;

-- New RLS policies: owners manage their links, public can read for redirect
CREATE POLICY "Public can read active links for redirect"
  ON public.links FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can create links"
  ON public.links FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Owners can update their links"
  ON public.links FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Owners can delete their links"
  ON public.links FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);
