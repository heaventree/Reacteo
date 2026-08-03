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
  OpenGraphImage,
  OpenGraphArticle,
  TwitterCardProps,
  AlternateLink,
  RobotsDirectives,
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
  buildFAQSchema,
  buildHowToSchema,
  buildQAPageSchema,
  buildOrganizationSchema,
  buildPersonSchema,
  buildVideoSchema,
  buildWebPageSchema,
  buildSpeakableSpecification,
  buildSchemaGraph,
} from './utils/schema';

export type {
  WebSiteSchema,
  ArticleSchema,
  BreadcrumbSchema,
  ProductSchema,
  LocalBusinessSchema,
  FAQPageSchema,
  HowToSchema,
  QAPageSchema,
  OrganizationSchema,
  PersonSchema,
  VideoObjectSchema,
  WebPageSchema,
  SpeakableSpecification,
  SchemaAuthor,
} from './utils/schema';

// robots.txt (pure string building — safe in any environment).
//
// Sitemap generation is NOT exported here: it depends on the `sitemap` package,
// which pulls in node:stream/node:fs and breaks browser bundles. Import it from
// `reacteo/server` instead.
export { generateRobotsTxt } from './utils/robots';

export type { RobotsConfig, RobotsRule } from './utils/robots';

// AI crawler policy (GEO / AEO)
export {
  AI_CRAWLERS,
  getAiCrawlersByPurpose,
  buildAiCrawlerRules,
  recommendedAiCrawlerPolicy,
} from './utils/ai-crawlers';

export type {
  AiCrawler,
  AiCrawlerPurpose,
  AiCrawlerRule,
  AiCrawlerPolicyOptions,
} from './utils/ai-crawlers';

// llms.txt (AEO)
export { generateLlmsTxt, generateLlmsTxtFromRoutes } from './utils/llms-txt';

export type { LlmsTxtConfig, LlmsTxtSection, LlmsTxtLink } from './utils/llms-txt';

// Server-side meta injection
export { injectSeoMeta, buildMetaTags } from './ssr/inject-meta';

export type { InjectableMeta, InjectSeoMetaOptions } from './ssr/inject-meta';

// Template engine
export { renderTemplate, renderSeoTemplates, defaultTemplateContext } from './utils/template-engine';

export type { TemplateContext } from './utils/template-engine';

// Admin components (optional, can be imported individually)
export { SettingsPanel } from './admin/SettingsPanel';
export { TemplateManager } from './admin/TemplateManager';
export { BulkOperationsView } from './admin/BulkOperationsView';
