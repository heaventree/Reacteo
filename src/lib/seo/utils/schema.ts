import type { SchemaOrg } from '../types';

/**
 * Schema.org JSON-LD builders for common types
 */

export interface WebSiteSchema extends SchemaOrg {
  '@context': 'https://schema.org';
  '@type': 'WebSite';
  name: string;
  url: string;
  description?: string;
  image?: string;
  sameAs?: string[];
}

export const buildWebSiteSchema = (
  name: string,
  url: string,
  options?: {
    description?: string;
    image?: string;
    sameAs?: string[];
  }
): WebSiteSchema => ({
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name,
  url,
  description: options?.description,
  image: options?.image,
  sameAs: options?.sameAs,
});

export interface ArticleSchema extends SchemaOrg {
  '@context': 'https://schema.org';
  '@type': 'Article';
  headline: string;
  description?: string;
  image?: string | string[];
  author?: {
    '@type': 'Person';
    name: string;
  };
  datePublished: string;
  dateModified?: string;
}

export const buildArticleSchema = (
  headline: string,
  datePublished: string,
  options?: {
    description?: string;
    image?: string | string[];
    author?: string;
    dateModified?: string;
  }
): ArticleSchema => ({
  '@context': 'https://schema.org',
  '@type': 'Article',
  headline,
  description: options?.description,
  image: options?.image,
  author: options?.author
    ? {
        '@type': 'Person',
        name: options.author,
      }
    : undefined,
  datePublished,
  dateModified: options?.dateModified,
});

export interface BreadcrumbSchema extends SchemaOrg {
  '@context': 'https://schema.org';
  '@type': 'BreadcrumbList';
  itemListElement: Array<{
    '@type': 'ListItem';
    position: number;
    name: string;
    item?: string;
  }>;
}

export const buildBreadcrumbSchema = (
  items: Array<{
    name: string;
    url?: string;
  }>
): BreadcrumbSchema => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: items.map((item, index) => ({
    '@type': 'ListItem',
    position: index + 1,
    name: item.name,
    item: item.url,
  })),
});

export interface ProductSchema extends SchemaOrg {
  '@context': 'https://schema.org';
  '@type': 'Product';
  name: string;
  description?: string;
  image?: string | string[];
  brand?: string;
  aggregateRating?: {
    '@type': 'AggregateRating';
    ratingValue: number;
    bestRating?: number;
    worstRating?: number;
    ratingCount: number;
  };
  offers?: {
    '@type': 'Offer';
    price: string;
    priceCurrency: string;
    availability?: string;
  };
}

export const buildProductSchema = (
  name: string,
  options?: {
    description?: string;
    image?: string | string[];
    brand?: string;
    rating?: {
      value: number;
      count: number;
      bestRating?: number;
      worstRating?: number;
    };
    price?: {
      amount: string;
      currency: string;
      availability?: string;
    };
  }
): ProductSchema => ({
  '@context': 'https://schema.org',
  '@type': 'Product',
  name,
  description: options?.description,
  image: options?.image,
  brand: options?.brand,
  aggregateRating: options?.rating
    ? {
        '@type': 'AggregateRating',
        ratingValue: options.rating.value,
        bestRating: options.rating.bestRating,
        worstRating: options.rating.worstRating,
        ratingCount: options.rating.count,
      }
    : undefined,
  offers: options?.price
    ? {
        '@type': 'Offer',
        price: options.price.amount,
        priceCurrency: options.price.currency,
        availability: options.price.availability,
      }
    : undefined,
});

export interface LocalBusinessSchema extends SchemaOrg {
  '@context': 'https://schema.org';
  '@type': 'LocalBusiness';
  name: string;
  image?: string;
  description?: string;
  address?: {
    '@type': 'PostalAddress';
    streetAddress?: string;
    addressLocality?: string;
    addressRegion?: string;
    postalCode?: string;
    addressCountry?: string;
  };
  telephone?: string;
  url?: string;
  sameAs?: string[];
}

export const buildLocalBusinessSchema = (
  name: string,
  options?: {
    image?: string;
    description?: string;
    address?: {
      street?: string;
      city?: string;
      region?: string;
      postalCode?: string;
      country?: string;
    };
    phone?: string;
    url?: string;
    sameAs?: string[];
  }
): LocalBusinessSchema => ({
  '@context': 'https://schema.org',
  '@type': 'LocalBusiness',
  name,
  image: options?.image,
  description: options?.description,
  address: options?.address
    ? {
        '@type': 'PostalAddress',
        streetAddress: options.address.street,
        addressLocality: options.address.city,
        addressRegion: options.address.region,
        postalCode: options.address.postalCode,
        addressCountry: options.address.country,
      }
    : undefined,
  telephone: options?.phone,
  url: options?.url,
  sameAs: options?.sameAs,
});
