import { useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import type { SEOProps } from '../types';
import { useSEOContext } from '../context/SEOProvider';

/**
 * useSEO - Returns props to spread onto the <SEO> component.
 *
 * This hook resolves defaults from SEOProvider context so callers can provide
 * only the page-specific overrides. Useful when you want to compute SEO props
 * from component logic before rendering.
 *
 * Usage:
 * ```tsx
 * function ProductPage({ product }) {
 *   const seoProps = useSEO({
 *     title: product.name,
 *     description: product.summary,
 *     openGraph: { type: 'product', url: product.url },
 *   });
 *
 *   return (
 *     <>
 *       <SEO {...seoProps} />
 *       <div>{product.name}</div>
 *     </>
 *   );
 * }
 * ```
 *
 * Note: You still need to render <SEO {...seoProps} /> in your JSX.
 * For direct JSX usage, use <SEO> without this hook.
 */
export const useSEO = (props: SEOProps): SEOProps => {
  const { config } = useSEOContext();

  return useMemo<SEOProps>(() => ({
    ...props,
    title: props.title,
    description: props.description || config.defaultDescription,
    canonical: props.canonical,
    openGraph: props.openGraph
      ? {
          ...props.openGraph,
          image: props.openGraph.image || config.defaultOGImage,
        }
      : undefined,
    twitter: props.twitter,
    jsonLd: props.jsonLd,
    noindex: props.noindex ?? false,
    nofollow: props.nofollow ?? false,
  }), [
    props,
    config.defaultDescription,
    config.defaultOGImage,
  ]);
};

export { Helmet };
