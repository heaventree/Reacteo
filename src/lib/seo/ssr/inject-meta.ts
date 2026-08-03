/**
 * Server-side meta injection for single-page apps.
 *
 * An SPA serves the same empty `index.html` for every route and fills the head
 * from JavaScript. Googlebot renders JS and copes; most other crawlers — social
 * unfurlers and several AI crawlers among them — read the raw HTML response and
 * never run the client bundle, so they see the shell's placeholder tags on
 * every URL.
 *
 * This module rewrites the head of an HTML string before it goes out, so those
 * clients get per-route metadata. It is deliberately free of framework,
 * database, and transport dependencies: resolve metadata however the host app
 * likes and pass the result in.
 *
 * ```ts
 * app.get('*', async (req, res) => {
 *   const html = await readTemplate();
 *   const meta = await lookupMeta(req.path);
 *   res.send(injectSeoMeta(html, meta));
 * });
 * ```
 */

import type { SchemaOrg } from '../types';

export interface InjectableMeta {
  title?: string;
  description?: string;
  canonical?: string;
  ogImage?: string;
  ogImageAlt?: string;
  ogType?: string;
  siteName?: string;
  locale?: string;
  twitterCard?: 'summary' | 'summary_large_image' | 'app' | 'player';
  twitterSite?: string;
  twitterCreator?: string;
  noIndex?: boolean;
  noFollow?: boolean;
  author?: string;
  publishedTime?: string;
  modifiedTime?: string;
  alternates?: Array<{ hreflang: string; href: string }>;
  /** JSON-LD emitted as `<script type="application/ld+json">` blocks. */
  jsonLd?: SchemaOrg | SchemaOrg[];
}

