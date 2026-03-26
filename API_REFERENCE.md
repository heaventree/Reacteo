# Reacteo API Reference

Complete API documentation for all Reacteo exports, components, hooks, and utilities.

---

## Table of Contents

- [Core Components](#core-components)
- [React Hooks](#react-hooks)
- [Context Providers](#context-providers)
- [Structured Data Builders](#structured-data-builders)
- [Utility Functions](#utility-functions)
- [TypeScript Types](#typescript-types)
- [Production Plugin](#production-plugin)
- [Edge Functions API](#edge-functions-api)

---

## Core Components

### `<SEO>`

Main component for managing page metadata.

#### Props

```typescript
interface SEOProps {
  // Basic meta
  title?: string;
  description?: string;
  keywords?: string | string[];
  author?: string;

  // Open Graph
  openGraph?: {
    type?: 'website' | 'article' | 'product' | 'profile';
    title?: string;
    description?: string;
    url?: string;
    image?: string;
    siteName?: string;
    locale?: string;
  };

  // Twitter Card
  twitter?: {
    card?: 'summary' | 'summary_large_image' | 'app' | 'player';
    site?: string;
    creator?: string;
    title?: string;
    description?: string;
    image?: string;
  };

  // Technical
  canonical?: string;
  robots?: string;
  jsonLd?: object | object[];

  // Language & Region
  lang?: string;
  alternates?: Array<{
    hreflang: string;
    href: string;
  }>;
}
```

#### Usage

```tsx
import { SEO } from 'reacteo';

function HomePage() {
  return (
    <>
      <SEO
        title="Home Page"
        description="Welcome to our site"
        openGraph={{
          type: 'website',
          url: 'https://example.com/',
          image: 'https://example.com/og.jpg',
        }}
        twitter={{
          card: 'summary_large_image',
          site: '@example',
        }}
        jsonLd={[
          {
            '@context': 'https://schema.org',
            '@type': 'WebSite',
            name: 'Example',
            url: 'https://example.com',
          },
        ]}
      />
      <main>Content</main>
    </>
  );
}
```

#### Notes

- Only use one `<SEO>` component per page
- Props override context defaults from `<SEOProvider>`
- Handles all meta tag rendering via `react-helmet-async`

---

### `<Image>`

Optimized image component with lazy loading and SEO attributes.

#### Props

```typescript
interface ImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  loading?: 'lazy' | 'eager';
  priority?: boolean;
  className?: string;
  onLoad?: () => void;
  onError?: (error: Error) => void;
}
```

#### Usage

```tsx
import { Image } from 'reacteo';

function ProductPage() {
  return (
    <Image
      src="/product.jpg"
      alt="Product name"
      width={800}
      height={600}
      priority
      className="product-image"
    />
  );
}
```

#### Features

- Automatic lazy loading (unless `priority` is set)
- Width and height attributes for CLS prevention
- SEO-friendly alt text required
- Error handling

---

## React Hooks

### `useSEO()`

Returns computed SEO props with context defaults applied.

#### Signature

```typescript
function useSEO(props?: Partial<SEOProps>): SEOProps
```

#### Usage

```tsx
import { SEO, useSEO } from 'reacteo';

function BlogPost({ post }) {
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
      <article>{post.content}</article>
    </>
  );
}
```

#### Returns

Complete `SEOProps` object with:
- User-provided props
- Context defaults from `<SEOProvider>`
- Template processing applied
- Computed values

---

### `useAIAudit()`

Hook for running SEO audits on page content.

#### Signature

```typescript
function useAIAudit(url: string): {
  audit: (provider: string, model: string) => Promise<AuditResult>;
  isLoading: boolean;
  error: Error | null;
  result: AuditResult | null;
}
```

#### Usage

```tsx
import { useAIAudit } from 'reacteo';

function AuditPage() {
  const { audit, isLoading, result } = useAIAudit('https://example.com/page');

  const runAudit = async () => {
    await audit('openai', 'gpt-4o-mini');
  };

  return (
    <div>
      <button onClick={runAudit} disabled={isLoading}>
        Run Audit
      </button>
      {result && <div>Score: {result.score}/100</div>}
    </div>
  );
}
```

---

### `useBlogPosts()`

Hook for managing blog posts with SEO metadata.

#### Signature

```typescript
function useBlogPosts(): {
  posts: BlogPost[];
  isLoading: boolean;
  error: Error | null;
  createPost: (post: CreateBlogPost) => Promise<BlogPost>;
  updatePost: (id: number, updates: Partial<BlogPost>) => Promise<BlogPost>;
  deletePost: (id: number) => Promise<void>;
}
```

#### Usage

```tsx
import { useBlogPosts } from 'reacteo';

function BlogManager() {
  const { posts, createPost, isLoading } = useBlogPosts();

  const handleCreate = async () => {
    await createPost({
      title: 'New Post',
      content: 'Content here',
      excerpt: 'Brief description',
      slug: 'new-post',
    });
  };

  return (
    <div>
      {posts.map(post => (
        <div key={post.id}>{post.title}</div>
      ))}
    </div>
  );
}
```

---

## Context Providers

### `<SEOProvider>`

Context provider for site-wide SEO configuration.

#### Props

```typescript
interface SEOConfig {
  hostname: string;
  appName: string;
  defaultTitle?: string;
  defaultDescription?: string;
  titleTemplate?: string;
  defaultImage?: string;
  twitterHandle?: string;
  locale?: string;
  routes?: Array<{
    path: string;
    priority: number;
    changefreq: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
    prerender?: boolean;
  }>;
}
```

#### Usage

```tsx
import { SEOProvider } from 'reacteo';
import seoConfig from './seo-config';

function App() {
  return (
    <SEOProvider config={seoConfig}>
      <YourRouter />
    </SEOProvider>
  );
}
```

#### Config Example

```typescript
// seo-config.ts
export const seoConfig: SEOConfig = {
  hostname: 'https://example.com',
  appName: 'My App',
  defaultTitle: 'My App - Tagline',
  defaultDescription: 'Default description',
  titleTemplate: '%s | My App',
  defaultImage: 'https://example.com/og.jpg',
  twitterHandle: '@myapp',
  locale: 'en_US',
  routes: [
    { path: '/', priority: 1.0, changefreq: 'weekly' },
    { path: '/about', priority: 0.8, changefreq: 'monthly' },
  ],
};
```

---

## Structured Data Builders

### `buildArticleSchema()`

Builds schema.org Article JSON-LD.

#### Signature

```typescript
function buildArticleSchema(props: {
  headline: string;
  datePublished: string;
  dateModified?: string;
  author: string | { name: string; url?: string };
  image?: string | string[];
  description?: string;
  publisher?: {
    name: string;
    logo?: string;
  };
}): object
```

#### Usage

```tsx
import { SEO, buildArticleSchema } from 'reacteo';

<SEO
  jsonLd={[
    buildArticleSchema({
      headline: 'Article Title',
      datePublished: '2024-03-26T10:00:00Z',
      author: 'John Doe',
      image: 'https://example.com/article.jpg',
      description: 'Article description',
    }),
  ]}
/>
```

---

### `buildBreadcrumbSchema()`

Builds schema.org BreadcrumbList JSON-LD.

#### Signature

```typescript
function buildBreadcrumbSchema(
  items: Array<{
    name: string;
    url: string;
  }>
): object
```

#### Usage

```tsx
import { buildBreadcrumbSchema } from 'reacteo';

buildBreadcrumbSchema([
  { name: 'Home', url: 'https://example.com' },
  { name: 'Blog', url: 'https://example.com/blog' },
  { name: 'Post Title', url: 'https://example.com/blog/post' },
])
```

---

### `buildProductSchema()`

Builds schema.org Product JSON-LD.

#### Signature

```typescript
function buildProductSchema(props: {
  name: string;
  description: string;
  image?: string | string[];
  brand?: string;
  offers?: {
    price: number;
    priceCurrency: string;
    availability?: string;
    url?: string;
  };
  aggregateRating?: {
    ratingValue: number;
    reviewCount: number;
  };
}): object
```

#### Usage

```tsx
import { buildProductSchema } from 'reacteo';

buildProductSchema({
  name: 'Product Name',
  description: 'Product description',
  image: 'https://example.com/product.jpg',
  brand: 'Brand Name',
  offers: {
    price: 99.99,
    priceCurrency: 'USD',
    availability: 'https://schema.org/InStock',
  },
})
```

---

### `buildLocalBusinessSchema()`

Builds schema.org LocalBusiness JSON-LD.

#### Signature

```typescript
function buildLocalBusinessSchema(props: {
  name: string;
  description?: string;
  image?: string;
  telephone?: string;
  address: {
    streetAddress: string;
    addressLocality: string;
    addressRegion: string;
    postalCode: string;
    addressCountry: string;
  };
  geo?: {
    latitude: number;
    longitude: number;
  };
  openingHours?: string[];
}): object
```

#### Usage

```tsx
import { buildLocalBusinessSchema } from 'reacteo';

buildLocalBusinessSchema({
  name: 'Business Name',
  telephone: '+1-234-567-8900',
  address: {
    streetAddress: '123 Main St',
    addressLocality: 'City',
    addressRegion: 'State',
    postalCode: '12345',
    addressCountry: 'US',
  },
  openingHours: ['Mo-Fr 09:00-17:00'],
})
```

---

### `buildWebSiteSchema()`

Builds schema.org WebSite JSON-LD.

#### Signature

```typescript
function buildWebSiteSchema(props: {
  name: string;
  url: string;
  description?: string;
  searchAction?: {
    target: string;
    query: string;
  };
}): object
```

---

### Additional Schema Builders

- `buildPersonSchema()` — Person/author schema
- `buildOrganizationSchema()` — Organization schema
- `buildFAQSchema()` — FAQ page schema
- `buildVideoSchema()` — Video object schema

---

## Utility Functions

### Template Engine

#### `processTemplate()`

Process WordPress-style template variables.

```typescript
function processTemplate(
  template: string,
  data: Record<string, any>,
  config?: SEOConfig
): string
```

#### Available Variables

- `%%post_title%%` — Post title
- `%%post_excerpt%%` — Post excerpt
- `%%post_author%%` — Author name
- `%%post_date%%` — Publication date
- `%%sitetitle%%` — Site name
- `%%sep%%` — Separator (| or -)
- `%%currentdate%%` — Current date
- `%%currentyear%%` — Current year

#### Usage

```typescript
import { processTemplate } from 'reacteo';

const title = processTemplate(
  '%%post_title%% %%sep%% %%sitetitle%%',
  { post_title: 'My Post' },
  { appName: 'My Site' }
);
// Result: "My Post | My Site"
```

---

### Sitemap Generation

#### `generateSitemap()`

Generate XML sitemap from route configuration.

```typescript
function generateSitemap(config: SEOConfig): Promise<string>
```

#### Usage

```typescript
import { generateSitemap } from 'reacteo';
import seoConfig from './seo-config';

const xml = await generateSitemap(seoConfig);
// Write to dist/sitemap.xml
```

---

### Robots.txt Generation

#### `generateRobotsTxt()`

Generate robots.txt content.

```typescript
function generateRobotsTxt(config: {
  hostname: string;
  disallow?: string[];
  allow?: string[];
}): string
```

#### Usage

```typescript
import { generateRobotsTxt } from 'reacteo';

const robots = generateRobotsTxt({
  hostname: 'https://example.com',
  disallow: ['/admin', '/api'],
  allow: ['/api/public'],
});
```

---

### Validation

#### `validateSEO()`

Validate SEO props for completeness.

```typescript
function validateSEO(props: SEOProps): {
  valid: boolean;
  errors: string[];
  warnings: string[];
}
```

#### Usage

```typescript
import { validateSEO } from 'reacteo';

const result = validateSEO({
  title: 'Page Title',
  description: 'Description here',
});

if (!result.valid) {
  console.error('SEO validation errors:', result.errors);
}
```

---

## TypeScript Types

### Core Types

```typescript
// Main SEO props type
export interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string | string[];
  canonical?: string;
  robots?: string;
  openGraph?: OpenGraphProps;
  twitter?: TwitterCardProps;
  jsonLd?: object | object[];
  lang?: string;
}

// Open Graph type
export interface OpenGraphProps {
  type?: 'website' | 'article' | 'product' | 'profile';
  title?: string;
  description?: string;
  url?: string;
  image?: string;
  siteName?: string;
  locale?: string;
}

// Twitter Card type
export interface TwitterCardProps {
  card?: 'summary' | 'summary_large_image' | 'app' | 'player';
  site?: string;
  creator?: string;
  title?: string;
  description?: string;
  image?: string;
}

// Site configuration type
export interface SEOConfig {
  hostname: string;
  appName: string;
  defaultTitle?: string;
  defaultDescription?: string;
  titleTemplate?: string;
  defaultImage?: string;
  twitterHandle?: string;
  locale?: string;
  routes?: RouteConfig[];
}

// Route configuration
export interface RouteConfig {
  path: string;
  priority: number;
  changefreq: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  prerender?: boolean;
}
```

### AI Types

```typescript
export interface AuditResult {
  score: number;
  issues: Issue[];
  suggestions: Suggestion[];
  metrics: {
    h1Count: number;
    h2Count: number;
    imagesMissingAlt: number;
    metaDescriptionLength: number;
    titleLength: number;
  };
}

export interface BlogPost {
  id: number;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  author: string;
  publishedAt: string;
  updatedAt: string;
  tags?: string[];
  categories?: string[];
  status: 'draft' | 'published';
}
```

---

## Production Plugin

The production plugin provides server-side and client-side SEO integration.

### Server-Side Injection

#### `injectSeoMeta()`

Injects meta tags into HTML before sending to browser.

```typescript
async function injectSeoMeta(
  html: string,
  reqPath: string
): Promise<string>
```

#### Usage (Express)

```typescript
import { injectSeoMeta } from 'reacteo/plugin';

app.use('/*', async (req, res) => {
  let html = await fs.promises.readFile('index.html', 'utf-8');
  html = await injectSeoMeta(html, req.originalUrl);
  res.send(html);
});
```

---

### Client-Side Sync

#### `useSeoMeta()`

React hook for live meta updates on navigation.

```typescript
function useSeoMeta(): void
```

#### Usage

```tsx
import { useSeoMeta } from 'reacteo/plugin';

function SeoManager() {
  useSeoMeta(); // Automatically updates on route change
  return null;
}

function App() {
  return (
    <Router>
      <SeoManager />
      <Routes />
    </Router>
  );
}
```

---

### Setup Functions

#### `seedSeoPages()`

Seeds initial pages into database.

```typescript
async function seedSeoPages(): Promise<void>
```

#### `setupViteServer()`

Integrates with Vite dev server.

```typescript
function setupViteServer(app: Express, vite: ViteDevServer): void
```

#### `setupProductionServer()`

Integrates with production Express server.

```typescript
function setupProductionServer(app: Express, distPath: string): void
```

---

## Edge Functions API

### AI Generate

**Endpoint:** `POST /functions/v1/ai-generate`

**Body:**
```json
{
  "prompt": "Generate meta description",
  "provider": "openai",
  "model": "gpt-4o-mini",
  "maxTokens": 150
}
```

**Response:**
```json
{
  "content": "Generated text here",
  "usage": {
    "promptTokens": 10,
    "completionTokens": 50,
    "totalTokens": 60
  }
}
```

---

### AI Audit

**Endpoint:** `POST /functions/v1/ai-audit`

**Body:**
```json
{
  "url": "https://example.com/page",
  "provider": "openai",
  "model": "gpt-4o-mini"
}
```

**Response:**
```json
{
  "score": 85,
  "issues": [],
  "suggestions": [],
  "metrics": {}
}
```

---

### SEO Bulk Processor

**Endpoint:** `POST /functions/v1/seo-bulk-processor`

**Body:**
```json
{
  "pageType": "blog",
  "action": "generate"
}
```

---

## Examples

### Complete Page Setup

```tsx
import { SEO, useSEO, buildArticleSchema, buildBreadcrumbSchema } from 'reacteo';

function BlogPost({ post }) {
  const seoProps = useSEO({
    title: post.title,
    description: post.excerpt,
    canonical: post.url,
    openGraph: {
      type: 'article',
      url: post.url,
      image: post.coverImage,
    },
    twitter: {
      card: 'summary_large_image',
    },
    jsonLd: [
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
    ],
  });

  return (
    <>
      <SEO {...seoProps} />
      <article>
        <h1>{post.title}</h1>
        <p>{post.content}</p>
      </article>
    </>
  );
}
```

---

## Additional Resources

- [Installation Guide](./INSTALLATION.md)
- [Migration Guide](./MIGRATION_GUIDE.md)
- [Production Plugin Guide](./src/lib/seo/reactseo-plugin/REACTSEO_PLUGIN.md)
- [Contributing Guide](./CONTRIBUTING.md)

---

## Support

- **GitHub Issues**: https://github.com/heaventree-ltd/reacteo/issues
- **GitHub Discussions**: https://github.com/heaventree-ltd/reacteo/discussions
- **Email**: sean@heaventree.co

---

**Last Updated:** March 26, 2026 (v2.0.0)
