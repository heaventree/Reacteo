# Reacteo

[![MIT License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18-61dafb.svg)](https://react.dev/)

An AI-powered SEO system for React applications. Manage metadata, structured data, page audits, and blog content from a single admin dashboard backed by [Supabase](https://supabase.com/).

---

## What's in here

### `src/lib/seo/` — The SEO library

The core of Reacteo. Zero dependencies beyond `react-helmet-async`.

| File | What it does |
|------|-------------|
| `components/SEO.tsx` | Drop-in component for title, description, OG, Twitter Card, JSON-LD, canonical URL, robots |
| `components/Image.tsx` | Performance-focused `<img>` with lazy loading, srcSet, AVIF/WebP `<picture>`, CLS prevention |
| `context/SEOProvider.tsx` | Wraps `HelmetProvider`, provides site config via context |
| `hooks/useSEO.ts` | Returns resolved `SEOProps` from context defaults — spread onto `<SEO>` |
| `utils/schema.ts` | Typed JSON-LD builders: WebSite, Article, Breadcrumb, Product, LocalBusiness |
| `utils/validation.ts` | Config and deployment validation helpers |
| `types/index.ts` | All TypeScript types |

This folder is self-contained. To use it in another project, copy `src/lib/seo/` and install `react-helmet-async`.

### `src/lib/ai/` — The AI audit layer

Requires a live Supabase project with the three edge functions deployed. Without that, the AI features won't work. See [Prerequisites](#prerequisites).

| File | What it does |
|------|-------------|
| `service.ts` | Routes requests to OpenAI, Gemini, Claude, Perplexity, or Deepseek |
| `blog.ts` | Blog post CRUD via Supabase (`blog_posts`, `seo_pages` tables) |
| `crawler.ts` | Fetches a URL and extracts headings, images, links, content |
| `hooks.ts` | React hooks: `useAIAudit`, `useBlogPosts`, `usePageContent`, etc. |

### `supabase/functions/` — Edge Functions

| Function | What it does |
|----------|-------------|
| `ai-generate` | Proxies requests to whichever AI provider is configured |
| `ai-models` | CRUD for AI model configs stored in Supabase |
| `ai-audit` | Saves audit results to `ai_audits` and `seo_suggestions` tables |

### `scripts/` — Build scripts

- `generate-sitemap.js` — Post-build, generates `dist/sitemap.xml` from `seo-config.ts`
- `generate-robots.js` — Post-build, generates `dist/robots.txt`
- `seo-audit.js` — Pre-deploy checks: sitemap valid, robots.txt present, HTML exists

---

## Quick start

### Prerequisites

- Node.js 16+
- A [Supabase](https://supabase.com/) project (free tier works)
- API key for at least one AI provider if you want audit features

### 1. Clone and install

```bash
git clone https://github.com/yourusername/reacteo.git
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

Eight Supabase tables, all with Row Level Security enabled:

| Table | Purpose |
|-------|---------|
| `ai_models` | AI provider configurations |
| `seo_pages` | Pages being tracked |
| `ai_audits` | Audit results (scores, issues) |
| `seo_content` | Extracted page content |
| `seo_suggestions` | AI-generated recommendations |
| `blog_posts` | Blog content |
| `schema_definitions` | Saved JSON-LD schemas |
| `url_configurations` | URL optimization data |

Migration is at `supabase/migrations/20260311231129_create_ai_seo_tables.sql`.

---

## Copying the SEO library into an existing project

If you want just the SEO primitives (no AI, no Supabase, no admin dashboard):

1. Copy `src/lib/seo/` into your project
2. Copy `seo-config.ts` and adjust it
3. Install the one runtime dependency: `npm install react-helmet-async`
4. Optionally copy `scripts/` for sitemap generation

That's it. The SEO library has no other runtime dependencies.

---

## Roadmap

- [ ] Proper npm package with `exports` field (currently a template — copy `src/lib/seo/` to use in other projects)
- [ ] Replace `vite-plugin-prerender` with a better-maintained alternative
- [ ] Unit tests for schema builders and validation utils
- [ ] AI audit fallback when Supabase is not configured

---

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md).

---

## License

MIT — Copyright © 2024 Sean O'Byrne, Heaventree Ltd. See [LICENSE](./LICENSE).
