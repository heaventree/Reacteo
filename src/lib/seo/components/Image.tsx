import React, { useMemo, useCallback } from 'react';
import type { ImageProps } from '../types';
import { useSEOContext } from '../context/SEOProvider';

/**
 * Image Component - Optimized image with lazy loading and CLS prevention
 *
 * Enforces width/height to prevent Cumulative Layout Shift
 * Supports lazy loading and format negotiation (WebP, AVIF)
 *
 * Usage:
 * ```tsx
 * <Image
 *   src="/image.jpg"
 *   alt="Description"
 *   width={1200}
 *   height={600}
 *   priority={true}
 * />
 * ```
 */
export const Image = React.forwardRef<HTMLImageElement, ImageProps>(
  (
    {
      src,
      alt,
      width,
      height,
      priority = false,
      formats = ['webp'],
      sizes,
      className = '',
      onError,
      ...props
    },
    ref
  ) => {
    const { isDevelopment } = useSEOContext();

    // Validate required props
    useMemo(() => {
      if (isDevelopment) {
        const warnings: string[] = [];

        if (!alt) {
          warnings.push(`Image missing alt text: ${src}`);
        }

        if (!width || !height) {
          warnings.push(`Image missing dimensions (width/height): ${src}`);
        }

        if (warnings.length > 0) {
          console.warn('[SEO Kit] Image optimization warnings:', warnings);
        }
      }
    }, [src, alt, width, height, isDevelopment]);

    // Build srcSet for responsive images
    const srcSet = useMemo(() => {
      if (!src || !width || !height) return undefined;

      // Generate common breakpoints
      const breakpoints = [640, 1024, 1280];
      const srcSetParts: string[] = [];

      // Add original size
      srcSetParts.push(`${src} ${width}w`);

      // Add responsive sizes
      breakpoints.forEach((bp) => {
        if (bp < width) {
          srcSetParts.push(`${src}?w=${bp} ${bp}w`);
        }
      });

      return srcSetParts.join(', ');
    }, [src, width]);

    // Build picture element with format negotiation
    const buildPictureElement = useCallback(() => {
      if (!formats || formats.length === 0 || !width || !height) {
        return null;
      }

      const sources: Array<{
        type: string;
        srcSet: string;
        sizes?: string;
      }> = [];

      // Add AVIF source
      if (formats.includes('avif')) {
        sources.push({
          type: 'image/avif',
          srcSet: `${src}?format=avif${width ? `&w=${width}` : ''} ${width}w`,
          sizes,
        });
      }

      // Add WebP source
      if (formats.includes('webp')) {
        sources.push({
          type: 'image/webp',
          srcSet: `${src}?format=webp${width ? `&w=${width}` : ''} ${width}w`,
          sizes,
        });
      }

      return (
        <picture>
          {sources.map((source, index) => (
            <source
              key={`source-${index}`}
              type={source.type}
              srcSet={source.srcSet}
              sizes={source.sizes}
            />
          ))}
          <img
            ref={ref}
            src={src}
            alt={alt || 'Image description missing'}
            width={width}
            height={height}
            loading={priority ? 'eager' : 'lazy'}
            fetchPriority={priority ? 'high' : 'auto'}
            decoding="async"
            srcSet={srcSet}
            sizes={sizes}
            className={className}
            onError={
              onError
                ? () => onError(new Error(`Failed to load image: ${src}`))
                : undefined
            }
            {...props}
          />
        </picture>
      );
    }, [src, alt, width, height, priority, srcSet, sizes, className, onError, formats, ref]);

    // If formats requested, use picture element; otherwise use simple img
    if (formats && formats.length > 0) {
      return buildPictureElement();
    }

    return (
      <img
        ref={ref}
        src={src}
        alt={alt || 'Image description missing'}
        width={width}
        height={height}
        loading={priority ? 'eager' : 'lazy'}
        fetchPriority={priority ? 'high' : 'auto'}
        decoding="async"
        srcSet={srcSet}
        sizes={sizes}
        className={className}
        onError={
          onError ? () => onError(new Error(`Failed to load image: ${src}`)) : undefined
        }
        {...props}
      />
    );
  }
);

Image.displayName = 'Image';
