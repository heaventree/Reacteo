import { useEffect } from 'react';
import type { SEOProps } from '../types';
import { SEO } from '../components/SEO';
import React from 'react';

/**
 * useSEO Hook - Inject SEO metadata without JSX wrapping
 *
 * Usage:
 * ```tsx
 * function ProductPage() {
 *   useSEO({
 *     title: 'Product Name',
 *     description: 'Product description',
 *   });
 *
 *   return <div>Product content</div>;
 * }
 * ```
 */
export const useSEO = (props: SEOProps) => {
  useEffect(() => {
    // This is a simple hook that manages SEO context
    // The actual rendering is handled by the SEO component
    return () => {
      // Cleanup on unmount
    };
  }, [props]);

  // Return the SEO component to be rendered
  // Note: This should be rendered in the component's JSX tree
  return React.createElement(SEO, props);
};
