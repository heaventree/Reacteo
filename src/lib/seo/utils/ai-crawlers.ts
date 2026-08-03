/**
 * AI crawler registry and robots.txt policy helpers (GEO / AEO).
 *
 * Traditional robots.txt assumes one audience: search indexers. Generative
 * engines split that into three distinct behaviours, and a site usually wants
 * a different answer for each:
 *
 *  - `search`   — crawls to power a cited, linked answer (sends traffic back)
 *  - `training` — crawls to build model training corpora (sends nothing back)
 *  - `user`     — fetches a single URL live, because a user asked about it
 *
 * Blanket-blocking every AI user agent is the common mistake: it removes the
 * site from AI-generated answers entirely, which is a visibility decision, not
 * a privacy one. Allowing `search`/`user` while denying `training` is the
 * usual middle ground, and is what `recommendedAiCrawlerPolicy` encodes.
 */

export type AiCrawlerPurpose = 'search' | 'training' | 'user';

export interface AiCrawler {
  /** The literal `User-agent` token to match in robots.txt. */
  userAgent: string;
  /** Operator of the crawler. */
  operator: string;
  /** What the crawler does with what it fetches. */
  purpose: AiCrawlerPurpose[];
  /** Human-readable note on the trade-off of blocking it. */
  notes: string;
}

/**
 * Known AI crawlers, keyed by their robots.txt user-agent token.
 *
 * This list reflects publicly documented agents. Operators add and rename
 * agents frequently — treat it as a well-maintained default, not a guarantee
 * of completeness, and pass extra rules through `additionalRules` when needed.
 */
export const AI_CRAWLERS: AiCrawler[] = [
  {
    userAgent: 'GPTBot',
    operator: 'OpenAI',
    purpose: ['training'],
    notes: 'Collects training data. Blocking does not affect ChatGPT search citations.',
  },
  {
    userAgent: 'OAI-SearchBot',
    operator: 'OpenAI',
    purpose: ['search'],
    notes: 'Powers ChatGPT search results. Block only to opt out of being cited.',
  },
  {
    userAgent: 'ChatGPT-User',
    operator: 'OpenAI',
    purpose: ['user'],
    notes: 'Live fetch when a user shares or asks about a specific URL.',
  },
  {
    userAgent: 'ClaudeBot',
    operator: 'Anthropic',
    purpose: ['training'],
    notes: 'Collects training data for Claude.',
  },
  {
    userAgent: 'Claude-SearchBot',
    operator: 'Anthropic',
    purpose: ['search'],
    notes: 'Indexes pages to support cited answers in Claude.',
  },
  {
    userAgent: 'Claude-User',
    operator: 'Anthropic',
    purpose: ['user'],
    notes: 'Live fetch on behalf of a Claude user request.',
  },
  {
    userAgent: 'PerplexityBot',
    operator: 'Perplexity',
    purpose: ['search'],
    notes: 'Indexes pages for Perplexity answer citations.',
  },
  {
    userAgent: 'Perplexity-User',
    operator: 'Perplexity',
    purpose: ['user'],
    notes: 'Live fetch on behalf of a Perplexity user request.',
  },
  {
    userAgent: 'Google-Extended',
    operator: 'Google',
    purpose: ['training'],
    notes:
      'Controls Gemini training and AI Overviews grounding only. It is not a crawler; ' +
      'blocking it never affects normal Google Search ranking.',
  },
  {
    userAgent: 'Applebot-Extended',
    operator: 'Apple',
    purpose: ['training'],
    notes: 'Controls Apple Intelligence training use. Does not affect Siri/Spotlight indexing.',
  },
  {
    userAgent: 'Amazonbot',
    operator: 'Amazon',
    purpose: ['search', 'training'],
    notes: 'Supports Alexa answers and Amazon AI products.',
  },
  {
    userAgent: 'meta-externalagent',
    operator: 'Meta',
    purpose: ['training'],
    notes: 'Collects training data for Meta AI.',
  },
  {
    userAgent: 'Bytespider',
    operator: 'ByteDance',
    purpose: ['training'],
    notes: 'Aggressive crawler; widely blocked for bandwidth reasons.',
  },
  {
    userAgent: 'CCBot',
    operator: 'Common Crawl',
    purpose: ['training'],
    notes: 'Feeds the open Common Crawl corpus used by many model trainers.',
  },
  {
    userAgent: 'cohere-ai',
    operator: 'Cohere',
    purpose: ['training'],
    notes: 'Collects training data for Cohere models.',
  },
  {
    userAgent: 'MistralAI-User',
    operator: 'Mistral',
    purpose: ['user'],
    notes: 'Live fetch on behalf of a Le Chat user request.',
  },
  {
    userAgent: 'DuckAssistBot',
    operator: 'DuckDuckGo',
    purpose: ['search'],
    notes: 'Powers DuckAssist answer summaries.',
  },
  {
    userAgent: 'YouBot',
    operator: 'You.com',
    purpose: ['search'],
    notes: 'Indexes pages for You.com answers.',
  },
  {
    userAgent: 'Diffbot',
    operator: 'Diffbot',
    purpose: ['training'],
    notes: 'Builds structured knowledge-graph data from crawled pages.',
  },
  {
    userAgent: 'Timpibot',
    operator: 'Timpi',
    purpose: ['training'],
    notes: 'Collects data for a decentralised search index.',
  },
];

