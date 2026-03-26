# ReactSEO Plugin — Quick Start

Get the production-proven SEO plugin running in 15 minutes.

---

## What You Get

- ✅ **Server-side meta injection** — Crawlers see full meta tags before JS loads
- ✅ **Client-side sync** — Meta updates automatically on navigation
- ✅ **Database-driven** — All SEO data in Supabase
- ✅ **Production-proven** — Battle-tested at niimo.io

---

## Prerequisites

- Node.js 16+
- Express server
- Supabase account (free tier works)
- React application

---

## Step 1: Database Setup (5 minutes)

### Create Tables

```sql
-- SEO Pages table
CREATE TABLE seo_pages (
  id SERIAL PRIMARY KEY,
  path TEXT UNIQUE NOT NULL,
  page_type TEXT DEFAULT 'static',
  label TEXT,
  meta_title TEXT,
  meta_desc TEXT,
  og_image TEXT,
  no_index BOOLEAN DEFAULT false,
  in_sitemap BOOLEAN DEFAULT true,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- SEO Settings table (single row)
CREATE TABLE seo_settings (
  id INTEGER PRIMARY KEY DEFAULT 1,
  site_url TEXT DEFAULT 'https://yourdomain.com',
  title_format TEXT DEFAULT '{title} | YourApp',
  default_desc TEXT,
  twitter_handle TEXT,
  ga4_id TEXT,
  gtm_id TEXT,
  default_og_image TEXT,
  twitter_card TEXT DEFAULT 'summary_large_image',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE seo_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE seo_settings ENABLE ROW LEVEL SECURITY;

-- Allow public reads (adjust as needed)
CREATE POLICY "Allow public read" ON seo_pages FOR SELECT USING (true);
CREATE POLICY "Allow public read" ON seo_settings FOR SELECT USING (true);
```

### Seed Initial Data

```sql
-- Insert default settings
INSERT INTO seo_settings (id, site_url, title_format)
VALUES (1, 'https://yourdomain.com', '{title} | Your App')
ON CONFLICT (id) DO NOTHING;

-- Insert homepage
INSERT INTO seo_pages (path, meta_title, meta_desc)
VALUES ('/', 'Home', 'Welcome to our site')
ON CONFLICT (path) DO NOTHING;
```

---

## Step 2: Server Integration (5 minutes)

### Install Plugin Files

Copy the plugin folder into your project:

```
your-project/
└── server/
    └── seo/
        ├── seo-inject.ts    # Copy from reactseo-plugin/server/
        ├── vite.ts          # Copy from reactseo-plugin/server/
        └── static.ts        # Copy from reactseo-plugin/server/
```

### Update Your Server

#### Development (server/vite.ts)

```typescript
import { injectSeoMeta } from './seo/seo-inject';

// In your catch-all route:
app.use('/*', async (req, res, next) => {
  try {
    let template = await fs.promises.readFile('index.html', 'utf-8');
    let page = await vite.transformIndexHtml(req.url, template);
    page = await injectSeoMeta(page, req.originalUrl); // Add this line
    res.status(200).set({ 'Content-Type': 'text/html' }).end(page);
  } catch (e) {
    next(e);
  }
});
```

#### Production (server/static.ts)

```typescript
import { injectSeoMeta } from './seo/seo-inject';

// In your catch-all route:
app.use('/*', async (req, res) => {
  try {
    let html = await fs.promises.readFile('dist/index.html', 'utf-8');
    html = await injectSeoMeta(html, req.originalUrl); // Add this line
    res.status(200).set({ 'Content-Type': 'text/html' }).end(html);
  } catch (e) {
    res.sendFile(path.resolve('dist/index.html'));
  }
});
```

**Important:** Place catch-all route AFTER all API routes!

---

## Step 3: Client Integration (5 minutes)

### Install Dependencies

```bash
npm install @tanstack/react-query
```

### Add Client Hook

Copy `reactseo-plugin/client/src/hooks/useSeoMeta.ts` to your project.

### Mount in App

```tsx
import { useSeoMeta, useAnalyticsInjection } from './hooks/useSeoMeta';

// Create component
function SeoManager() {
  useSeoMeta();
  useAnalyticsInjection();
  return null;
}

// Mount INSIDE your router
function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <SeoManager /> {/* Must be inside Router */}
        <Routes />
      </Router>
    </QueryClientProvider>
  );
}
```

---

## Step 4: API Routes (Optional)

Add these routes to serve SEO data to the client:

