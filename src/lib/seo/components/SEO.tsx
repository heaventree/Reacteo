import React, { useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import type { SEOProps, OpenGraphImage, RobotsDirectives } from '../types';
import { useSEOContext } from '../context/SEOProvider';
import { renderTemplate, renderSeoTemplates } from '../utils/template-engine';

/**
 * SEO Component - Manages all meta tags and head elements
 *
 * Usage:
 * ```tsx
 * <SEO
 *   title="Home"
 *   description="Welcome to my app"
 *   canonical="https://example.com/"
 *   openGraph={{
 *     type: 'website',
 *     url: 'https://example.com/',
 *     image: 'https://example.com/og-image.jpg'
 *   }}
 * />
 * ```
 */
export const SEO = ({
  title,
  description,
  canonical,
  lang,
  openGraph,
  twitter,
  jsonLd,
  noindex = false,
  nofollow = false,
  templateContext,
  article,
  alternates,
  robots,
  themeColor,
  author,
  feedUrl,
}: SEOProps) => {
  const { config, isDevelopment } = useSEOContext();

  const baseContext = useMemo(() => {
    return {
      sitetitle: config.appName,
      sep: '|',
      ...templateContext
    };
  }, [config.appName, templateContext]);

  // Format page title with app name and template engine
  const formattedTitle = useMemo(() => {
    const rawTitle = title || '';
    // If standard title provided with no templates, default to Title | AppName format
    let finalTitle = rawTitle;
    if (rawTitle && !rawTitle.includes('%%')) {
      finalTitle = `${rawTitle} %%sep%% %%sitetitle%%`;
    } else if (!rawTitle) {
      finalTitle = `%%sitetitle%%`;
    }
    return renderTemplate(finalTitle, baseContext);
  }, [title, baseContext]);

  // Use provided description or config default with template engine
  const finalDescription = useMemo(() => {
    return renderTemplate(description || config.defaultDescription || '', baseContext);
  }, [description, config.defaultDescription, baseContext]);

  // Determine canonical URL
  const finalCanonical = useMemo(() => {
    if (canonical) return canonical;
    if (typeof window !== 'undefined') {
      return window.location.href;
    }
    return config.hostname;
  }, [canonical, config.hostname]);

  // Build OpenGraph tags
  const parsedOpenGraph = useMemo(() => {
    return openGraph ? renderSeoTemplates(openGraph, baseContext) : openGraph;
  }, [openGraph, baseContext]);

  const ogImage = useMemo(() => {
    const image = parsedOpenGraph?.image || config.defaultOGImage;
    if (typeof image === 'string') {
      return image;
    }
    if (Array.isArray(image) && image.length > 0) {
      return (image[0] as OpenGraphImage).url;
    }
    return config.defaultOGImage;
  }, [parsedOpenGraph?.image, config.defaultOGImage]);

  // Warn in development about missing critical metadata
  useMemo(() => {
    if (isDevelopment) {
      const warnings: string[] = [];

      if (!title) {
        warnings.push('Missing SEO title');
      }

      if (!finalDescription) {
        warnings.push('Missing SEO description');
      }

      if (openGraph && !ogImage) {
        warnings.push('OpenGraph specified but no image provided');
      }

      if (warnings.length > 0) {
        console.warn('[SEO Kit] Page metadata warnings:', warnings);
      }
    }
  }, [title, finalDescription, openGraph, ogImage, isDevelopment]);

  // Normalize jsonLd to array
  const jsonLdArray = useMemo(() => {
    if (!jsonLd) return undefined;
    return Array.isArray(jsonLd) ? jsonLd : [jsonLd];
  }, [jsonLd]);

  const robotsMeta = useMemo(() => {
    const parts: string[] = [];
    parts.push(noindex ? 'noindex' : 'index');
    parts.push(nofollow ? 'nofollow' : 'follow');

    // Granular directives are meaningless on a page that is not indexed, so
    // only emit them when the page is actually eligible to appear.
    if (!noindex) {
      const d: RobotsDirectives = robots ?? {};
      // Default to the most permissive preview settings: answer engines and
      // rich results require these to surface content at all, and the silent
      // default (a ~160-char snippet, no large image) suppresses both.
      parts.push(`max-snippet:${d.maxSnippet ?? -1}`);
      parts.push(`max-image-preview:${d.maxImagePreview ?? 'large'}`);
      parts.push(`max-video-preview:${d.maxVideoPreview ?? -1}`);
      if (d.noarchive) parts.push('noarchive');
      if (d.nositelinkssearchbox) parts.push('nositelinkssearchbox');
      if (d.notranslate) parts.push('notranslate');
      if (d.noimageindex) parts.push('noimageindex');
      if (d.unavailableAfter) parts.push(`unavailable_after:${d.unavailableAfter}`);
    }

    return parts.join(', ');
  }, [noindex, nofollow, robots]);

  const articleAuthors = useMemo(() => {
    if (!article?.author) return [];
    return Array.isArray(article.author) ? article.author : [article.author];
  }, [article?.author]);

  const articleTags = useMemo(() => {
    if (!article?.tag) return [];
    return Array.isArray(article.tag) ? article.tag : [article.tag];
  }, [article?.tag]);

  const isArticle = (parsedOpenGraph?.type ?? 'website') === 'article';

  return (
    <Helmet>
      {/* Language */}
      <html lang={lang || config.lang || 'en'} />

      {/* Standard Meta Tags */}
      <title>{formattedTitle}</title>
      <meta name="description" content={finalDescription} />
      <meta name="robots" content={robotsMeta} />
      <link rel="canonical" href={finalCanonical} />
      {author && <meta name="author" content={author} />}
      {themeColor && <meta name="theme-color" content={themeColor} />}

      {/* Alternate language versions */}
      {alternates?.map((alt) => (
        <link key={`alt-${alt.hreflang}`} rel="alternate" hrefLang={alt.hreflang} href={alt.href} />
      ))}
      {feedUrl && <link rel="alternate" type="application/rss+xml" href={feedUrl} />}

      {/* OpenGraph Tags */}
      <meta property="og:type" content={parsedOpenGraph?.type || 'website'} />
      <meta property="og:title" content={parsedOpenGraph?.title || formattedTitle} />
      <meta property="og:description" content={parsedOpenGraph?.description || finalDescription} />
      <meta property="og:url" content={parsedOpenGraph?.url || finalCanonical} />
      {ogImage && <meta property="og:image" content={ogImage} />}
      {typeof parsedOpenGraph?.image === 'object' &&
        Array.isArray(parsedOpenGraph.image) &&
        parsedOpenGraph.image.map((img: OpenGraphImage, index: number) => (
          <React.Fragment key={`og-image-${index}`}>
            <meta property="og:image" content={img.url} />
            {img.width && <meta property="og:image:width" content={img.width.toString()} />}
            {img.height && <meta property="og:image:height" content={img.height.toString()} />}
            {img.alt && <meta property="og:image:alt" content={img.alt} />}
          </React.Fragment>
        ))}
      <meta property="og:site_name" content={parsedOpenGraph?.siteName || config.appName} />
      {parsedOpenGraph?.locale && <meta property="og:locale" content={parsedOpenGraph.locale} />}

      {/* Article properties — freshness and authorship signals */}
      {isArticle && article?.publishedTime && (
        <meta property="article:published_time" content={article.publishedTime} />
      )}
      {isArticle && article?.modifiedTime && (
        <meta property="article:modified_time" content={article.modifiedTime} />
      )}
      {isArticle && article?.expirationTime && (
        <meta property="article:expiration_time" content={article.expirationTime} />
      )}
      {isArticle && article?.section && <meta property="article:section" content={article.section} />}
      {isArticle &&
        articleAuthors.map((name, i) => (
          <meta key={`article-author-${i}`} property="article:author" content={name} />
        ))}
      {isArticle &&
        articleTags.map((tag, i) => (
          <meta key={`article-tag-${i}`} property="article:tag" content={tag} />
        ))}

      {/* Twitter Card Tags — always emitted, falling back to the shared
          title/description/image so cards render without extra configuration. */}
      <meta
        name="twitter:card"
        content={twitter?.card || (ogImage ? 'summary_large_image' : 'summary')}
      />
      {twitter?.site && <meta name="twitter:site" content={renderTemplate(twitter.site, baseContext)} />}
      {twitter?.creator && <meta name="twitter:creator" content={renderTemplate(twitter.creator, baseContext)} />}
      <meta
        name="twitter:title"
        content={twitter?.title ? renderTemplate(twitter.title, baseContext) : formattedTitle}
      />
      <meta
        name="twitter:description"
        content={
          twitter?.description ? renderTemplate(twitter.description, baseContext) : finalDescription
        }
      />
      {(twitter?.image || ogImage) && (
        <meta name="twitter:image" content={twitter?.image || ogImage} />
      )}
      {twitter?.imageAlt && <meta name="twitter:image:alt" content={twitter.imageAlt} />}

      {/* JSON-LD Structured Data */}
      {jsonLdArray &&
        jsonLdArray.map((schema, index) => (
          <script
            key={`json-ld-${index}`}
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
          />
        ))}
    </Helmet>
  );
};
