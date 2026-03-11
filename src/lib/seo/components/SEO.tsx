import React, { useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import type { SEOProps, OpenGraphImage } from '../types';
import { useSEOContext } from '../context/SEOProvider';

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
export const SEO: React.FC<SEOProps> = ({
  title,
  description,
  canonical,
  lang,
  openGraph,
  twitter,
  jsonLd,
  noindex = false,
  nofollow = false,
}) => {
  const { config, isDevelopment } = useSEOContext();

  // Format page title with app name
  const formattedTitle = useMemo(() => {
    if (!title) {
      return config.appName;
    }
    return `${title} | ${config.appName}`;
  }, [title, config.appName]);

  // Use provided description or config default
  const finalDescription = useMemo(() => {
    return description || config.defaultDescription || '';
  }, [description, config.defaultDescription]);

  // Determine canonical URL
  const finalCanonical = useMemo(() => {
    if (canonical) return canonical;
    if (typeof window !== 'undefined') {
      return window.location.href;
    }
    return config.hostname;
  }, [canonical, config.hostname]);

  // Build OpenGraph tags
  const ogImage = useMemo(() => {
    let image = openGraph?.image || config.defaultOGImage;
    if (typeof image === 'string') {
      return image;
    }
    if (Array.isArray(image) && image.length > 0) {
      return (image[0] as OpenGraphImage).url;
    }
    return config.defaultOGImage;
  }, [openGraph?.image, config.defaultOGImage]);

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
    if (noindex) parts.push('noindex');
    if (nofollow) parts.push('nofollow');
    return parts.length > 0 ? parts.join(',') : undefined;
  }, [noindex, nofollow]);

  return (
    <Helmet>
      {/* Language */}
      <html lang={lang || config.lang || 'en'} />

      {/* Standard Meta Tags */}
      <title>{formattedTitle}</title>
      <meta name="description" content={finalDescription} />
      {robotsMeta && <meta name="robots" content={robotsMeta} />}
      <link rel="canonical" href={finalCanonical} />

      {/* OpenGraph Tags */}
      <meta property="og:type" content={openGraph?.type || 'website'} />
      <meta property="og:title" content={openGraph?.title || formattedTitle} />
      <meta property="og:description" content={openGraph?.description || finalDescription} />
      <meta property="og:url" content={openGraph?.url || finalCanonical} />
      {ogImage && <meta property="og:image" content={ogImage} />}
      {typeof openGraph?.image === 'object' &&
        Array.isArray(openGraph.image) &&
        openGraph.image.map((img: OpenGraphImage, index: number) => (
          <React.Fragment key={`og-image-${index}`}>
            <meta property="og:image" content={img.url} />
            {img.width && <meta property="og:image:width" content={img.width.toString()} />}
            {img.height && <meta property="og:image:height" content={img.height.toString()} />}
            {img.alt && <meta property="og:image:alt" content={img.alt} />}
          </React.Fragment>
        ))}
      {openGraph?.siteName && <meta property="og:site_name" content={openGraph.siteName} />}
      {openGraph?.locale && <meta property="og:locale" content={openGraph.locale} />}

      {/* Twitter Card Tags */}
      {twitter && (
        <>
          <meta name="twitter:card" content={twitter.card || 'summary'} />
          {twitter.site && <meta name="twitter:site" content={twitter.site} />}
          {twitter.creator && <meta name="twitter:creator" content={twitter.creator} />}
          {twitter.title && <meta name="twitter:title" content={twitter.title} />}
          {twitter.description && <meta name="twitter:description" content={twitter.description} />}
          {twitter.image && <meta name="twitter:image" content={twitter.image} />}
        </>
      )}

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