```typescript
// GET /api/seo/config - Returns GA4/GTM IDs
app.get('/api/seo/config', async (req, res) => {
  const settings = await db
    .select()
    .from(seoSettings)
    .where(eq(seoSettings.id, 1));

  res.json({
    ga4Id: settings[0]?.ga4Id ?? null,
    gtmId: settings[0]?.gtmId ?? null,
    defaultOgImage: settings[0]?.defaultOgImage ?? null,
    siteUrl: settings[0]?.siteUrl ?? 'https://yourdomain.com',
  });
});

// GET /api/seo/meta?path=/ - Returns page meta
app.get('/api/seo/meta', async (req, res) => {
  const path = req.query.path ?? '/';
  const page = await db
    .select()
    .from(seoPages)
    .where(eq(seoPages.path, path));

  res.json({
    metaTitle: page[0]?.metaTitle ?? null,
    metaDesc: page[0]?.metaDesc ?? null,
    ogImage: page[0]?.ogImage ?? null,
    noIndex: page[0]?.noIndex ?? false,
  });
});
```

---

## Verification

### 1. Check Server-Side Injection

```bash
# View page source (not inspect element!)
curl http://localhost:3000/ | grep '<title>'

# Should see:
# <title>Home | Your App</title>
# <meta name="description" content="Welcome to our site">
# <meta property="og:title" content="Home | Your App">
```

### 2. Test Client-Side Updates

1. Navigate to homepage
2. Open DevTools → Network
3. Navigate to another page
4. Check that `/api/seo/meta` was called
5. Check that `document.title` updated

### 3. Test with Crawlers

**Twitter Card Validator:**
https://cards-dev.twitter.com/validator

**Facebook Debugger:**
https://developers.facebook.com/tools/debug/

Both should show full meta tags and images.

---

## Troubleshooting

### Meta tags not showing in crawlers

**Problem:** Crawlers see blank meta tags
**Solution:**
- Check server-side injection is enabled
- Verify database has data for the path
- Check catch-all route is AFTER API routes

### Duplicate meta tags

**Problem:** Two `<title>` tags appearing
**Solution:**
- Verified in `useSeoMeta.ts` — it updates existing tags
- Check you're not manually adding tags elsewhere

### Client meta not updating

**Problem:** Meta stays same on navigation
**Solution:**
- Verify `<SeoManager>` is inside `<Router>`
- Check React Query is installed and configured
- Check `/api/seo/meta` returns correct data

### API routes return HTML

**Problem:** `/api/seo/config` returns HTML instead of JSON
**Solution:**
- Move catch-all route to END of routes file
- API routes must be registered BEFORE catch-all

---

## Next Steps

### Add More Pages

```sql
INSERT INTO seo_pages (path, meta_title, meta_desc, og_image)
VALUES
  ('/about', 'About Us', 'Learn about our company', 'https://example.com/about.jpg'),
  ('/pricing', 'Pricing', 'See our plans', 'https://example.com/pricing.jpg');
```

### Enable Analytics

Update settings in database:

```sql
UPDATE seo_settings
SET ga4_id = 'G-XXXXXXXXXX',
    gtm_id = 'GTM-XXXXXXX'
WHERE id = 1;
```

Scripts will auto-inject on page load.

### Add Sitemap

See main documentation for sitemap generation.

---

## Common Patterns

### Dynamic Pages

```sql
-- Blog posts
INSERT INTO seo_pages (path, page_type, meta_title, meta_desc)
SELECT
  '/blog/' || slug,
  'blog',
  title,
  excerpt
FROM blog_posts;
```

### Templates

Instead of individual pages, use templates (requires additional setup):

```sql
CREATE TABLE seo_templates (
  id SERIAL PRIMARY KEY,
  pattern TEXT,  -- e.g., '/blog/*'
  title_template TEXT,  -- e.g., '%%post_title%% | Blog'
  desc_template TEXT
);
```

---

## Performance

- **Server queries:** 1-2 per page load (cached in app)
- **Client queries:** 1 per route change (React Query cached)
- **Database load:** Minimal, read-heavy
- **Build time:** No impact (no static generation)

---

## Full Documentation

For complete implementation details, see:
- [REACTSEO_PLUGIN.md](./REACTSEO_PLUGIN.md) — Full guide with all issues solved
- [API_REFERENCE.md](../../API_REFERENCE.md) — Complete API documentation
- [INSTALLATION.md](../../INSTALLATION.md) — Comprehensive setup guide

---

## Support

- **Issues**: https://github.com/heaventree-ltd/reacteo/issues
- **Discussions**: https://github.com/heaventree-ltd/reacteo/discussions

---

**You're all set!** Your React SPA now has production-grade SEO with full crawler support.