/** Returns every known crawler matching any of the given purposes. */
export function getAiCrawlersByPurpose(...purposes: AiCrawlerPurpose[]): AiCrawler[] {
  return AI_CRAWLERS.filter((c) => c.purpose.some((p) => purposes.includes(p)));
}

export interface AiCrawlerPolicyOptions {
  /**
   * Allow crawlers that produce cited, linked answers. Blocking these removes
   * the site from AI answer surfaces entirely. Defaults to `true`.
   */
  allowSearch?: boolean;
  /**
   * Allow crawlers that collect model training data. Defaults to `false` —
   * training crawls return no traffic, so opting out is the common choice.
   */
  allowTraining?: boolean;
  /**
   * Allow live, user-initiated fetches of a single URL. Blocking these breaks
   * "summarise this page" for a user who explicitly pasted the link.
   * Defaults to `true`.
   */
  allowUserInitiated?: boolean;
  /** Paths withheld from every AI crawler, regardless of the above. */
  disallowPaths?: string[];
}

export interface AiCrawlerRule {
  userAgent: string;
  allow?: string[];
  disallow?: string[];
}

/**
 * Builds robots.txt rules for the known AI crawlers.
 *
 * A crawler is allowed only if *every* purpose it serves is allowed — a crawler
 * that both trains and searches is blocked when training is disallowed, since
 * robots.txt cannot express a partial grant.
 */
export function buildAiCrawlerRules(options: AiCrawlerPolicyOptions = {}): AiCrawlerRule[] {
  const {
    allowSearch = true,
    allowTraining = false,
    allowUserInitiated = true,
    disallowPaths = [],
  } = options;

  const allowed: Record<AiCrawlerPurpose, boolean> = {
    search: allowSearch,
    training: allowTraining,
    user: allowUserInitiated,
  };

  return AI_CRAWLERS.map((crawler) => {
    const permitted = crawler.purpose.every((p) => allowed[p]);

    if (!permitted) {
      return { userAgent: crawler.userAgent, disallow: ['/'] };
    }

    return {
      userAgent: crawler.userAgent,
      allow: ['/'],
      ...(disallowPaths.length > 0 ? { disallow: [...disallowPaths] } : {}),
    };
  });
}

/**
 * The recommended default policy: welcome crawlers that cite and link back,
 * decline crawlers that only harvest for training.
 */
export function recommendedAiCrawlerPolicy(disallowPaths: string[] = []): AiCrawlerRule[] {
  return buildAiCrawlerRules({
    allowSearch: true,
    allowUserInitiated: true,
    allowTraining: false,
    disallowPaths,
  });
}
