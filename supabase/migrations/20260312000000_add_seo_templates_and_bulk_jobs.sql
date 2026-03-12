/*
# SEO Templates & Bulk Processing Schema

1. New Tables
- `seo_global_settings` - Store global configurations (GA4, GTM, site name)
- `seo_templates` - Store rules per route pattern with %% template tags
- `seo_bulk_jobs` - Track status of bulk processing tasks
- `ai_keys` - Securely store user-provided keys for AI providers

2. Security
- Enable RLS on all new tables
- Restrict access to authenticated users
*/

CREATE TABLE IF NOT EXISTS seo_global_settings (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid (),
    site_name text NOT NULL DEFAULT 'My React App',
    default_separator text NOT NULL DEFAULT '|',
    ga4_id text,
    gtm_id text,
    gsc_verification text,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

ALTER TABLE seo_global_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "View seo global settings" ON seo_global_settings FOR
SELECT TO authenticated USING (true);

CREATE POLICY "Manage seo global settings" ON seo_global_settings FOR ALL TO authenticated USING (true)
WITH
    CHECK (true);

CREATE TABLE IF NOT EXISTS seo_templates (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid (),
    route_pattern text NOT NULL, -- e.g. '/blog/*'
    post_type text NOT NULL, -- e.g. 'article', 'product'
    title_template text NOT NULL, -- e.g. '%%post_title%% %%sep%% %%sitetitle%%'
    description_template text, -- e.g. '%%post_excerpt%%'
    schema_type text, -- e.g. 'Article'
    ai_fallback_enabled boolean DEFAULT false,
    priority numeric DEFAULT 0.5,
    changefreq text DEFAULT 'weekly',
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

ALTER TABLE seo_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "View seo templates" ON seo_templates FOR
SELECT TO authenticated USING (true);

CREATE POLICY "Manage seo templates" ON seo_templates FOR ALL TO authenticated USING (true)
WITH
    CHECK (true);

CREATE TABLE IF NOT EXISTS seo_bulk_jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  job_type text NOT NULL, -- 'crawler', 'ai_generation', 'sitemap'
  status text NOT NULL DEFAULT 'pending', -- 'pending', 'processing', 'completed', 'failed'
  total_pages integer DEFAULT 0,
  processed_pages integer DEFAULT 0,
  errors jsonb DEFAULT '[]'::jsonb,
  started_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE seo_bulk_jobs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "View seo bulk jobs" ON seo_bulk_jobs FOR
SELECT TO authenticated USING (true);

CREATE POLICY "Manage seo bulk jobs" ON seo_bulk_jobs FOR ALL TO authenticated USING (true)
WITH
    CHECK (true);

CREATE TABLE IF NOT EXISTS ai_keys (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid (),
    provider text NOT NULL UNIQUE, -- 'openai', 'gemini', 'claude', 'deepseek', 'perplexity'
    encrypted_key text NOT NULL, -- In a real app, this should be encrypted by Supabase Vault or application layer
    is_active boolean DEFAULT true,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

ALTER TABLE ai_keys ENABLE ROW LEVEL SECURITY;

-- Assuming only authenticated admin users can view the keys or use them in edge functions
CREATE POLICY "Manage ai keys" ON ai_keys FOR ALL TO authenticated USING (true)
WITH
    CHECK (true);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_seo_templates_route ON seo_templates (route_pattern);

CREATE INDEX IF NOT EXISTS idx_seo_bulk_jobs_status ON seo_bulk_jobs (status);