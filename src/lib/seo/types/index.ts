import type React from 'react';
import type { TemplateContext } from '../utils/template-engine';

export interface OpenGraphProps {
  type?: 'website' | 'article' | 'product' | 'video' | 'music' | 'profile';
  url?: string;
  title?: string;
  description?: string;
  image?: string | OpenGraphImage[];
  siteName?: string;
  locale?: string;
}

export interface OpenGraphImage {
  url: string;
  width?: number;
  height?: number;
  alt?: string;
  type?: string;
}

export interface TwitterCardProps {
  card?: 'summary' | 'summary_large_image' | 'app' | 'player';
  site?: string;
  creator?: string;
  title?: string;
  description?: string;
  image?: string;
  imageAlt?: string;
}

/**
 * Open Graph `article:*` properties. Emitted when `openGraph.type` is
 * `'article'`. Publication dates double as freshness signals for answer
 * engines, which weight recency when selecting citation sources.
 */
export interface OpenGraphArticle {
  publishedTime?: string;
  modifiedTime?: string;
  expirationTime?: string;
  author?: string | string[];
  section?: string;
  tag?: string | string[];
}

/** A single `<link rel="alternate" hreflang="...">` entry. */
export interface AlternateLink {
  hreflang: string;
  href: string;
}

/**
 * Granular `robots` directives. Beyond index/follow, these control how much
 * of a page search and answer engines may surface — `maxSnippet: -1` and
 * `maxImagePreview: 'large'` are effectively required for rich results and
 * for inclusion in AI-generated answers.
 */
export interface RobotsDirectives {
  maxSnippet?: number;
  maxImagePreview?: 'none' | 'standard' | 'large';
  maxVideoPreview?: number;
  noarchive?: boolean;
  nositelinkssearchbox?: boolean;
  notranslate?: boolean;
  noimageindex?: boolean;
  unavailableAfter?: string;
}

export interface SchemaOrg {
  '@context'?: string;
  '@type': string;
  [key: string]: unknown;
}

export interface SEOProps {
  title?: string;
  description?: string;
  canonical?: string;
  lang?: string;
  openGraph?: OpenGraphProps;
  twitter?: TwitterCardProps;
  jsonLd?: SchemaOrg | SchemaOrg[];
  noindex?: boolean;
  nofollow?: boolean;
  templateContext?: TemplateContext;
  /** `article:*` Open Graph properties; only emitted for `openGraph.type === 'article'`. */
  article?: OpenGraphArticle;
  /** `<link rel="alternate" hreflang>` entries for multi-locale sites. */
  alternates?: AlternateLink[];
  /** Granular robots directives (snippet length, image preview size, etc.). */
  robots?: RobotsDirectives;
  /** Browser UI theme colour (`<meta name="theme-color">`). */
  themeColor?: string;
  /** Author name, emitted as `<meta name="author">` — an E-E-A-T signal. */
  author?: string;
  /** Overrides the `<link rel="alternate">` RSS/Atom feed URL. */
  feedUrl?: string;
}

export interface RouteMetadata {
  path: string;
  priority?: number;
  changefreq?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  label?: string;
  prerender?: boolean;
}

export interface SitemapEntry {
  url: string;
  changefreq?: string;
  priority?: number;
  lastmod?: string;
  alternates?: Array<{
    hreflang: string;
    href: string;
  }>;
}

export interface SEOConfig {
  hostname: string;
  appName: string;
  lang?: string;
  defaultDescription?: string;
  defaultOGImage?: string;
  routes: RouteMetadata[];
  environment?: 'development' | 'staging' | 'production';
}

export interface PreloadedState {
  [key: string]: unknown;
}

export interface ImageProps
  extends Omit<React.ImgHTMLAttributes<HTMLImageElement>, 'onError'> {
  src: string;
  alt: string;
  width: number;
  height: number;
  priority?: boolean;
  formats?: ('webp' | 'avif')[];
  sizes?: string;
  onError?: (error: Error) => void;
}

export interface BreadcrumbItem {
  name: string;
  url: string;
}

export interface BreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
}
