/**
 * Dynamic Robots.txt Generator
 */

import { recommendedAiCrawlerPolicy, type AiCrawlerPolicyOptions, buildAiCrawlerRules } from './ai-crawlers';

export interface RobotsRule {
  userAgent: string;
  allow?: string[];
  disallow?: string[];
  /** Seconds between requests. Ignored by Google; honoured by Bing and others. */
  crawlDelay?: number;
}

export interface RobotsConfig {
  hostname: string;
  sitemapUrls?: string[];
  rules: RobotsRule[];
  /**
   * Append per-crawler rules for known AI user agents.
   *
   * `true` applies the recommended policy (allow engines that cite and link
   * back, deny training-only crawlers); pass an options object to choose a
   * different split. Omit to emit no AI-specific rules at all — note that a
   * bare `User-agent: *` block leaves the decision to each operator's default,
   * which is generally to crawl.
   */
  aiCrawlers?: boolean | AiCrawlerPolicyOptions;
  /** Path to the llms.txt file, emitted as a trailing comment for discoverability. */
  llmsTxtUrl?: string;
}

/**
 * Generates the contents of a robots.txt file.
 * 
 * Example usage in an API Route:
 * ```ts
 * const txt = generateRobotsTxt({
 *   hostname: 'https://mysite.com',
 *   sitemapUrls: ['https://mysite.com/api/sitemap.xml'],
 *   rules: [
 *     { userAgent: '*', disallow: ['/admin', '/api'], allow: ['/'] }
 *   ]
 * });
 * res.setHeader('Content-Type', 'text/plain');
 * res.send(txt);
 * ```
 */
export function generateRobotsTxt(config: RobotsConfig): string {
  const lines: string[] = [];

  const emitRule = (rule: RobotsRule) => {
    lines.push(`User-agent: ${rule.userAgent}`);

    // Allow lines precede Disallow: where two rules match the same path with
    // equal specificity, the crawler resolves the tie toward Allow, so an
    // explicit carve-out is not swallowed by a broader Disallow above it.
    rule.allow?.forEach((path) => lines.push(`Allow: ${path}`));
    rule.disallow?.forEach((path) => lines.push(`Disallow: ${path}`));

    if (rule.crawlDelay !== undefined) {
      lines.push(`Crawl-delay: ${rule.crawlDelay}`);
    }

    lines.push(''); // Empty line between rules
  };

  config.rules.forEach(emitRule);

  if (config.aiCrawlers) {
    const aiRules =
      config.aiCrawlers === true
        ? recommendedAiCrawlerPolicy()
        : buildAiCrawlerRules(config.aiCrawlers);

    lines.push('# AI crawler policy');
    aiRules.forEach(emitRule);
  }

  if (config.sitemapUrls && config.sitemapUrls.length > 0) {
    config.sitemapUrls.forEach(url => {
      lines.push(`Sitemap: ${url}`);
    });
  } else {
    lines.push(`Sitemap: ${config.hostname}/sitemap.xml`);
  }

  if (config.llmsTxtUrl) {
    // llms.txt has no robots.txt directive of its own; a comment is the
    // conventional way to point crawlers at it.
    lines.push(`# llms.txt: ${config.llmsTxtUrl}`);
  }

  return `${lines.join('\n')}\n`;
}
