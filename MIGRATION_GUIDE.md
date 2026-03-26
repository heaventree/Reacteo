# Reacteo Migration Guide

Guide for upgrading to Reacteo 2.0 with the production plugin from niimo.io.

---

## Table of Contents

- [What's New in 2.0](#whats-new-in-20)
- [Breaking Changes](#breaking-changes)
- [Migration Paths](#migration-paths)
  - [From 1.x to 2.0](#from-1x-to-20)
  - [From Custom SEO Setup](#from-custom-seo-setup)
  - [From react-helmet to Reacteo](#from-react-helmet-to-reacteo)
- [Feature Migrations](#feature-migrations)
- [Database Migrations](#database-migrations)
- [Rollback Instructions](#rollback-instructions)

---

## What's New in 2.0

### 🆕 Production Plugin

Battle-tested implementation from [niimo.io](https://niimo.io) with:
- **Server-side meta injection** for full crawler support
- **Client-side live sync** for SPA navigation
- **Proven solutions** to all common SEO pitfalls
- **Complete documentation** of encountered issues and fixes

### 🎯 Enhanced Features

- Improved TypeScript types
- Better error handling
- Enhanced template engine
- More structured data builders
- Comprehensive admin dashboard updates
- Better AI provider integration

### 📦 Package Updates

- New package exports for plugin components
- Enhanced documentation
- Installation guide
- API reference
- This migration guide

---

## Breaking Changes

### 1. Package Version

```diff
- "reacteo": "^1.0.0"
+ "reacteo": "^2.0.0"
```

### 2. Import Paths (Optional)

Plugin components now have a dedicated export:

```diff
- import { useSeoMeta } from 'reacteo'
+ import { useSeoMeta } from 'reacteo/plugin'
```

**Note:** Core library imports remain unchanged.

### 3. Database Schema

New tables added in v2.0:
- `seo_global_settings` (enhanced)
- `seo_bulk_jobs` (new)
- Additional fields in existing tables

**Migration required:** Run the new migrations.

### 4. Edge Functions

Updated Edge Functions with improved error handling and multi-provider support.

**Action required:** Redeploy all Edge Functions.

---

## Migration Paths

### From 1.x to 2.0

Most straightforward upgrade path with minimal breaking changes.

#### Step 1: Update Package

```bash
npm install reacteo@latest
```

#### Step 2: Run New Migrations

```bash
# Link to your Supabase project
supabase link --project-ref your-project-ref

# Pull latest migrations
# Copy new migrations from reacteo/supabase/migrations/

# Apply them
supabase db push
```

#### Step 3: Update Environment Variables

Add any new environment variables (see `.env.example`):

```env
# New in 2.0 (optional)
VITE_APP_NAME=Your App Name
```

#### Step 4: Redeploy Edge Functions

```bash
supabase functions deploy ai-generate
supabase functions deploy ai-audit
supabase functions deploy ai-models
supabase functions deploy seo-bulk-processor
supabase functions deploy seo-instant-indexing
```

#### Step 5: Update Code (Optional)

If you want to use the new production plugin:

```tsx
// Before (1.x)
import { SEO, SEOProvider } from 'reacteo'

// After (2.0) - still works
import { SEO, SEOProvider } from 'reacteo'

// Or use new plugin exports
import { useSeoMeta } from 'reacteo/plugin'
```

#### Step 6: Test

1. Verify metadata is still rendering correctly
2. Test admin dashboard functionality
3. Test AI generation features
4. Check Edge Functions logs

---

### From Custom SEO Setup

Migrating from a custom SEO implementation to Reacteo.

#### Step 1: Audit Current Setup

Document your current:
- Meta tag implementation
- Sitemap generation
- Robots.txt rules
- Structured data
- Analytics integration

#### Step 2: Install Reacteo

```bash
npm install reacteo react-helmet-async @supabase/supabase-js
```

#### Step 3: Set Up Supabase

1. Create Supabase project
2. Copy and run migrations
3. Deploy Edge Functions
4. Set environment variables

See [INSTALLATION.md](./INSTALLATION.md) for details.

#### Step 4: Replace Meta Tags

Replace your custom meta tags with Reacteo components:

```tsx
// Before (custom)
<head>
  <title>{pageTitle}</title>
  <meta name="description" content={pageDesc} />
  <meta property="og:title" content={pageTitle} />
  <meta property="og:description" content={pageDesc} />
</head>

// After (Reacteo)
import { SEO } from 'reacteo'

<SEO
  title={pageTitle}
  description={pageDesc}
  openGraph={{
    type: 'website',
    url: pageUrl,
    image: ogImage,
  }}
/>
```

#### Step 5: Migrate Structured Data

Replace custom JSON-LD with Reacteo builders:

```tsx
// Before (custom)
<script type="application/ld+json">
  {JSON.stringify({
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": title,
    "datePublished": date,
  })}
</script>

// After (Reacteo)
import { SEO, buildArticleSchema } from 'reacteo'

<SEO
  title={title}
  jsonLd={[
    buildArticleSchema({
      headline: title,
      datePublished: date,
      author: author,
      image: image,
    }),
  ]}
/>
```

#### Step 6: Migrate Sitemap

Replace custom sitemap with Reacteo:

```typescript
// seo-config.ts
export const seoConfig = {
  hostname: 'https://yourdomain.com',
  routes: [
    { path: '/', priority: 1.0, changefreq: 'weekly' },
    { path: '/about', priority: 0.8, changefreq: 'monthly' },
    // ... all your routes
  ],
}
```

Build script auto-generates `dist/sitemap.xml`.

#### Step 7: Add Server-Side Injection (Optional)

For production crawler support, integrate the production plugin:

See [`src/lib/seo/reactseo-plugin/REACTSEO_PLUGIN.md`](./src/lib/seo/reactseo-plugin/REACTSEO_PLUGIN.md)

---

### From react-helmet to Reacteo

Direct replacement for projects using `react-helmet` or `react-helmet-async`.

#### Step 1: Install Reacteo

```bash
npm install reacteo
```

**Note:** Reacteo uses `react-helmet-async` internally, so it's compatible.

#### Step 2: Replace Helmet with SEO Component

```tsx
// Before (react-helmet)
import { Helmet } from 'react-helmet-async'

<Helmet>
  <title>{title}</title>
  <meta name="description" content={description} />
  <meta property="og:title" content={title} />
  <meta property="og:description" content={description} />
</Helmet>

// After (Reacteo)
import { SEO } from 'reacteo'

<SEO
  title={title}
  description={description}
  openGraph={{
    type: 'website',
    title: title,
    description: description,
  }}
/>
```

#### Step 3: Wrap with SEOProvider

```tsx
// Before
import { HelmetProvider } from 'react-helmet-async'

<HelmetProvider>
  <App />
</HelmetProvider>

// After
import { SEOProvider } from 'reacteo'
import seoConfig from './seo-config'

<SEOProvider config={seoConfig}>
  <App />
</SEOProvider>
```

#### Benefits of Switching

- ✅ Simplified API with better TypeScript support
- ✅ Template-driven metadata
- ✅ Built-in structured data builders
- ✅ AI-powered content generation
- ✅ Admin dashboard
- ✅ Production plugin for SSR

---

## Feature Migrations

### Template Engine

Reacteo 2.0 enhances the template engine with more variables and better parsing.

#### New Template Variables

```typescript
// Available in 2.0
%%post_title%%       // Post title
%%post_excerpt%%     // Post excerpt
%%post_author%%      // Author name
%%post_date%%        // Publication date
%%sitetitle%%        // Site name
%%sep%%              // Separator (| or -)
%%currentdate%%      // Current date
%%currentyear%%      // Current year
```

#### Migration Example

```typescript
// Before (1.x)
const template = `${post.title} | My Site`

// After (2.0)
const template = '%%post_title%% %%sep%% %%sitetitle%%'
```

Benefits:
- Centralized management
- Bulk updates
- AI-powered fallbacks

### Structured Data Builders

New builders added in 2.0:

```typescript
import {
  buildArticleSchema,
  buildBreadcrumbSchema,
  buildProductSchema,
  buildLocalBusinessSchema,
  buildWebSiteSchema,
  buildPersonSchema,        // New in 2.0
  buildOrganizationSchema,  // New in 2.0
  buildFAQSchema,           // New in 2.0
  buildVideoSchema,         // New in 2.0
} from 'reacteo'
```

### Admin Dashboard

Enhanced UI with:
- Better bulk operations
- Improved template manager
- Enhanced settings panel
- Better error handling

**Action:** No migration needed, updates automatically.

---

## Database Migrations

### New Tables in 2.0

```sql
-- Enhanced global settings
ALTER TABLE seo_global_settings ADD COLUMN IF NOT EXISTS llm_txt TEXT;
ALTER TABLE seo_global_settings ADD COLUMN IF NOT EXISTS index_now_key TEXT;

-- New bulk job tracking
CREATE TABLE IF NOT EXISTS seo_bulk_jobs (
  id BIGSERIAL PRIMARY KEY,
  status TEXT NOT NULL,
  total_pages INTEGER,
  processed_pages INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- Enhanced seo_pages table
ALTER TABLE seo_pages ADD COLUMN IF NOT EXISTS seo_score INTEGER;
ALTER TABLE seo_pages ADD COLUMN IF NOT EXISTS is_custom BOOLEAN DEFAULT FALSE;
ALTER TABLE seo_pages ADD COLUMN IF NOT EXISTS last_generated_at TIMESTAMPTZ;
```

### Running Migrations

#### Automatic (Recommended)

```bash
# Copy new migrations from reacteo
cp node_modules/reacteo/supabase/migrations/* supabase/migrations/

# Apply them
supabase db push
```

#### Manual

Apply the SQL above directly in Supabase SQL Editor.

### Verifying Migrations

```sql
-- Check new tables exist
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN ('seo_bulk_jobs', 'seo_global_settings', 'seo_pages');

-- Check new columns
SELECT column_name
FROM information_schema.columns
WHERE table_name = 'seo_pages'
AND column_name IN ('seo_score', 'is_custom', 'last_generated_at');
```

---

## Rollback Instructions

### If Issues Occur

#### 1. Rollback Package

```bash
npm install reacteo@1.0.0
```

#### 2. Rollback Database

```bash
# Revert to previous migration
supabase db reset --db-url "your-connection-string"

# Or manually drop new tables
DROP TABLE IF EXISTS seo_bulk_jobs;
```

#### 3. Restore Edge Functions

```bash
# Deploy old versions from backup
supabase functions deploy ai-generate --version 1.0.0
```

#### 4. Verify Rollback

1. Check app still runs
2. Verify metadata rendering
3. Test admin dashboard
4. Check logs for errors

---

## Troubleshooting

### Issue: Build errors after upgrade

**Solution:**
```bash
# Clear cache
rm -rf node_modules dist .vite
npm install
npm run build
```

### Issue: TypeScript errors

**Solution:**
```bash
# Update types
npm install --save-dev @types/react@latest @types/react-dom@latest

# Regenerate types
npm run typecheck
```

### Issue: Edge Functions not working

**Solution:**
```bash
# Redeploy all functions
supabase functions deploy ai-generate
supabase functions deploy ai-audit
supabase functions deploy ai-models
supabase functions deploy seo-bulk-processor
supabase functions deploy seo-instant-indexing

# Check logs
supabase functions logs ai-generate
```

### Issue: Database migration failed

**Solution:**
```bash
# Check current schema version
supabase migration list

# Manually apply failed migration
supabase db execute < supabase/migrations/failed-migration.sql

# Or use SQL editor in Supabase dashboard
```

### Issue: Meta tags not updating

**Solution:**
1. Clear browser cache
2. Verify `<SEOProvider>` wraps app
3. Check environment variables loaded
4. Restart dev server

---

## Getting Help

### Before Asking for Help

1. ✅ Check this migration guide
2. ✅ Review [INSTALLATION.md](./INSTALLATION.md)
3. ✅ Check [API_REFERENCE.md](./API_REFERENCE.md)
4. ✅ Review plugin docs: [`REACTSEO_PLUGIN.md`](./src/lib/seo/reactseo-plugin/REACTSEO_PLUGIN.md)
5. ✅ Check existing GitHub issues

### Support Channels

- **GitHub Issues**: [Report bugs](https://github.com/heaventree-ltd/reacteo/issues)
- **GitHub Discussions**: [Ask questions](https://github.com/heaventree-ltd/reacteo/discussions)
- **Email**: sean@heaventree.co

---

## Success Checklist

After migration, verify:

- [ ] Package upgraded to 2.0
- [ ] Database migrations applied
- [ ] Edge Functions redeployed
- [ ] Environment variables updated
- [ ] Meta tags rendering correctly
- [ ] Admin dashboard accessible
- [ ] AI features working
- [ ] Sitemap generating
- [ ] Social crawler tests pass
- [ ] No console errors
- [ ] TypeScript compiles
- [ ] Production build succeeds

---

**Ready to migrate?** Follow the appropriate migration path above and refer to [INSTALLATION.md](./INSTALLATION.md) for detailed setup instructions.
