# React SEO Kit - Production-Ready Plugin System

A lightweight, zero-friction SEO toolkit for Vite/React applications that solves the three critical CSR React SEO problems: blank page indexing, dynamic meta tag management, and automated sitemap generation.

## Features

- **Unified Meta Tag Management** - SEO component wrapper around react-helmet-async with support for Open Graph, Twitter Cards, and JSON-LD structured data
- **Optimized Image Component** - Strict Image component that enforces dimensions to prevent Cumulative Layout Shift and implements intelligent lazy loading
- **Automated Sitemap Generation** - Post-build script that generates sitemap.xml and robots.txt from your routes configuration
- **Pre-deployment Validation** - Audit script ensures SEO readiness before deployment
- **Type-Safe** - Full TypeScript support with comprehensive type definitions
- **Zero Breaking Changes** - Integrates seamlessly via provider pattern without modifying existing code
- **Framework Agnostic** - Works with React Router, TanStack Router, or custom routing solutions

## Installation

The SEO Kit is already integrated into this project! The following dependencies have been installed:

```bash
npm install react-helmet-async sitemap vite-plugin-prerender
```

## Quick Start

### 1. Configure Your SEO Settings

Edit `seo-config.ts` at the project root:

```typescript
import type { SEOConfig } from './src/lib/seo/types';

export const seoConfig: SEOConfig = {
  hostname: 'https://example.com',
  appName: 'My Awesome App',
  lang: 'en',
  defaultDescription: 'A modern, SEO-optimized React application',
  defaultOGImage: 'https://example.com/og-image.jpg',
  routes: [
    {
      path: '/',
      priority: 1.0,
      changefreq: 'daily',
      label: 'Home',
      prerender: true,
    },
    {
      path: '/about',
      priority: 0.8,
      changefreq: 'monthly',
      label: 'About',
      prerender: true,
    },
  ],
};
```

### 2. Use SEO Component on Pages

```typescript
import { SEO } from './lib/seo';
import { buildArticleSchema } from './lib/seo';

function BlogPostPage() {
  return (
    <>
      <SEO
        title="My Blog Post"
        description="An interesting blog post about React SEO"
        canonical="https://example.com/blog/my-post"
        openGraph={{
          type: 'article',
          url: 'https://example.com/blog/my-post',
          title: 'My Blog Post',
          description: 'An interesting blog post about React SEO',
          image: 'https://example.com/blog-image.jpg',
        }}
        jsonLd={buildArticleSchema('My Blog Post', '2024-01-15', {
          description: 'An interesting blog post about React SEO',
          author: 'Your Name',
          image: 'https://example.com/blog-image.jpg',
        })}
      />

      <article>
        <h1>My Blog Post</h1>
        <p>Content here...</p>
      </article>
    </>
  );
}
```

### 3. Use Optimized Image Component

```typescript
import { Image } from './lib/seo';

export function ProductGallery() {
  return (
    <div>
      {/* Hero image - priority loading */}
      <Image
        src="/hero.jpg"
        alt="Product Hero"
        width={1200}
        height={600}
        priority={true}
      />

      {/* Secondary images - lazy loaded */}
      <Image
        src="/product-detail-1.jpg"
        alt="Product Detail"
        width={400}
        height={300}
      />

      {/* With format negotiation */}
      <Image
        src="/product.jpg"
        alt="Product"
        width={800}
        height={600}
        formats={['avif', 'webp']}
      />
    </div>
  );
}
```

### 4. Build and Deploy

```bash
# Standard build - includes SEO kit
npm run build

# This automatically:
# - Builds your React app with Vite
# - Generates sitemap.xml from routes
# - Generates robots.txt
```

### 5. Pre-deployment Validation

```bash
# Run SEO audit before deploying
npm run seo:audit

# Or build and audit together
npm run seo:audit:pre-deploy
```

## Core Components & Utilities

### SEO Component

Main component for injecting meta tags and structured data:

