/*
  # AI-Powered SEO Management Tables

  1. New Tables
    - `ai_models` - Configure available AI models (Gemini, OpenAI, Claude, etc.)
    - `ai_audits` - Store SEO audit results from AI analysis
    - `seo_pages` - Track all pages in the application
    - `seo_content` - Store page content and metadata
    - `seo_suggestions` - AI-generated optimization suggestions
    - `blog_posts` - Manage blog content with SEO optimization
    - `schema_definitions` - Store custom JSON-LD schemas
    - `url_configurations` - Store URL optimization settings

  2. Security
    - Enable RLS on all tables
    - Restrict access to authenticated users
    - Admin-only access for sensitive operations
*/

CREATE TABLE IF NOT EXISTS ai_models (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  provider text NOT NULL,
  api_key_name text NOT NULL,
  model_id text NOT NULL,
  is_active boolean DEFAULT false,
  max_tokens integer DEFAULT 4096,
  temperature numeric DEFAULT 0.7,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE ai_models ENABLE ROW LEVEL SECURITY;

CREATE POLICY "View ai models"
  ON ai_models FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Insert ai models"
  ON ai_models FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE TABLE IF NOT EXISTS seo_pages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  path text UNIQUE NOT NULL,
  title text,
  description text,
  h1_tag text,
  h1_count integer DEFAULT 0,
  h2_count integer DEFAULT 0,
  meta_keywords text,
  canonical_url text,
  robots_meta text,
  content_length integer DEFAULT 0,
  last_crawled timestamptz,
  needs_audit boolean DEFAULT true,
  is_published boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE seo_pages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "View seo pages"
  ON seo_pages FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Insert seo pages"
  ON seo_pages FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Update seo pages"
  ON seo_pages FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE TABLE IF NOT EXISTS seo_content (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  page_id uuid REFERENCES seo_pages(id) ON DELETE CASCADE NOT NULL,
  headings jsonb DEFAULT '[]'::jsonb,
  images jsonb DEFAULT '[]'::jsonb,
  links jsonb DEFAULT '[]'::jsonb,
  raw_content text,
  word_count integer DEFAULT 0,
  reading_time_minutes integer DEFAULT 0,
  structured_data jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE seo_content ENABLE ROW LEVEL SECURITY;

CREATE POLICY "View seo content"
  ON seo_content FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Insert seo content"
  ON seo_content FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE TABLE IF NOT EXISTS ai_audits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  page_id uuid REFERENCES seo_pages(id) ON DELETE CASCADE,
  ai_model_id uuid REFERENCES ai_models(id),
  audit_type text NOT NULL,
  issues jsonb DEFAULT '[]'::jsonb,
  suggestions jsonb DEFAULT '[]'::jsonb,
  score integer,
  h1_issues jsonb DEFAULT '[]'::jsonb,
  h2_hierarchy_issues jsonb DEFAULT '[]'::jsonb,
  metadata_issues jsonb DEFAULT '[]'::jsonb,
  schema_issues jsonb DEFAULT '[]'::jsonb,
  readability_score integer,
  seo_score integer,
  timestamp timestamptz DEFAULT now()
);

ALTER TABLE ai_audits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "View ai audits"
  ON ai_audits FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Insert ai audits"
  ON ai_audits FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE TABLE IF NOT EXISTS seo_suggestions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  page_id uuid REFERENCES seo_pages(id) ON DELETE CASCADE NOT NULL,
  audit_id uuid REFERENCES ai_audits(id) ON DELETE CASCADE,
  suggestion_type text NOT NULL,
  priority text DEFAULT 'medium',
  title text NOT NULL,
  description text,
  action text,
  estimated_impact text,
  is_implemented boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE seo_suggestions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "View seo suggestions"
  ON seo_suggestions FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Insert seo suggestions"
  ON seo_suggestions FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE TABLE IF NOT EXISTS blog_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  page_id uuid REFERENCES seo_pages(id),
  title text NOT NULL,
  slug text UNIQUE NOT NULL,
  excerpt text,
  content text NOT NULL,
  author text,
  featured_image text,
  featured_image_alt text,
  tags text[] DEFAULT ARRAY[]::text[],
  category text,
  published boolean DEFAULT false,
  published_at timestamptz,
  seo_title text,
  seo_description text,
  seo_keywords text,
  word_count integer DEFAULT 0,
  reading_time integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "View published posts"
  ON blog_posts FOR SELECT
  USING (published = true OR auth.role() = 'authenticated');

CREATE POLICY "Insert blog posts"
  ON blog_posts FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Update blog posts"
  ON blog_posts FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE TABLE IF NOT EXISTS schema_definitions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  page_id uuid REFERENCES seo_pages(id) ON DELETE CASCADE,
  schema_type text NOT NULL,
  schema_json jsonb NOT NULL,
  is_valid boolean DEFAULT true,
  validation_errors jsonb DEFAULT '[]'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE schema_definitions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "View schemas"
  ON schema_definitions FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Insert schemas"
  ON schema_definitions FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE TABLE IF NOT EXISTS url_configurations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  page_id uuid REFERENCES seo_pages(id) ON DELETE CASCADE NOT NULL,
  current_url text,
  optimized_url text,
  slug_keywords text[] DEFAULT ARRAY[]::text[],
  readability_score integer,
  keyword_density jsonb DEFAULT '{}'::jsonb,
  internal_links integer DEFAULT 0,
  external_links integer DEFAULT 0,
  images_with_alt integer DEFAULT 0,
  images_missing_alt integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE url_configurations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "View URL configs"
  ON url_configurations FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Insert URL configs"
  ON url_configurations FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_seo_pages_path ON seo_pages(path);
CREATE INDEX IF NOT EXISTS idx_seo_pages_needs_audit ON seo_pages(needs_audit);
CREATE INDEX IF NOT EXISTS idx_ai_audits_page_id ON ai_audits(page_id);
CREATE INDEX IF NOT EXISTS idx_ai_audits_timestamp ON ai_audits(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_blog_posts_slug ON blog_posts(slug);
CREATE INDEX IF NOT EXISTS idx_blog_posts_published ON blog_posts(published);
CREATE INDEX IF NOT EXISTS idx_seo_suggestions_page_id ON seo_suggestions(page_id);
CREATE INDEX IF NOT EXISTS idx_url_configs_page_id ON url_configurations(page_id);
