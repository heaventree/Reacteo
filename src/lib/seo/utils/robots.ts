/**
 * Dynamic Robots.txt Generator
 */

export interface RobotsConfig {
  hostname: string;
  sitemapUrls?: string[];
  rules: {
    userAgent: string;
    allow?: string[];
    disallow?: string[];
  }[];
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

  config.rules.forEach(rule => {
    lines.push(`User-agent: ${rule.userAgent}`);
    
    if (rule.disallow) {
      rule.disallow.forEach(path => {
        lines.push(`Disallow: ${path}`);
      });
    }

    if (rule.allow) {
      rule.allow.forEach(path => {
        lines.push(`Allow: ${path}`);
      });
    }
    
    lines.push(''); // Empty line between rules
  });

  if (config.sitemapUrls && config.sitemapUrls.length > 0) {
    config.sitemapUrls.forEach(url => {
      lines.push(`Sitemap: ${url}`);
    });
  } else {
    lines.push(`Sitemap: ${config.hostname}/sitemap.xml`);
  }

  return lines.join('\n');
}