```typescript
<SEO
  title="Page Title"
  description="Page description"
  canonical="https://example.com/page"
  lang="en"
  noindex={false}
  nofollow={false}
  openGraph={{
    type: 'website',
    url: 'https://example.com/page',
    title: 'Page Title',
    description: 'Page description',
    image: 'https://example.com/image.jpg',
  }}
  twitter={{
    card: 'summary_large_image',
    site: '@yourhandle',
    creator: '@author',
  }}
  jsonLd={{
    '@context': 'https://schema.org',
    '@type': 'WebPage',
  }}
/>
```

### Image Component

Optimized image with lazy loading and CLS prevention:

```typescript
<Image
  src="/image.jpg"
  alt="Description"
  width={1200}
  height={600}
  priority={false}
  formats={['webp']}
  sizes="(max-width: 640px) 100vw, 50vw"
  className="rounded-lg"
/>
```

**Props:**
- `src` (required) - Image URL
- `alt` (required) - Alt text for accessibility
- `width` (required) - Image width in pixels
- `height` (required) - Image height in pixels
- `priority` (default: false) - Use eager loading for above-fold images
- `formats` (default: ['webp']) - Supported image formats
- `sizes` - Responsive sizes attribute
- `className` - Tailwind classes

### useSEO Hook

For functional components that prefer hook-based API:

```typescript
import { useSEO } from './lib/seo';

function MyPage() {
  useSEO({
    title: 'My Page',
    description: 'Page description',
  });

  return <div>Page content</div>;
}
```

### Schema Builders

Type-safe JSON-LD schema builders for common types:

```typescript
import {
  buildWebSiteSchema,
  buildArticleSchema,
  buildProductSchema,
  buildBreadcrumbSchema,
  buildLocalBusinessSchema,
} from './lib/seo';

// Website
const websiteSchema = buildWebSiteSchema('My App', 'https://example.com', {
  description: 'App description',
  image: 'https://example.com/image.jpg',
});

// Article
const articleSchema = buildArticleSchema('Article Title', '2024-01-15', {
  description: 'Article description',
  author: 'Author Name',
  image: 'https://example.com/article-image.jpg',
});

// Product
const productSchema = buildProductSchema('Product Name', {
  description: 'Product description',
  image: 'https://example.com/product.jpg',
  brand: 'Brand Name',
  price: {
    amount: '99.99',
    currency: 'USD',
    availability: 'InStock',
  },
});

// Breadcrumbs
const breadcrumbSchema = buildBreadcrumbSchema([
  { name: 'Home', url: 'https://example.com' },
  { name: 'Products', url: 'https://example.com/products' },
  { name: 'Shoes' },
]);
```

## Configuration

### SEOConfig Interface

```typescript
interface SEOConfig {
  // Domain/URL (required)
  hostname: string;

  // Application name (required)
  appName: string;

  // Default language (default: 'en')
  lang?: string;

  // Default meta description
  defaultDescription?: string;

  // Default OG image
  defaultOGImage?: string;

  // Routes for sitemap/prerender (required)
  routes: RouteMetadata[];

  // Environment (default: 'development')
  environment?: 'development' | 'staging' | 'production';
}
```

### RouteMetadata Interface

```typescript
interface RouteMetadata {
  // URL path (required)
  path: string;

  // Priority for sitemap (0-1, default: 0.8)
  priority?: number;

  // Change frequency for sitemap
  changefreq?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';

  // Display label for breadcrumbs
  label?: string;

  // Whether to pre-render this route
  prerender?: boolean;
}
```

## Environment Variables

Configure SEO settings via environment variables in `.env.local`:

```env
# Hostname for sitemap and canonical URLs
VITE_SEO_HOSTNAME=https://example.com

# Default OG image URL
VITE_SEO_OG_IMAGE=https://example.com/og-image.jpg
```

## Pre-deployment Checklist

The SEO kit includes an audit system that validates:

- ✅ SEO configuration is properly set
- ✅ All routes have required metadata
- ✅ Pre-render routes are specified
- ✅ Default OG image is configured
- ✅ sitemap.xml is generated and valid
- ✅ robots.txt is generated
- ✅ index.html exists in build
- ✅ HTML files are present in dist

Run the audit before deployment:

```bash
npm run seo:audit:pre-deploy
```

