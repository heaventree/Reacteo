/**
 * Route registry: one file-based source of truth for a site's SEO.
 *
 * Define every page once — title, description, schema type, priority, FAQ,
 * article dates — and the registry derives everything that has to agree with
 * it: the per-route head tags (client and server), `sitemap.xml`, `robots.txt`
 * and `llms.txt`. There is no database and no admin UI; the content lives in
 * the repository next to the code, so a change to a page's metadata is a
 * reviewable diff.
 *
 * ```ts
 * const seo = createSeoRegistry({
 *   name: 'Acme',
 *   hostname: 'https://acme.example',
 *   titleTemplate: '%s | Acme',
 *   pages: [{ path: '/', title: 'Acme — Widgets', description: '…' }],
 * });
 *
 * app.get('*', (req, res) => res.send(injectSeoMeta(html, seo.meta(req.path))));
 * ```
 */

import type { AlternateLink, RouteMetadata, SchemaOrg, SEOProps } from '../types';
import type { InjectableMeta } from '../ssr/inject-meta';
import {
  buildBreadcrumbSchema,
  buildFAQSchema,
  buildSpeakableSpecification,
} from '../utils/schema';
import { generateRobotsTxt, type RobotsRule } from '../utils/robots';
import type { AiCrawlerPolicyOptions } from '../utils/ai-crawlers';
import { generateLlmsTxt, type LlmsTxtLink } from '../utils/llms-txt';

export type ChangeFreq = NonNullable<RouteMetadata['changefreq']>;

export type PageSchemaType =
  | 'WebPage'
  | 'AboutPage'
  | 'ContactPage'
  | 'CollectionPage'
  | 'ProfilePage'
  | 'FAQPage'
  | 'WebApplication';

export interface RegistryArticle {
  /** ISO date, `YYYY-MM-DD` or full ISO 8601. */
  publishedTime: string;
  modifiedTime?: string;
  author?: string;
  section?: string;
  tags?: string[];
  /** Approximate word count, for the Article schema. */
  wordCount?: number;
}

export interface RegistryPage {
  /** Absolute path, e.g. `/blog/my-post`. `/` is the home page. */
  path: string;
  /** Page title before the site template is applied. */
  title: string;
  description: string;
  /** Short name for navigation, breadcrumbs and `llms.txt`. Defaults to `title`. */
  label?: string;
  /** Schema.org page type. Defaults to `WebPage`; use `WebApplication` for tool pages. */
  schemaType?: PageSchemaType;
  /** Present on articles; switches Open Graph to `article` and emits `BlogPosting` schema. */
  article?: RegistryArticle;
  /** Parent path, used to build breadcrumbs. Defaults to the nearest registered ancestor. */
  parent?: string;
  priority?: number;
  changefreq?: ChangeFreq;
  /** Sitemap `lastmod`. Falls back to the article's modified/published time. */
  lastmod?: string;
  /** Keeps the page out of the index and the sitemap. */
  noindex?: boolean;
  /** Open Graph image, absolute or site-relative. */
  image?: string;
  imageAlt?: string;
  /** Question/answer pairs emitted as `FAQPage` schema. Must match visible content. */
  faqs?: Array<{ question: string; answer: string }>;
  /** Extra schema nodes appended to the page's `@graph`. */
  jsonLd?: SchemaOrg[];
  /** CSS selectors for the passages best read aloud by voice assistants. */
  speakable?: string[];
  /** Skip the title template (used for the home page). */
  rawTitle?: boolean;
  /** `llms.txt` placement. */
  llms?: { description?: string; optional?: boolean; exclude?: boolean; /** Section heading. Defaults to `Articles` for articles, otherwise `Pages`. */ section?: string };
  alternates?: AlternateLink[];
}

export interface RegistryPublisher {
  name: string;
  url?: string;
  logo?: string;
  sameAs?: string[];
}

export interface SeoSiteDefinition {
  name: string;
  /** Origin with no trailing slash, e.g. `https://passcrunch.com`. */
  hostname: string;
  lang?: string;
  locale?: string;
  description?: string;
  /** `%s` is replaced with the page title. Default `%s | {name}`. */
  titleTemplate?: string;
  defaultImage?: string;
  defaultImageAlt?: string;
  twitterSite?: string;
  /** Default author for articles that don't name one. */
  author?: string;
  publisher?: RegistryPublisher;
  /** Search Console / Bing Webmaster ownership tokens, emitted on every page. */
  verification?: { google?: string; bing?: string };
  pages: RegistryPage[];
  /** Meta used for paths the registry doesn't know. Defaults to a `noindex` 404 title. */
  notFound?: { title: string; description?: string };
}

