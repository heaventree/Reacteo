/**
 * Reacteo core entry point — `reacteo/core`.
 *
 * The lean surface: no Supabase client, no admin UI, no icon library, no
 * `sitemap` package. Safe in a browser bundle and in Node. Use it for sites
 * that keep their SEO in code (see `createSeoRegistry`) rather than in a
 * database.
 *
 * `SEO` and `SEOProvider` need `react` and `react-helmet-async`; everything
 * else is dependency-free.
 */

export { createSeoRegistry, normalizePath } from './registry';

export type {
  SeoRegistry,
  SeoSiteDefinition,
  RegistryPage,
  RegistryArticle,
  RegistryPublisher,
  RegistryRobotsOptions,
  ResolvedPage,
  PageSchemaType,
  ChangeFreq,
} from './registry';

export { SEO } from './components/SEO';
export { SEOProvider, useSEOContext } from './context/SEOProvider';

export { injectSeoMeta, buildMetaTags } from './ssr/inject-meta';
export { syncSeoMeta } from './client/sync-head';
export type { InjectableMeta, InjectSeoMetaOptions } from './ssr/inject-meta';

export { generateRobotsTxt } from './utils/robots';
export type { RobotsConfig, RobotsRule } from './utils/robots';

export {
  AI_CRAWLERS,
  getAiCrawlersByPurpose,
  buildAiCrawlerRules,
  recommendedAiCrawlerPolicy,
} from './utils/ai-crawlers';
export type { AiCrawler, AiCrawlerPurpose, AiCrawlerPolicyOptions } from './utils/ai-crawlers';

export { generateLlmsTxt, generateLlmsTxtFromRoutes } from './utils/llms-txt';
export type { LlmsTxtConfig, LlmsTxtSection, LlmsTxtLink } from './utils/llms-txt';

export * from './utils/schema';

export type { SEOProps, SchemaOrg, OpenGraphProps, TwitterCardProps, AlternateLink } from './types';