## Development Warnings

In development mode, the kit displays warnings for missing SEO metadata:

```
[SEO Kit] Page metadata warnings:
- Missing SEO title
- Missing SEO description
- OpenGraph specified but no image provided
```

These warnings help catch SEO issues early without breaking your app.

## TypeScript Support

All components and utilities are fully typed:

```typescript
import type {
  SEOConfig,
  SEOProps,
  ImageProps,
  RouteMetadata,
  DeploymentCheckResult,
} from './lib/seo';
```

## Common Use Cases

### Blog Post Page

```typescript
import { SEO } from './lib/seo';
import { buildArticleSchema } from './lib/seo';

export function BlogPost({ post }) {
  return (
    <>
      <SEO
        title={post.title}
        description={post.excerpt}
        canonical={`https://example.com/blog/${post.slug}`}
        openGraph={{
          type: 'article',
          url: `https://example.com/blog/${post.slug}`,
          title: post.title,
          description: post.excerpt,
          image: post.coverImage,
        }}
        jsonLd={buildArticleSchema(post.title, post.publishedAt, {
          description: post.excerpt,
          author: post.author,
          image: post.coverImage,
          dateModified: post.updatedAt,
        })}
      />

      <article>
        <h1>{post.title}</h1>
        <p>{post.content}</p>
      </article>
    </>
  );
}
```

### Product Page

```typescript
import { SEO, Image } from './lib/seo';
import { buildProductSchema } from './lib/seo';

export function ProductPage({ product }) {
  return (
    <>
      <SEO
        title={product.name}
        description={product.description}
        canonical={`https://example.com/products/${product.id}`}
        openGraph={{
          type: 'product',
          url: `https://example.com/products/${product.id}`,
          title: product.name,
          description: product.description,
          image: product.image,
        }}
        jsonLd={buildProductSchema(product.name, {
          description: product.description,
          image: product.image,
          brand: product.brand,
          price: {
            amount: product.price.toString(),
            currency: 'USD',
          },
          rating: {
            value: product.rating,
            count: product.reviewCount,
          },
        })}
      />

      <div>
        <Image
          src={product.image}
          alt={product.name}
          width={800}
          height={800}
          priority={true}
        />
        <h1>{product.name}</h1>
        <p>${product.price}</p>
      </div>
    </>
  );
}
```

### E-commerce Category Page

```typescript
import { SEO } from './lib/seo';
import { buildBreadcrumbSchema } from './lib/seo';