/** Escapes text destined for a double-quoted HTML attribute. */
function escapeAttribute(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/** Escapes text destined for an HTML text node. */
function escapeText(value: string): string {
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

/**
 * Serialises JSON-LD for embedding in a `<script>` element.
 *
 * `</script>` appearing inside a JSON string would otherwise terminate the
 * script element early — a script-injection vector when any part of the schema
 * comes from user input. Escaping the `<` prevents the parser from seeing a
 * closing tag while keeping the JSON value byte-identical.
 */
function serializeJsonLd(schema: SchemaOrg): string {
  return JSON.stringify(schema)
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e')
    .replace(/\u2028/g, '\\u2028')
    .replace(/\u2029/g, '\\u2029');
}

/**
 * Removes the tags this module is about to write, so injecting twice does not
 * leave two competing titles or descriptions in the head.
 */
function stripExistingTags(html: string): string {
  return html
    .replace(/<title>[\s\S]*?<\/title>/gi, '')
    .replace(
      /<meta\s+[^>]*(?:name|property)\s*=\s*["'](?:description|robots|author|og:[^"']*|twitter:[^"']*|article:[^"']*)["'][^>]*>/gi,
      ''
    )
    .replace(/<link\s+[^>]*rel\s*=\s*["']canonical["'][^>]*>/gi, '');
}

/** Renders the head tags for a metadata object, without injecting them. */
export function buildMetaTags(meta: InjectableMeta): string {
  const tags: string[] = [];
  const push = (tag: string) => tags.push(tag);

  if (meta.title) push(`<title>${escapeText(meta.title)}</title>`);
  if (meta.description) {
    push(`<meta name="description" content="${escapeAttribute(meta.description)}">`);
  }
  if (meta.author) push(`<meta name="author" content="${escapeAttribute(meta.author)}">`);

  const follow = meta.noFollow ? 'nofollow' : 'follow';
  // Preview directives only matter on an indexable page, so they are omitted
  // alongside `noindex` rather than emitted as contradictory noise.
  const robots = meta.noIndex
    ? `noindex, ${follow}`
    : `index, ${follow}, max-snippet:-1, max-image-preview:large, max-video-preview:-1`;
  push(`<meta name="robots" content="${robots}">`);

  if (meta.canonical) {
    push(`<link rel="canonical" href="${escapeAttribute(meta.canonical)}">`);
  }

  for (const alt of meta.alternates ?? []) {
    push(
      `<link rel="alternate" hreflang="${escapeAttribute(alt.hreflang)}" href="${escapeAttribute(alt.href)}">`
    );
  }

  push(`<meta property="og:type" content="${escapeAttribute(meta.ogType ?? 'website')}">`);
  if (meta.title) push(`<meta property="og:title" content="${escapeAttribute(meta.title)}">`);
  if (meta.description) {
    push(`<meta property="og:description" content="${escapeAttribute(meta.description)}">`);
  }
  if (meta.canonical) push(`<meta property="og:url" content="${escapeAttribute(meta.canonical)}">`);
  if (meta.siteName) {
    push(`<meta property="og:site_name" content="${escapeAttribute(meta.siteName)}">`);
  }
  if (meta.locale) push(`<meta property="og:locale" content="${escapeAttribute(meta.locale)}">`);
  if (meta.ogImage) {
    push(`<meta property="og:image" content="${escapeAttribute(meta.ogImage)}">`);
    if (meta.ogImageAlt) {
      push(`<meta property="og:image:alt" content="${escapeAttribute(meta.ogImageAlt)}">`);
    }
  }

  if (meta.ogType === 'article') {
    if (meta.publishedTime) {
      push(
        `<meta property="article:published_time" content="${escapeAttribute(meta.publishedTime)}">`
      );
    }
    if (meta.modifiedTime) {
      push(
        `<meta property="article:modified_time" content="${escapeAttribute(meta.modifiedTime)}">`
      );
    }
    if (meta.author) {
      push(`<meta property="article:author" content="${escapeAttribute(meta.author)}">`);
    }
  }

  const card = meta.twitterCard ?? (meta.ogImage ? 'summary_large_image' : 'summary');
  push(`<meta name="twitter:card" content="${escapeAttribute(card)}">`);
  if (meta.twitterSite) {
    push(`<meta name="twitter:site" content="${escapeAttribute(meta.twitterSite)}">`);
  }
  if (meta.twitterCreator) {
    push(`<meta name="twitter:creator" content="${escapeAttribute(meta.twitterCreator)}">`);
  }
  if (meta.title) push(`<meta name="twitter:title" content="${escapeAttribute(meta.title)}">`);
  if (meta.description) {
    push(`<meta name="twitter:description" content="${escapeAttribute(meta.description)}">`);
  }
  if (meta.ogImage) {
    push(`<meta name="twitter:image" content="${escapeAttribute(meta.ogImage)}">`);
    if (meta.ogImageAlt) {
      push(`<meta name="twitter:image:alt" content="${escapeAttribute(meta.ogImageAlt)}">`);
    }
  }

  if (meta.jsonLd) {
    const schemas = Array.isArray(meta.jsonLd) ? meta.jsonLd : [meta.jsonLd];
    for (const schema of schemas) {
      push(`<script type="application/ld+json">${serializeJsonLd(schema)}</script>`);
    }
  }

  return tags.join('\n    ');
}

export interface InjectSeoMetaOptions {
  /**
   * Remove any title/description/canonical/og/twitter tags already in the
   * template before injecting. Defaults to `true`; the shell's placeholder tags
   * would otherwise sit alongside the real ones.
   */
  replaceExisting?: boolean;
}

/**
 * Injects metadata into the `<head>` of an HTML document.
 *
 * Returns the original HTML unchanged if it has no `</head>`, so a malformed
 * template degrades to an un-decorated page rather than a failed response.
 */
export function injectSeoMeta(
  html: string,
  meta: InjectableMeta,
  options: InjectSeoMetaOptions = {}
): string {
  const { replaceExisting = true } = options;

  if (!/<\/head>/i.test(html)) return html;

  const source = replaceExisting ? stripExistingTags(html) : html;
  const tags = buildMetaTags(meta);
  if (!tags) return source;

  return source.replace(/<\/head>/i, `    ${tags}\n  </head>`);
}
