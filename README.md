# Reacteo

[![MIT License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18-61dafb.svg)](https://react.dev/)
[![npm version](https://img.shields.io/npm/v/reacteo.svg)](https://www.npmjs.com/package/reacteo)

**Production-ready SEO library for React applications with full crawler support.**

Battle-tested in production at [niimo.io](https://niimo.io). Reacteo provides server-side meta injection, client-side live sync, database-driven SEO management, AI-powered content generation, and comprehensive admin tools—all backed by [Supabase](https://supabase.com/).

## Why Reacteo?

React SPAs face a fundamental SEO challenge: crawlers don't execute JavaScript. Reacteo solves this with:

- **Server-side meta injection** — Social crawlers (Twitter, Slack, LinkedIn) and search engines receive fully-populated `<title>`, `<meta>`, and Open Graph tags *before* JavaScript loads
- **Client-side live sync** — React hooks automatically update metadata on route changes without page reloads
- **Database-driven** — All SEO data stored in Supabase, editable from an admin dashboard
- **AI-powered** — Bulk generate meta descriptions, audit content, and get optimization suggestions
- **Production-proven** — Successfully deployed in production, solving all the common pitfalls

---

## Features

### Core SEO Features
- ✅ **Server-side meta injection** for crawler compatibility
- ✅ **Client-side live updates** on route changes
- ✅ **Template-driven metadata** (WordPress-style `%%variables%%`)
- ✅ **Structured data** (JSON-LD) with type-safe builders
- ✅ **Dynamic sitemaps** (XML with pagination support)
- ✅ **Robots.txt generation** with flexible rules
- ✅ **Open Graph** and **Twitter Card** support
- ✅ **Canonical URLs** and `noindex` control
- ✅ **Image optimization** component with lazy loading

### AI-Powered Features
- 🤖 **Bulk AI generation** of meta descriptions
- 🤖 **Content audits** with SEO scoring (0-100)
- 🤖 **AI suggestions** for optimization
- 🤖 **Multi-provider support** (OpenAI, Claude, Gemini, Perplexity, Deepseek)
- 🤖 **Smart fallbacks** when metadata is missing

### Admin Dashboard
- 📊 **Visual admin panel** for all SEO settings
- 📊 **Page discovery** and bulk operations
- 📊 **Template manager** with preview
- 📊 **Analytics integration** (GA4, GTM)
- 📊 **IndexNow support** for instant indexing
- 📊 **llm.txt** generation for AI crawlers

### Production Plugin (`reactseo-plugin/`)
- 🔌 **Express middleware** for server-side injection
- 🔌 **React hooks** for client-side sync
- 🔌 **Database schemas** for Supabase/PostgreSQL
- 🔌 **API routes** reference implementation
- 🔌 **Proven patterns** from production deployment

---

## Project Structure

### `src/lib/seo/` — Core SEO Library

The foundation of Reacteo. Minimal dependencies (only `react-helmet-async`).

| File/Folder | Purpose |
|-------------|---------|
| `components/SEO.tsx` | Main component for metadata injection |
| `components/Image.tsx` | Optimized image component with lazy loading |
| `admin/` | Dashboard UI components |
| `utils/template-engine.ts` | WordPress-style variable parsing |
| `utils/sitemap.ts` | XML sitemap generator |
| `utils/robots.ts` | Robots.txt generator |
| `utils/schema.ts` | Type-safe JSON-LD builders |
| `context/SEOProvider.tsx` | React context provider |
| `hooks/useSEO.ts` | React hook for SEO data |
| `types/index.ts` | TypeScript definitions |
| `reactseo-plugin/` | **Production plugin** (see below) |

### `src/lib/ai/` — AI Integration Layer

Optional AI features powered by Supabase Edge Functions.

| File | Purpose |
|------|---------|
| `service.ts` | Multi-provider AI routing (OpenAI, Claude, Gemini, etc.) |
| `blog.ts` | Blog post management with SEO integration |
| `crawler.ts` | URL content extraction and analysis |
| `hooks.ts` | React hooks for AI features |

### `src/lib/seo/reactseo-plugin/` — **Production Plugin** 🆕

**Battle-tested implementation from [niimo.io](https://niimo.io)** — This plugin provides complete server-side and client-side SEO with proven solutions to common pitfalls.

#### Server-side (`server/`)
| File | Purpose |
|------|---------|
| `seo-inject.ts` | Server-side HTML `<head>` injection for crawlers |
| `vite.ts` | Vite dev server integration |
| `static.ts` | Production static server integration |
| `seed-seo-pages.ts` | Initial page seeding |
| `page-seed-data.ts` | Page metadata definitions |

#### Client-side (`client/`)
| File | Purpose |
|------|---------|
| `src/hooks/useSeoMeta.ts` | React hook for live meta updates on navigation |

#### Documentation
- `REACTSEO_PLUGIN.md` — Complete implementation guide with all the issues we encountered and how we fixed them

### `supabase/functions/` — Edge Functions

| Function | Purpose |
|----------|---------|
| `seo-bulk-processor` | Background job for template parsing and AI generation |
| `seo-instant-indexing` | Google/Bing IndexNow API integration |
| `ai-generate` | AI provider proxy with key management |
| `ai-models` | AI model configuration CRUD |
| `ai-audit` | SEO auditing and scoring engine |

### `scripts/` — Build Scripts

| Script | Purpose |
|--------|---------|
| `generate-sitemap.ts` | Post-build sitemap generation |
| `generate-robots.ts` | Post-build robots.txt generation |
| `seo-audit.ts` | Pre-deploy SEO validation checks |

---

## Quick start

### Prerequisites

- Node.js 16+
- A [Supabase](https://supabase.com/) project (free tier works)
- API key for at least one AI provider if you want audit features

### 1. Clone and install

```bash
git clone https://github.com/heaventree-ltd/reacteo.git
cd reacteo
npm install
```

### 2. Environment variables

Copy the example file and fill in your values:

```bash
cp .env.example .env.local
```

```env
# Required for the app to run
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# Optional — only needed for AI audit features
# Add these as Edge Function Secrets in your Supabase dashboard
# Settings → Edge Functions → Secrets
# OPENAI_API_KEY=sk-...
# GEMINI_API_KEY=AIza...
# CLAUDE_API_KEY=sk-ant-...
# PERPLEXITY_API_KEY=pplx-...
# DEEPSEEK_API_KEY=sk-...

# Optional — for sitemap generation
VITE_SEO_HOSTNAME=https://yourdomain.com
```

### 3. Run

```bash
npm run dev
```

Admin dashboard is at `http://localhost:5173/admin`.

### 4. Deploy

```bash
npm run build
```

Post-build scripts automatically generate `dist/sitemap.xml` and `dist/robots.txt`.

---

## Using the SEO library

### Wrap your app

```tsx
import { SEOProvider } from './lib/seo';
import seoConfig from '../seo-config';

function App() {
  return (
    <SEOProvider config={seoConfig}>
      <Router />
    </SEOProvider>
  );
}
```

### Add metadata to a page

```tsx
import { SEO } from './lib/seo';

function HomePage() {
  return (
    <>
      <SEO
        title="Home"
        description="Welcome to my site"
        openGraph={{
          type: 'website',
          url: 'https://example.com/',
          image: 'https://example.com/og.jpg',
        }}
      />
      <main>...</main>
    </>
  );
}
```

### Use the hook for computed props

```tsx
import { SEO, useSEO } from './lib/seo';

function ProductPage({ product }) {
  const seoProps = useSEO({
    title: product.name,
    description: product.summary,
    openGraph: { type: 'product', url: product.url },
  });

  return (
    <>
      <SEO {...seoProps} />
      <div>{product.name}</div>
    </>
  );
}
```

### Add structured data

```tsx
import { SEO, buildArticleSchema, buildBreadcrumbSchema } from './lib/seo';

function BlogPost({ post }) {
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
        buildBreadcrumbSchema([
          { name: 'Home', url: 'https://example.com' },
          { name: 'Blog', url: 'https://example.com/blog' },
          { name: post.title, url: post.url },
        ]),
      ]}
    />
  );
}
```

### Optimized images

```tsx
import { Image } from './lib/seo';

<Image
  src="/hero.jpg"
  alt="Hero image"
  width={1200}
  height={630}
  priority
/>
```

---

## Configure routes and sitemap

Edit `seo-config.ts` to define your site's routes:

```ts
export const seoConfig: SEOConfig = {
  hostname: import.meta.env.VITE_SEO_HOSTNAME || 'https://yourdomain.com',
  appName: 'My App',
  defaultDescription: 'My app does great things',
  routes: [
    { path: '/', priority: 1.0, changefreq: 'weekly', prerender: true },
    { path: '/about', priority: 0.8, changefreq: 'monthly', prerender: true },
    { path: '/blog', priority: 0.9, changefreq: 'daily', prerender: false },
  ],
};
```

The sitemap generator reads this file and outputs `dist/sitemap.xml` after every build.

---

## Database schema

Supabase tables handling everything from page tracking to background job states, all with RLS:

| Table | Purpose |
|-------|---------|
| `seo_global_settings`| Sitewide config (GA4, GTM, site name, separators) |
| `seo_templates` | WP-style route rules (e.g. `/blog/*` maps to `%%post_title%% | %%sitetitle%%`) |
| `seo_bulk_jobs` | Tracking status of automated crawler tasks |
| `ai_keys` | Encrypted storage for OpenAI/Claude/Gemini API keys |
| `ai_models` | AI provider configurations |
| `seo_pages` | Pages being tracked |
| `ai_audits` | Audit results (scores, issues) |
| `seo_content` | Extracted page content |
| `seo_suggestions` | AI-generated recommendations |
| `blog_posts` | Blog content |
| `schema_definitions`| Saved JSON-LD schemas |
| `url_configurations`| URL optimization data |

Migrations are located in `supabase/migrations/`.

---

## Template-Driven SEO

Reacteo supports WordPress-style metadata templates. Instead of defining meta tags per page manually, define them in the centralized dashboard:

- **Title Template**: `%%post_title%% %%sep%% %%sitetitle%%`
- **Description**: `%%post_excerpt%%`

During bulk processing or page rendering, the SEO Engine will dynamically inject these variables from your database content.

### Smart AI Fallbacks
If your content is missing metadata (e.g. no excerpt exists), enable **AI Fallbacks** on your template rule. The `seo-bulk-processor` will automatically analyze the page content and generate a high-converting meta description or alt text using OpenAI, Claude, or Gemini.

---

## Copying the SEO library into an existing project

If you want just the SEO primitives (no AI, no Supabase, no admin dashboard):

1. Copy `src/lib/seo/` into your project
2. Copy `seo-config.ts` and adjust it
3. Install the one runtime dependency: `npm install react-helmet-async`
4. Optionally copy `scripts/` for sitemap generation

That's it. The SEO library has no other runtime dependencies.

---

## Documentation

- **[Installation Guide](./INSTALLATION.md)** — Complete setup instructions with three installation methods
- **[Migration Guide](./MIGRATION_GUIDE.md)** — Upgrading from 1.x, custom setups, or react-helmet
- **[API Reference](./API_REFERENCE.md)** — Complete API documentation for all exports
- **[Production Plugin Guide](./src/lib/seo/reactseo-plugin/REACTSEO_PLUGIN.md)** — Full implementation guide with solutions to all common pitfalls
- **[Quick Start (Plugin)](./src/lib/seo/reactseo-plugin/QUICK_START.md)** — Get the plugin running in 15 minutes

---

## Roadmap

- [ ] npm package publication
- [ ] Unit tests for schema builders and validation utils
- [ ] AI audit fallback when Supabase is not configured
- [ ] CDN distribution for direct browser usage
- [ ] Video tutorials and example projects

---

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines on how to contribute.

---

## Community & Support

- **GitHub Issues**: [Report bugs](https://github.com/heaventree-ltd/reacteo/issues)
- **GitHub Discussions**: [Ask questions](https://github.com/heaventree-ltd/reacteo/discussions)
- **Email**: sean@heaventree.co
- **Production Example**: [niimo.io](https://niimo.io) — See Reacteo in action

---

## License

MIT — Copyright © 2024-2026 Sean O'Byrne, Heaventree Ltd.

See [LICENSE](./LICENSE) for full license text.

---

## Acknowledgments

Special thanks to the [niimo.io](https://niimo.io) team for battle-testing the production plugin and sharing the proven implementation patterns that make Reacteo production-ready.

---

**Ready to add production-grade SEO to your React app?**

Get started with the [Installation Guide](./INSTALLATION.md) or jump straight to the [Quick Start](./src/lib/seo/reactseo-plugin/QUICK_START.md)!
