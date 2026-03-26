# Reacteo Installation Guide

Complete installation guide for integrating Reacteo into your React application.

---

## Table of Contents

- [Prerequisites](#prerequisites)
- [Installation Methods](#installation-methods)
  - [Method 1: Full System (Recommended)](#method-1-full-system-recommended)
  - [Method 2: Core Library Only](#method-2-core-library-only)
  - [Method 3: Production Plugin Only](#method-3-production-plugin-only)
- [Supabase Setup](#supabase-setup)
- [Environment Configuration](#environment-configuration)
- [Edge Functions Deployment](#edge-functions-deployment)
- [Client Integration](#client-integration)
- [Server Integration (Production Plugin)](#server-integration-production-plugin)
- [Verification](#verification)
- [Troubleshooting](#troubleshooting)

---

## Prerequisites

Before installing Reacteo, ensure you have:

- **Node.js** 16.13.0 or higher
- **React** 17.0.0 or higher
- **TypeScript** 5.0+ (recommended but not required)
- **Supabase account** (free tier works) for AI features
- **API keys** for at least one AI provider (optional):
  - OpenAI
  - Anthropic Claude
  - Google Gemini
  - Perplexity
  - Deepseek

---

## Installation Methods

### Method 1: Full System (Recommended)

Install Reacteo with all features including AI, admin dashboard, and Edge Functions.

#### Step 1: Install Dependencies

```bash
npm install reacteo react-helmet-async
```

#### Step 2: Install Supabase Client

```bash
npm install @supabase/supabase-js
```

#### Step 3: Copy Files

Copy the following directories into your project:

```
your-project/
├── src/
│   └── lib/
│       ├── seo/          # Copy from reacteo/src/lib/seo/
│       └── ai/           # Copy from reacteo/src/lib/ai/
├── supabase/
│   ├── migrations/       # Copy from reacteo/supabase/migrations/
│   └── functions/        # Copy from reacteo/supabase/functions/
└── scripts/              # Copy from reacteo/scripts/
```

#### Step 4: Set Up Environment Variables

Create `.env.local`:

```env
# Supabase (Required)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# Site Configuration
VITE_SEO_HOSTNAME=https://yourdomain.com

# AI Keys (Add via Supabase Dashboard → Edge Functions → Secrets)
# OPENAI_API_KEY=sk-...
# ANTHROPIC_API_KEY=sk-ant-...
# GEMINI_API_KEY=AIza...
```

#### Step 5: Run Database Migrations

```bash
# Connect to your Supabase project
supabase link --project-ref your-project-ref

# Run migrations
supabase db push
```

#### Step 6: Deploy Edge Functions

```bash
supabase functions deploy ai-generate
supabase functions deploy ai-audit
supabase functions deploy ai-models
supabase functions deploy seo-bulk-processor
supabase functions deploy seo-instant-indexing
```

#### Step 7: Set Edge Function Secrets

```bash
# Set AI API keys
supabase secrets set OPENAI_API_KEY=sk-...
supabase secrets set ANTHROPIC_API_KEY=sk-ant-...
supabase secrets set GEMINI_API_KEY=AIza...
```

---

### Method 2: Core Library Only

Use Reacteo's SEO components without AI features or Supabase.

#### Step 1: Install Dependencies

```bash
npm install react-helmet-async
```

#### Step 2: Copy Core Files

Copy only the SEO library:

```
your-project/
└── src/
    └── lib/
        └── seo/
            ├── components/
            ├── context/
            ├── hooks/
            ├── utils/
            └── types/
```

#### Step 3: Create SEO Config

Create `seo-config.ts`:

```typescript
import { SEOConfig } from './lib/seo/types';

export const seoConfig: SEOConfig = {
  hostname: 'https://yourdomain.com',
  appName: 'Your App',
  defaultTitle: 'Your App - Tagline',
  defaultDescription: 'Your app description',
  titleTemplate: '%s | Your App',
  routes: [
    { path: '/', priority: 1.0, changefreq: 'weekly' },
    { path: '/about', priority: 0.8, changefreq: 'monthly' },
  ],
};
```

#### Step 4: Wrap Your App

```tsx
import { SEOProvider } from './lib/seo';
import seoConfig from './seo-config';

function App() {
  return (
    <SEOProvider config={seoConfig}>
      <YourRouter />
    </SEOProvider>
  );
}
```

---

### Method 3: Production Plugin Only

Use the battle-tested production plugin from niimo.io for server-side rendering.

#### Step 1: Copy Plugin Files

```
your-project/
└── src/
    └── lib/
        └── seo/
            └── reactseo-plugin/
                ├── server/
                ├── client/
                └── REACTSEO_PLUGIN.md
```

#### Step 2: Follow Plugin Guide

See [`src/lib/seo/reactseo-plugin/REACTSEO_PLUGIN.md`](./src/lib/seo/reactseo-plugin/REACTSEO_PLUGIN.md) for complete integration instructions.

The plugin includes:
- Server-side meta injection
- Client-side live sync
- Database schemas
- API route examples
- All common pitfalls solved

---

## Supabase Setup

### 1. Create a Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Click "New Project"
3. Choose organization and project name
4. Set a database password (save this!)
5. Select region closest to your users
6. Wait for project to be provisioned (~2 minutes)

### 2. Get Your Credentials

From your Supabase dashboard:

1. Go to **Settings** → **API**
2. Copy `Project URL` → This is your `VITE_SUPABASE_URL`
3. Copy `anon public` key → This is your `VITE_SUPABASE_ANON_KEY`

### 3. Apply Database Migrations

```bash
# Install Supabase CLI if not already installed
npm install -g supabase

# Login
supabase login

# Link to your project
supabase link --project-ref your-project-ref

# Apply migrations
supabase db push
```

### 4. Verify Tables Were Created

In Supabase Dashboard → **Table Editor**, you should see:

- `seo_pages`
- `seo_global_settings`
- `seo_templates`
- `seo_bulk_jobs`
- `ai_keys`
- `ai_models`
- `ai_audits`
- `seo_suggestions`
- And more...

---

## Environment Configuration

### Development (.env.local)

```env
# Supabase
VITE_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGc...

# Site Config
VITE_SEO_HOSTNAME=http://localhost:5173
VITE_APP_NAME=Your App

# Analytics (Optional)
VITE_GA4_ID=G-XXXXXXXXXX
VITE_GTM_ID=GTM-XXXXXXX
```

### Production (.env.production)

```env
# Supabase
VITE_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGc...

# Site Config
VITE_SEO_HOSTNAME=https://yourdomain.com
VITE_APP_NAME=Your App

# Analytics
VITE_GA4_ID=G-XXXXXXXXXX
VITE_GTM_ID=GTM-XXXXXXX
```

### Edge Function Secrets (Supabase Dashboard)

Go to **Dashboard** → **Edge Functions** → **Secrets** and add:

```
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
GEMINI_API_KEY=AIza...
PERPLEXITY_API_KEY=pplx-...
DEEPSEEK_API_KEY=sk-...
```

**Never commit API keys to version control!**

---

## Edge Functions Deployment

### Deploy All Functions

```bash
# Deploy all at once
supabase functions deploy ai-generate
supabase functions deploy ai-audit
supabase functions deploy ai-models
supabase functions deploy seo-bulk-processor
supabase functions deploy seo-instant-indexing
```

### Verify Deployment

```bash
# List deployed functions
supabase functions list

# Check function logs
supabase functions logs ai-generate
```

### Test Functions

```bash
# Test locally
supabase functions serve

# Make test request
curl http://localhost:54321/functions/v1/ai-generate \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{"prompt":"Generate meta description","model":"gpt-4o-mini"}'
```

---

## Client Integration

### 1. Wrap Your App with SEOProvider

```tsx
// src/App.tsx
import { SEOProvider } from './lib/seo';
import seoConfig from '../seo-config';

function App() {
  return (
    <SEOProvider config={seoConfig}>
      <Router />
    </SEOProvider>
  );
}

export default App;
```

### 2. Add SEO Component to Pages

```tsx
// src/pages/Home.tsx
import { SEO } from '@/lib/seo';

export function HomePage() {
  return (
    <>
      <SEO
        title="Home"
        description="Welcome to our site"
        openGraph={{
          type: 'website',
          url: 'https://yourdomain.com/',
          image: 'https://yourdomain.com/og-image.jpg',
        }}
      />
      <main>
        <h1>Welcome</h1>
      </main>
    </>
  );
}
```

### 3. Use the Hook for Dynamic Content

```tsx
// src/pages/Blog.tsx
import { SEO, useSEO } from '@/lib/seo';

export function BlogPost({ post }) {
  const seoProps = useSEO({
    title: post.title,
    description: post.excerpt,
    openGraph: {
      type: 'article',
      url: post.url,
      image: post.coverImage,
    },
  });

  return (
    <>
      <SEO {...seoProps} />
      <article>
        <h1>{post.title}</h1>
        <p>{post.excerpt}</p>
      </article>
    </>
  );
}
```

### 4. Add Structured Data

```tsx
import { SEO, buildArticleSchema } from '@/lib/seo';

export function BlogPost({ post }) {
  return (
    <SEO
      title={post.title}
      description={post.excerpt}
      jsonLd={[
        buildArticleSchema({
          headline: post.title,
          datePublished: post.publishedAt,
          author: post.author.name,
          image: post.coverImage,
        }),
      ]}
    />
  );
}
```

---

## Server Integration (Production Plugin)

For production deployments with server-side rendering, integrate the ReactSEO plugin.

### Express + Vite Setup

See the complete guide in [`src/lib/seo/reactseo-plugin/REACTSEO_PLUGIN.md`](./src/lib/seo/reactseo-plugin/REACTSEO_PLUGIN.md).

**Key highlights:**

1. **Server-side injection** ensures crawlers get fully-populated meta tags
2. **Client-side hook** syncs meta on route changes
3. **Proven patterns** solve all common pitfalls
4. **Production-tested** at niimo.io

---

## Verification

### 1. Check Meta Tags

Open your app in a browser and view source (Ctrl+U / Cmd+Option+U):

```html
<head>
  <title>Your Page Title</title>
  <meta name="description" content="Your description" />
  <meta property="og:title" content="Your Page Title" />
  <meta property="og:description" content="Your description" />
  <meta property="og:image" content="https://yourdomain.com/og.jpg" />
  ...
</head>
```

### 2. Test with Social Crawlers

**Twitter Card Validator:**
- https://cards-dev.twitter.com/validator

**Facebook Sharing Debugger:**
- https://developers.facebook.com/tools/debug/

**LinkedIn Post Inspector:**
- https://www.linkedin.com/post-inspector/

### 3. Check Sitemap

Navigate to: `https://yourdomain.com/sitemap.xml`

Should return XML like:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://yourdomain.com/</loc>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
  ...
</urlset>
```

### 4. Test Admin Dashboard

1. Navigate to `/admin` in your app
2. You should see the SEO dashboard
3. Try discovering pages
4. Try generating meta with AI (requires API keys)

---

## Troubleshooting

### Issue: "Module not found: react-helmet-async"

**Solution:**
```bash
npm install react-helmet-async
```

### Issue: Supabase connection error

**Solution:**
1. Verify `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are correct
2. Check Supabase project is active (not paused)
3. Verify environment variables are loaded (restart dev server)

### Issue: Edge Functions returning 404

**Solution:**
```bash
# Redeploy functions
supabase functions deploy ai-generate
supabase functions deploy ai-audit
# ... etc
```

### Issue: Meta tags not updating on navigation

**Solution:**
- Ensure `<SEOProvider>` wraps your router
- Check that `<SEO>` component is inside routed components
- For production plugin, verify `useSeoMeta()` is mounted inside router

### Issue: Crawlers not seeing meta tags

**Solution:**
- This is expected in SPAs without SSR
- Use the Production Plugin for server-side injection
- Or use a pre-rendering service like Prerender.io

### Issue: AI generation not working

**Solution:**
1. Verify Edge Functions are deployed
2. Check API keys are set in Supabase secrets
3. Check function logs: `supabase functions logs ai-generate`
4. Verify billing is enabled on AI provider accounts

### Issue: Duplicate meta tags

**Solution:**
- Only use one `<SEO>` component per page
- Don't mix static `<meta>` tags with `<SEO>` component
- For production plugin, see duplicate tag section in `REACTSEO_PLUGIN.md`

---

## Next Steps

After installation:

1. ✅ **Configure your routes** in `seo-config.ts`
2. ✅ **Add SEO components** to all pages
3. ✅ **Set up AI providers** for bulk generation
4. ✅ **Deploy Edge Functions** to Supabase
5. ✅ **Test with social crawlers** to verify Open Graph tags
6. ✅ **Submit sitemap** to Google Search Console
7. ✅ **Enable analytics** (GA4/GTM) via admin dashboard

---

## Additional Resources

- [API Reference](./API_REFERENCE.md) - Complete API documentation
- [Migration Guide](./MIGRATION_GUIDE.md) - Upgrading from older versions
- [ReactSEO Plugin Guide](./src/lib/seo/reactseo-plugin/REACTSEO_PLUGIN.md) - Production plugin implementation
- [Contributing Guide](./CONTRIBUTING.md) - How to contribute
- [Changelog](./CHANGELOG.md) - Version history

---

## Support

- **Issues**: [GitHub Issues](https://github.com/heaventree-ltd/reacteo/issues)
- **Discussions**: [GitHub Discussions](https://github.com/heaventree-ltd/reacteo/discussions)
- **Email**: sean@heaventree.co

---

**Need help?** Open an issue or discussion on GitHub!
