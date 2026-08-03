/**
 * Reacteo server entry point — `reacteo/server`.
 *
 * Everything here is intended to run in Node, not the browser. It is kept out
 * of the main entry because `generateDynamicSitemap` depends on the `sitemap`
 * package, which imports `node:stream`, `node:fs`, and friends; pulling that
 * into a browser bundle breaks the build.
 *
 * ```ts
 * import { generateDynamicSitemap, generateRobotsTxt } from 'reacteo/server';
 * ```
 *
 * The pure string builders below are also exported from the main entry, so
 * client code that needs them (an admin panel previewing robots.txt, say) does
 * not have to import this module.
 */

// Sitemap generation — Node only.
export { generateDynamicSitemap, generateSitemapIndex } from './utils/sitemap';

export type { SitemapPageRecord } from './utils/sitemap';

// robots.txt
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

// llms.txt
export { generateLlmsTxt, generateLlmsTxtFromRoutes } from './utils/llms-txt';

export type { LlmsTxtConfig, LlmsTxtSection, LlmsTxtLink } from './utils/llms-txt';

// Server-side meta injection
export { injectSeoMeta, buildMetaTags } from './ssr/inject-meta';

export type { InjectableMeta, InjectSeoMetaOptions } from './ssr/inject-meta';

// Schema builders are environment-agnostic and frequently needed server-side
// when composing JSON-LD for injection.
export * from './utils/schema';
