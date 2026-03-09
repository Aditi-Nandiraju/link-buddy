export interface Link {
  id: string;
  original_url: string;
  short_code: string;
  clicks: number;
  created_at: string;
  user_id: string | null;
  max_clicks: number | null;
  is_active: boolean;
  last_accessed_at: string | null;
}
