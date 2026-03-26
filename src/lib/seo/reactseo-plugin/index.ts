/**
 * Reacteo Production Plugin
 *
 * Battle-tested SEO implementation from niimo.io with:
 * - Server-side meta injection for crawlers
 * - Client-side live sync for SPAs
 * - Proven solutions to common pitfalls
 *
 * See REACTSEO_PLUGIN.md for complete implementation guide.
 */

// Client-side hooks
export { useSeoMeta, useAnalyticsInjection } from './client/src/hooks/useSeoMeta';

// Server-side utilities
export { injectSeoMeta } from './server/seo-inject';
export { serveStatic } from './server/static';
export { seedSeoPages } from './server/seed-seo-pages';

// Types (to be defined based on implementation)
export type {
  SeoConfig,
  PageMeta,
} from './client/src/hooks/useSeoMeta';
