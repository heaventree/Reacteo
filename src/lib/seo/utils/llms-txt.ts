/**
 * `llms.txt` generator (AEO / GEO).
 *
 * `llms.txt` is a Markdown file at the site root that gives language models a
 * curated, token-efficient map of a site. It exists because the two files a
 * model might otherwise reach for both fail at that job: `sitemap.xml` lists
 * every URL with no indication of which matter or what they cover, and a
 * rendered HTML page buries its content in navigation and markup.
 *
 * The format is a convention rather than a ratified standard, so the shape
 * below follows the widely adopted structure:
 *
 * ```markdown
 * # Site Name
 *
 * > One-line summary.
 *
 * Optional prose paragraphs.
 *
 * ## Section
 * - [Page title](https://example.com/page): why it matters
 *
 * ## Optional
 * - [Secondary page](https://example.com/other): skippable when short on context
 * ```
 *
 * The `## Optional` section is meaningful: models running low on context are
 * expected to drop it first, so put the non-essential links there.
 */

export interface LlmsTxtLink {
  title: string;
  url: string;
  /** Short note on what the page covers; strongly recommended. */
  description?: string;
}

export interface LlmsTxtSection {
  /** Section heading, e.g. `'Docs'`. */
  title: string;
  links: LlmsTxtLink[];
}

export interface LlmsTxtConfig {
  /** Site or project name — becomes the H1. */
  name: string;
  /** One-line summary rendered as a blockquote directly under the H1. */
  summary?: string;
  /** Free-form paragraphs of extra context. */
  details?: string | string[];
  /** Grouped link sections, rendered in order. */
  sections?: LlmsTxtSection[];
  /**
   * Links a context-constrained model may safely skip. Rendered as the
   * conventional trailing `## Optional` section.
   */
  optional?: LlmsTxtLink[];
}

/** Escapes the characters that would break Markdown link syntax. */
function escapeLinkText(text: string): string {
  return text.replace(/([[\]])/g, '\\$1');
}

function renderLink(link: LlmsTxtLink): string {
  const base = `- [${escapeLinkText(link.title)}](${link.url})`;
  return link.description ? `${base}: ${link.description}` : base;
}

/**
 * Renders an `llms.txt` document.
 *
 * Write the result to the site root as `/llms.txt`.
 */
export function generateLlmsTxt(config: LlmsTxtConfig): string {
  const blocks: string[] = [`# ${config.name}`];

  if (config.summary) {
    blocks.push(`> ${config.summary}`);
  }

  if (config.details) {
    const paragraphs = Array.isArray(config.details) ? config.details : [config.details];
    for (const paragraph of paragraphs) {
      if (paragraph.trim()) blocks.push(paragraph.trim());
    }
  }

  for (const section of config.sections ?? []) {
    if (section.links.length === 0) continue;
    blocks.push([`## ${section.title}`, ...section.links.map(renderLink)].join('\n'));
  }

  if (config.optional && config.optional.length > 0) {
    blocks.push(['## Optional', ...config.optional.map(renderLink)].join('\n'));
  }

  return `${blocks.join('\n\n')}\n`;
}

/**
 * Builds an `llms.txt` from the route table already declared in `SEOConfig`.
 *
 * This is a starting point, not a finished file: routes carry a crawl priority
 * but no description, and a description is the part a model actually benefits
 * from. Prefer authoring `llms.txt` by hand, or pass `descriptions` here to
 * fill them in.
 */
export function generateLlmsTxtFromRoutes(
  options: {
    name: string;
    hostname: string;
    summary?: string;
    details?: string | string[];
    routes: Array<{ path: string; label?: string; priority?: number }>;
    /** Map of route path to description. */
    descriptions?: Record<string, string>;
    /** Routes at or below this priority go under `## Optional`. Defaults to `0.5`. */
    optionalBelowPriority?: number;
  }
): string {
  const {
    name,
    hostname,
    summary,
    details,
    routes,
    descriptions = {},
    optionalBelowPriority = 0.5,
  } = options;

  const base = hostname.replace(/\/$/, '');
  const toLink = (route: { path: string; label?: string }): LlmsTxtLink => ({
    title: route.label || route.path,
    url: `${base}${route.path === '/' ? '/' : route.path}`,
    description: descriptions[route.path],
  });

  const primary = routes.filter((r) => (r.priority ?? 1) > optionalBelowPriority);
  const optional = routes.filter((r) => (r.priority ?? 1) <= optionalBelowPriority);

  return generateLlmsTxt({
    name,
    summary,
    details,
    sections: primary.length > 0 ? [{ title: 'Pages', links: primary.map(toLink) }] : [],
    optional: optional.map(toLink),
  });
}