export interface ResolvedPage extends RegistryPage {
  url: string;
  fullTitle: string;
  breadcrumb: Array<{ name: string; url: string }>;
}

export interface RegistryRobotsOptions {
  /** Extra rules ahead of the default `User-agent: *` allow-all. */
  rules?: RobotsRule[];
  disallow?: string[];
  aiCrawlers?: boolean | AiCrawlerPolicyOptions;
  /** Emit a pointer to `/llms.txt`. Default `true`. */
  llmsTxt?: boolean;
}

const xmlEscape = (value: string): string =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');

/** Normalises a request path: drops query/hash, collapses trailing slashes. */
export function normalizePath(input: string): string {
  const bare = input.split('#')[0].split('?')[0] || '/';
  const withSlash = bare.startsWith('/') ? bare : `/${bare}`;
  return withSlash.length > 1 ? withSlash.replace(/\/+$/, '') || '/' : withSlash;
}

const isoDate = (value: string): string => value.slice(0, 10);

export function createSeoRegistry(site: SeoSiteDefinition) {
  const origin = site.hostname.replace(/\/+$/, '');
  const lang = site.lang ?? 'en';
  const template = site.titleTemplate ?? `%s | ${site.name}`;
  const byPath = new Map<string, RegistryPage>();

  for (const page of site.pages) {
    const path = normalizePath(page.path);
    if (byPath.has(path)) {
      throw new Error(`Reacteo registry: duplicate path "${path}"`);
    }
    byPath.set(path, { ...page, path });
  }

  const absolute = (value: string | undefined): string | undefined => {
    if (!value) return undefined;
    return /^https?:\/\//i.test(value) ? value : `${origin}${value.startsWith('/') ? '' : '/'}${value}`;
  };
  const urlFor = (path: string): string => (path === '/' ? `${origin}/` : `${origin}${path}`);

  const parentOf = (page: RegistryPage): string | undefined => {
    if (page.parent !== undefined) return normalizePath(page.parent);
    let cursor = page.path;
    while (cursor.length > 1) {
      cursor = cursor.slice(0, cursor.lastIndexOf('/')) || '/';
      if (byPath.has(cursor) && cursor !== page.path) return cursor;
      if (cursor === '/') break;
    }
    return page.path === '/' ? undefined : '/';
  };

  const breadcrumbFor = (page: RegistryPage): Array<{ name: string; url: string }> => {
    const trail: Array<{ name: string; url: string }> = [];
    const seen = new Set<string>();
    let cursor: RegistryPage | undefined = page;
    while (cursor && !seen.has(cursor.path)) {
      seen.add(cursor.path);
      trail.unshift({ name: cursor.label ?? cursor.title, url: urlFor(cursor.path) });
      const parent = parentOf(cursor);
      cursor = parent ? byPath.get(parent) : undefined;
    }
    return trail;
  };

  const resolve = (path: string): ResolvedPage | undefined => {
    const page = byPath.get(normalizePath(path));
    if (!page) return undefined;
    return {
      ...page,
      url: urlFor(page.path),
      fullTitle: page.rawTitle ? page.title : template.replace('%s', page.title),
      breadcrumb: breadcrumbFor(page),
    };
  };

  const publisherNode = (): SchemaOrg | undefined => {
    const p = site.publisher;
    if (!p) return undefined;
    return {
      '@type': 'Organization',
      '@id': `${origin}/#organization`,
      name: p.name,
      url: p.url ?? origin,
      logo: p.logo ? { '@type': 'ImageObject', url: absolute(p.logo) } : undefined,
      sameAs: p.sameAs,
    };
  };

  const graphFor = (page: ResolvedPage): SchemaOrg => {
    const nodes: SchemaOrg[] = [];
    const publisher = publisherNode();
    if (publisher) nodes.push(publisher);

    nodes.push({
      '@type': 'WebSite',
      '@id': `${origin}/#website`,
      name: site.name,
      url: `${origin}/`,
      description: site.description,
      inLanguage: lang,
      publisher: publisher ? { '@id': `${origin}/#organization` } : undefined,
    });

    const image = absolute(page.image ?? site.defaultImage);
    const webPageId = `${page.url}#webpage`;
    const isArticle = Boolean(page.article);
    const pageType = page.schemaType ?? 'WebPage';
    const speakable = page.speakable ? buildSpeakableSpecification(page.speakable) : undefined;

    // WebApplication describes the tool itself, so the page node stays a plain WebPage.
    nodes.push({
      '@type': pageType === 'WebApplication' || pageType === 'FAQPage' ? 'WebPage' : pageType,
      '@id': webPageId,
      url: page.url,
      name: page.fullTitle,
      description: page.description,
      inLanguage: lang,
      isPartOf: { '@id': `${origin}/#website` },
      breadcrumb: page.breadcrumb.length > 1 ? { '@id': `${page.url}#breadcrumb` } : undefined,
      primaryImageOfPage: image ? { '@type': 'ImageObject', url: image } : undefined,
      datePublished: page.article?.publishedTime,
      dateModified: page.article?.modifiedTime ?? page.article?.publishedTime,
      speakable,
    });

    if (page.breadcrumb.length > 1) {
      const { '@context': _ctx, ...crumbs } = buildBreadcrumbSchema(page.breadcrumb) as unknown as Record<string, unknown>;
      nodes.push({ ...(crumbs as SchemaOrg), '@id': `${page.url}#breadcrumb` });
    }

    if (isArticle && page.article) {
      const author = page.article.author ?? site.author;
      nodes.push({
        '@type': 'BlogPosting',
        '@id': `${page.url}#article`,
        headline: page.title,
        description: page.description,
        mainEntityOfPage: { '@id': webPageId },
        image,
        datePublished: page.article.publishedTime,
        dateModified: page.article.modifiedTime ?? page.article.publishedTime,
        author: author ? { '@type': 'Person', name: author } : publisher ? { '@id': `${origin}/#organization` } : undefined,
        publisher: publisher ? { '@id': `${origin}/#organization` } : undefined,
        articleSection: page.article.section,
        keywords: page.article.tags?.join(', '),
        wordCount: page.article.wordCount,
        inLanguage: lang,
      });
    }

    if (pageType === 'WebApplication') {
      nodes.push({
        '@type': 'WebApplication',
        '@id': `${page.url}#app`,
        name: page.label ?? page.title,
        url: page.url,
        description: page.description,
        applicationCategory: 'SecurityApplication',
        operatingSystem: 'Any',
        browserRequirements: 'Requires JavaScript',
        isAccessibleForFree: true,
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
        mainEntityOfPage: { '@id': webPageId },
        publisher: publisher ? { '@id': `${origin}/#organization` } : undefined,
      });
    }

    if (page.faqs?.length) {
      const { '@context': _ctx, ...faq } = buildFAQSchema(page.faqs) as unknown as Record<string, unknown>;
      nodes.push({ ...(faq as SchemaOrg), '@id': `${page.url}#faq` });
    }

    nodes.push(...(page.jsonLd ?? []).map((n) => {
      const { '@context': _ctx, ...rest } = n as Record<string, unknown>;
      return rest as SchemaOrg;
    }));

    // Drop undefined keys so the serialised graph stays compact.
    const clean = JSON.parse(JSON.stringify(nodes)) as SchemaOrg[];
    return { '@context': 'https://schema.org', '@type': 'Graph', '@graph': clean } as unknown as SchemaOrg;
  };

  /** Head metadata for server-side injection. Unknown paths get a `noindex` title. */
  const meta = (path: string): InjectableMeta => {
    const page = resolve(path);
    if (!page) {
      const nf = site.notFound ?? { title: 'Page not found' };
      return {
        title: template.replace('%s', nf.title),
        description: nf.description ?? site.description,
        siteName: site.name,
        locale: site.locale,
        noIndex: true,
        verification: site.verification,
      };
    }
    const graph = graphFor(page);
    // `@graph` documents carry no `@type`; emit exactly `{ @context, @graph }`.
    const { '@type': _t, ...jsonLd } = graph as Record<string, unknown>;
    return {
      title: page.fullTitle,
      description: page.description,
      canonical: page.url,
      ogImage: absolute(page.image ?? site.defaultImage),
      ogImageAlt: page.imageAlt ?? site.defaultImageAlt,
      ogType: page.article ? 'article' : 'website',
      siteName: site.name,
      locale: site.locale,
      twitterSite: site.twitterSite,
      noIndex: page.noindex,
      author: page.article ? page.article.author ?? site.author : undefined,
      publishedTime: page.article?.publishedTime,
      modifiedTime: page.article?.modifiedTime ?? page.article?.publishedTime,
      alternates: page.alternates,
      verification: site.verification,
      jsonLd: jsonLd as SchemaOrg,
    };
  };

  /** Props for the client-side `<SEO>` component, mirroring `meta()`. */
  const seoProps = (path: string): SEOProps => {
    const m = meta(path);
    return {
      title: m.title,
      description: m.description,
      canonical: m.canonical,
      noindex: m.noIndex,
      lang,
      author: m.author,
      alternates: m.alternates,
      openGraph: {
        type: (m.ogType as 'website' | 'article') ?? 'website',
        url: m.canonical,
        title: m.title,
        description: m.description,
        image: m.ogImage,
        siteName: m.siteName,
        locale: m.locale,
      },
      twitter: {
        card: m.ogImage ? 'summary_large_image' : 'summary',
        site: m.twitterSite,
        title: m.title,
        description: m.description,
        image: m.ogImage,
        imageAlt: m.ogImageAlt,
      },
      article: m.publishedTime
        ? { publishedTime: m.publishedTime, modifiedTime: m.modifiedTime, author: m.author }
        : undefined,
      jsonLd: m.jsonLd,
    };
  };

  const indexable = (): ResolvedPage[] =>
    Array.from(byPath.keys())
      .map((p) => resolve(p) as ResolvedPage)
      .filter((p) => !p.noindex);

  /** `sitemap.xml` for every indexable page. Pure string; no dependencies. */
  const sitemapXml = (): string => {
    const entries = indexable().map((p) => {
      const lastmod = p.lastmod ?? p.article?.modifiedTime ?? p.article?.publishedTime;
      return [
        '  <url>',
        `    <loc>${xmlEscape(p.url)}</loc>`,
        lastmod ? `    <lastmod>${xmlEscape(isoDate(lastmod))}</lastmod>` : '',
        p.changefreq ? `    <changefreq>${p.changefreq}</changefreq>` : '',
        p.priority !== undefined ? `    <priority>${p.priority.toFixed(1)}</priority>` : '',
        '  </url>',
      ]
        .filter(Boolean)
        .join('\n');
    });
    return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries.join('\n')}\n</urlset>\n`;
  };

  const robotsTxt = (options: RegistryRobotsOptions = {}): string =>
    generateRobotsTxt({
      hostname: origin,
      rules: [
        ...(options.rules ?? []),
        { userAgent: '*', allow: ['/'], disallow: options.disallow ?? ['/api/'] },
      ],
      aiCrawlers: options.aiCrawlers,
      llmsTxtUrl: options.llmsTxt === false ? undefined : `${origin}/llms.txt`,
    });

  /** `llms.txt`: pages grouped by top-level section, low-priority pages under Optional. */
  const llmsTxt = (options: { details?: string | string[]; optionalBelowPriority?: number } = {}): string => {
    const threshold = options.optionalBelowPriority ?? 0.5;
    const sections = new Map<string, LlmsTxtLink[]>();
    const optional: LlmsTxtLink[] = [];

    for (const p of indexable()) {
      if (p.llms?.exclude) continue;
      const link: LlmsTxtLink = {
        title: p.label ?? p.title,
        url: p.url,
        description: p.llms?.description ?? p.description,
      };
      if (p.llms?.optional ?? (p.priority ?? 1) <= threshold) {
        optional.push(link);
        continue;
      }
      const heading = p.llms?.section ?? (p.article ? 'Articles' : 'Pages');
      sections.set(heading, [...(sections.get(heading) ?? []), link]);
    }

    return generateLlmsTxt({
      name: site.name,
      summary: site.description,
      details: options.details,
      sections: Array.from(sections, ([title, links]) => ({ title, links })),
      optional,
    });
  };

  /** Human-readable problems: missing/long titles and descriptions, duplicates. */
  const audit = (): string[] => {
    const problems: string[] = [];
    const titles = new Map<string, string>();
    const descriptions = new Map<string, string>();
    for (const p of indexable()) {
      if (p.fullTitle.length > 60) problems.push(`${p.path}: title is ${p.fullTitle.length} chars (aim for ≤ 60)`);
      if (p.fullTitle.length < 15) problems.push(`${p.path}: title is very short (${p.fullTitle.length} chars)`);
      if (p.description.length < 70) problems.push(`${p.path}: description is ${p.description.length} chars (aim for 70–160)`);
      if (p.description.length > 160) problems.push(`${p.path}: description is ${p.description.length} chars (aim for ≤ 160)`);
      const dupTitle = titles.get(p.fullTitle);
      if (dupTitle) problems.push(`${p.path}: duplicate title with ${dupTitle}`);
      titles.set(p.fullTitle, p.path);
      const dupDesc = descriptions.get(p.description);
      if (dupDesc) problems.push(`${p.path}: duplicate description with ${dupDesc}`);
      descriptions.set(p.description, p.path);
      if (p.article && !p.article.publishedTime) problems.push(`${p.path}: article has no publishedTime`);
    }
    return problems;
  };

  return {
    site,
    origin,
    pages: () => Array.from(byPath.keys()).map((p) => resolve(p) as ResolvedPage),
    resolve,
    meta,
    seoProps,
    sitemapXml,
    robotsTxt,
    llmsTxt,
    audit,
  };
}

export type SeoRegistry = ReturnType<typeof createSeoRegistry>;
