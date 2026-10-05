/*
  # Redirects & Verification Tags — SEOPress/LV SEO parity

  1. New Tables
    - `seo_redirects` — source -> destination URL redirects (301/302), the
      one piece of SEOPress-equivalent functionality this app had none of.
      Path normalisation follows the same rule as WordPress's Redirection
      plugin and the `heaventree/laravel-seo` package, so rules carried
      over from a migration match exactly as they did on the old platform.

  2. Altered Tables
    - `seo_global_settings` gains the remaining search-engine verification
      tags (Bing, Yandex, Pinterest, Facebook — only Google Search Console
      existed before) and a site-wide `discourage_search_engines` flag,
      bound to the hostname it was enabled for so a copied database can't
      silently carry it into production.

  3. Security
    - Enable RLS on `seo_redirects`, same authenticated-only policy shape
      as the existing SEO tables.
*/

CREATE TABLE IF NOT EXISTS seo_redirects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source_path text UNIQUE NOT NULL,
  destination_path text NOT NULL,
  status_code integer NOT NULL DEFAULT 301 CHECK (status_code IN (301, 302, 307, 308)),
  enabled boolean DEFAULT true,
  hit_count integer DEFAULT 0,
  last_hit_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE seo_redirects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "View seo redirects"
  ON seo_redirects FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Manage seo redirects"
  ON seo_redirects FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_seo_redirects_source_path ON seo_redirects(source_path);
CREATE INDEX IF NOT EXISTS idx_seo_redirects_enabled ON seo_redirects(enabled);

ALTER TABLE seo_global_settings
  ADD COLUMN IF NOT EXISTS bing_verification text,
  ADD COLUMN IF NOT EXISTS yandex_verification text,
  ADD COLUMN IF NOT EXISTS pinterest_verification text,
  ADD COLUMN IF NOT EXISTS facebook_verification text,
  ADD COLUMN IF NOT EXISTS discourage_search_engines boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS discourage_hostname text;

-- `generated_by_ai` backs the Bulk Operations view's "AI Status" column,
-- which already existed in code (BulkOperationsView.SeoPageRecord) with no
-- backing column anywhere -- the UI was built against a shape the schema
-- never had.
ALTER TABLE seo_pages
  ADD COLUMN IF NOT EXISTS generated_by_ai boolean DEFAULT false;

-- Traceability for a queued job back to what triggered it (a template ID
-- for a bulk-generation run, a page ID for a single-page audit, etc.) --
-- the job queue existed with no way to tell what a given job was *for*.
ALTER TABLE seo_bulk_jobs
  ADD COLUMN IF NOT EXISTS source_id text;