export function CategoryPage({ category }) {
  return (
    <>
      <SEO
        title={`${category.name} | Shop`}
        description={`Browse our ${category.name} collection`}
        canonical={`https://example.com/shop/${category.slug}`}
        jsonLd={buildBreadcrumbSchema([
          { name: 'Home', url: 'https://example.com' },
          { name: 'Shop', url: 'https://example.com/shop' },
          { name: category.name },
        ])}
      />

      <div>
        <h1>{category.name}</h1>
        <div className="grid">
          {/* Products */}
        </div>
      </div>
    </>
  );
}
```

## Troubleshooting

### Sitemap not generating

1. Make sure `npm run build` completes successfully
2. Check that seo-config.ts has routes defined
3. Verify dist/ directory exists after build
4. Run `npm run seo:audit` to see specific errors

### Meta tags not appearing

1. Ensure SEO component is placed at top of page component
2. Check that SEOProvider wraps your App in main.tsx
3. Verify component is rendering in browser (check DOM)
4. In development mode, check console for warnings

### Image optimization not working

1. Ensure Image component has width and height props
2. Check that alt text is provided
3. Verify src URL is correct and accessible
4. For formats support, ensure browser supports WebP/AVIF

### Pre-deployment audit failing

1. Run `npm run build` first
2. Check console output for specific audit failures
3. Verify all required config values are set
4. Ensure at least one route has prerender: true

## API Reference

### Components

#### SEO

Injects all head elements and meta tags.

**Props:**
- `title?: string` - Page title
- `description?: string` - Meta description
- `canonical?: string` - Canonical URL
- `lang?: string` - Page language
- `noindex?: boolean` - Prevent indexing
- `nofollow?: boolean` - Prevent following
- `openGraph?: OpenGraphProps` - Open Graph tags
- `twitter?: TwitterCardProps` - Twitter Card tags
- `jsonLd?: SchemaOrg | SchemaOrg[]` - JSON-LD structured data

#### Image

Optimized image with lazy loading.

**Props:**
- `src: string` - Image URL (required)
- `alt: string` - Alt text (required)
- `width: number` - Image width (required)
- `height: number` - Image height (required)
- `priority?: boolean` - Eager load (default: false)
- `formats?: string[]` - Image formats (default: ['webp'])
- `sizes?: string` - Responsive sizes
- `className?: string` - CSS classes
- `onError?: (error: Error) => void` - Error callback

### Hooks

#### useSEO

Inject SEO metadata via hook.

**Usage:**
```typescript
useSEO({
  title: 'Page Title',
  description: 'Page description',
  // ... other SEOProps
});
```

### Validation Utilities

#### validateSEOConfig

Validates SEO configuration.

```typescript
const errors = validateSEOConfig(config);
if (errors.length > 0) {
  console.error('Config errors:', errors);
}
```

#### validateForDeployment

Pre-deployment validation with detailed report.

```typescript
const result = validateForDeployment(config);
if (!result.passed) {
  result.checks.forEach(check => {
    console.log(`${check.name}: ${check.passed ? '✅' : '❌'}`);
  });
}
```

## Advanced Usage

### Dynamic Routes

For CMS-based content with dynamic routes:

```typescript
// seo-config.ts
async function getDynamicRoutes() {
  const posts = await fetchBlogPosts();
  return posts.map(post => ({
    path: `/blog/${post.slug}`,
    priority: 0.7,
    changefreq: 'weekly',
    label: post.title,
  }));
}

export const seoConfig: SEOConfig = {
  hostname: 'https://example.com',
  appName: 'My Blog',
  routes: [
    { path: '/', priority: 1.0, prerender: true },
    ...(await getDynamicRoutes()),
  ],
};
```

### Conditional Meta Tags

```typescript
<SEO
  title={title}
  description={description}
  noindex={isDraft} // Don't index draft posts
  nofollow={isPrivate} // Don't follow private pages
  openGraph={{
    type: 'article',
    image: featuredImage || undefined, // Optional image
  }}
/>
```

### Multiple JSON-LD Schemas

```typescript
<SEO
  title="Product"
  jsonLd={[
    buildProductSchema('Product Name', {...}),
    buildBreadcrumbSchema([...]),
  ]}
/>
```

## Performance Tips

1. **Always use priority={true} for above-fold images** - Improves Largest Contentful Paint (LCP)
2. **Specify image dimensions** - Prevents Cumulative Layout Shift (CLS)
3. **Use modern formats** - AVIF and WebP provide better compression
4. **Lazy load below-fold images** - Reduces initial page load
5. **Keep descriptions concise** - Better click-through rates in SERPs

## Browser Support

The React SEO Kit supports all modern browsers:

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS Safari, Chrome Mobile)

## License

MIT

## Support

For issues or questions:

1. Check the Troubleshooting section above
2. Review TypeScript types for available props
3. Run the SEO audit for validation errors
4. Check browser console for development warnings

## What's Included

```
lib/seo/
├── components/
│   ├── SEO.tsx           # Main SEO component
│   ├── Image.tsx         # Optimized image
│   └── Breadcrumbs.tsx   # Future: breadcrumb UI
├── context/
│   └── SEOProvider.tsx   # Provider wrapper
├── hooks/
│   └── useSEO.ts         # useSEO hook
├── types/
│   └── index.ts          # TypeScript types
├── utils/
│   ├── schema.ts         # JSON-LD builders
│   └── validation.ts     # Config validation
└── index.ts              # Public API

scripts/
├── generate-sitemap.ts   # Sitemap generation
├── generate-robots.ts    # Robots.txt generation
└── seo-audit.ts          # Pre-deployment audit

seo-config.ts             # Configuration file
```

---

**React SEO Kit** - Production-ready SEO for modern React applications.
