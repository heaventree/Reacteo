# React SEO Kit - Quick Start Guide

Your React SEO Kit is fully integrated and ready to use! This guide shows you the essentials to get started in under 5 minutes.

## What You Have

The React SEO Kit solves three critical React/Vite SEO problems:

1. **Meta Tags** - Dynamic titles, descriptions, Open Graph, Twitter Cards, JSON-LD
2. **Image Optimization** - Lazy loading with CLS prevention (Cumulative Layout Shift)
3. **Automated Sitemaps** - Post-build sitemap.xml and robots.txt generation

## The 3-Step Integration (Already Done!)

1. ✅ **SEOProvider wrapped your app** in `src/main.tsx`
2. ✅ **Configuration file** created at `seo-config.ts`
3. ✅ **Example page** uses SEO components in `src/App.tsx`

## Using It on Your Pages

### Example 1: Simple Page

```typescript
import { SEO } from './lib/seo';

function AboutPage() {
  return (
    <>
      <SEO
        title="About Us"
        description="Learn more about our company and mission"
        canonical="https://example.com/about"
      />
      <h1>About Us</h1>
      <p>Company information...</p>
    </>
  );
}
```

### Example 2: Blog Post with Structured Data

```typescript
import { SEO, buildArticleSchema } from './lib/seo';

function BlogPost({ post }) {
  return (
    <>
      <SEO
        title={post.title}
        description={post.excerpt}
        canonical={`https://example.com/blog/${post.slug}`}
        openGraph={{
          type: 'article',
          url: `https://example.com/blog/${post.slug}`,
          image: post.coverImage,
          title: post.title,
          description: post.excerpt,
        }}
        jsonLd={buildArticleSchema(post.title, post.date, {
          author: post.author,
          image: post.coverImage,
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

### Example 3: Product Page with Optimized Image

```typescript
import { SEO, Image, buildProductSchema } from './lib/seo';

function ProductPage({ product }) {
  return (
    <>
      <SEO
        title={product.name}
        description={product.description}
        openGraph={{
          type: 'product',
          image: product.image,
          title: product.name,
        }}
        jsonLd={buildProductSchema(product.name, {
          description: product.description,
          image: product.image,
          price: {
            amount: product.price,
            currency: 'USD',
          },
        })}
      />

      <div>
        <Image
          src={product.image}
          alt={product.name}
          width={800}
          height={600}
          priority={true}
        />
        <h1>{product.name}</h1>
        <p>${product.price}</p>
      </div>
    </>
  );
}
```

## Configure Your Site

Edit `seo-config.ts`:

```typescript
export const seoConfig: SEOConfig = {
  hostname: 'https://yoursite.com',        // Your domain
  appName: 'My Awesome App',               // App name
  lang: 'en',                              // Language
  defaultDescription: 'Your description',  // Default meta description
  defaultOGImage: 'https://...og-image.jpg', // Default OG image
  routes: [
    {
      path: '/',
      priority: 1.0,
      label: 'Home',
    },
    {
      path: '/about',
      priority: 0.8,
      label: 'About',
    },
    // Add more routes...
  ],
};
```

## Build & Deploy

```bash
# Build your app (includes SEO kit generation)
npm run build

# This automatically:
# - Creates dist/sitemap.xml with all your routes
# - Creates dist/robots.txt
# - Generates minified production assets

# Verify everything is ready
npm run seo:audit
```

## Key Components

### SEO Component
Main component for all meta tags, Open Graph, Twitter Cards, JSON-LD.

```typescript
<SEO
  title="Page Title"
  description="Page description"
  canonical="https://example.com/page"
  openGraph={{ type: 'website', url: '...' }}
  twitter={{ card: 'summary_large_image' }}
  jsonLd={{ '@context': 'https://schema.org', ... }}
/>
```

### Image Component
Optimized image with lazy loading and CLS prevention.

```typescript
<Image
  src="/image.jpg"
  alt="Description"
  width={1200}
  height={600}
  priority={true}  // For above-fold images
/>
```

### Schema Builders
Pre-built JSON-LD schema generators.

```typescript
import { buildArticleSchema, buildProductSchema, buildBreadcrumbSchema } from './lib/seo';

const schema = buildArticleSchema('Title', '2024-03-11', {
  author: 'Author Name',
  image: 'image.jpg',
});
```

## npm Commands

```bash
npm run dev               # Start development server
npm run build             # Build + generate sitemap/robots.txt
npm run seo:audit         # Validate SEO setup
npm run seo:audit:pre-deploy  # Build + audit (run before deployment)
npm run preview           # Preview production build
```

## What Gets Generated

After `npm run build`:

```
dist/
├── index.html              # Your React app
├── sitemap.xml             # Search engine sitemap
├── robots.txt              # Crawler rules
└── assets/                 # JS, CSS, images
```

## Common Questions

**Q: Do I need to change my routing?**
A: No! The kit works with any routing library. Just add routes to `seo-config.ts`.

**Q: Does this work with dynamic content?**
A: Yes! Fetch routes from your CMS/database and add them to `seo-config.ts` before build.

**Q: Can I customize the schema?**
A: Absolutely. Use `buildCustomSchema` or pass raw JSON-LD directly.

**Q: How do I handle 404 pages?**
A: Add `{ path: '/404', noindex: true }` to your config.

**Q: Does this slow down my build?**
A: No. Sitemap generation is instant (< 1s for hundreds of routes).

## Next Steps

1. **Update `seo-config.ts`** with your actual domain and routes
2. **Add SEO components** to your pages
3. **Run `npm run build`** to generate sitemaps
4. **Test with Google Search Console** - submit your sitemap.xml
5. **Monitor Core Web Vitals** - image optimization improves scores

## Resources

- Full Documentation: See `SEO_KIT_README.md`
- Schema Reference: https://schema.org
- Open Graph: https://ogp.me
- Twitter Cards: https://developer.twitter.com/en/docs/twitter-for-websites/cards

---

**That's it!** Your site is now SEO-optimized. Happy shipping!
