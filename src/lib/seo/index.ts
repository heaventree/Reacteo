// Context & Provider
export { SEOProvider, useSEOContext } from './context/SEOProvider';

// Components
export { SEO } from './components/SEO';
export { Image } from './components/Image';

// Hooks
export { useSEO } from './hooks/useSEO';

// Types
export type {
  SEOConfig,
  SEOProps,
  ImageProps,
  OpenGraphProps,
  TwitterCardProps,
  SchemaOrg,
  RouteMetadata,
  SitemapEntry,
  PreloadedState,
  BreadcrumbProps,
  BreadcrumbItem,
} from './types';

// Utilities
export {
  validateSEOConfig,
  validateRouteMetadata,
  isValidUrl,
  validateForDeployment,
  validateSitemapXML,
} from './utils/validation';

export type { DeploymentCheckResult } from './utils/validation';

// Schema builders
export {
  buildWebSiteSchema,
  buildArticleSchema,
  buildBreadcrumbSchema,
  buildProductSchema,
  buildLocalBusinessSchema,
} from './utils/schema';

export type {
  WebSiteSchema,
  ArticleSchema,
  BreadcrumbSchema,
  ProductSchema,
  LocalBusinessSchema,
} from './utils/schema';

// Sitemap & Robots utilities
export {
  generateSitemap,
  generateSitemapIndex,
} from './utils/sitemap';

export {
  generateRobotsTxt,
} from './utils/robots';

// Template engine
export {
  processTemplate,
} from './utils/template-engine';

// Admin components (optional, can be imported individually)
export { SettingsPanel } from './admin/SettingsPanel';
export { TemplateManager } from './admin/TemplateManager';
export { BulkOperationsView } from './admin/BulkOperationsView';
