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

export interface SchemaAuthor {
  '@type': 'Person' | 'Organization';
  name: string;
  /** Author's canonical page — a primary E-E-A-T identity signal. */
  url?: string;
  /** Profile URLs that corroborate the author's identity and expertise. */
  sameAs?: string[];
  jobTitle?: string;
  description?: string;
  image?: string;
}

export interface ArticleSchema extends SchemaOrg {
  '@context': 'https://schema.org';
  '@type': 'Article' | 'NewsArticle' | 'BlogPosting' | 'TechArticle';
  headline: string;
  description?: string;
  image?: string | string[];
  author?: SchemaAuthor | SchemaAuthor[];
  publisher?: OrganizationSchema;
  datePublished: string;
  dateModified?: string;
  mainEntityOfPage?: { '@type': 'WebPage'; '@id': string };
  keywords?: string | string[];
  articleSection?: string;
  wordCount?: number;
  inLanguage?: string;
  speakable?: SpeakableSpecification;
}

/**
 * Normalises the shorthand author form (a bare name) into a full node.
 *
 * A string author is accepted for convenience, but a node carrying `url` and
 * `sameAs` is what actually establishes authorship as an E-E-A-T signal —
 * a name alone is not attributable to anyone.
 */
const normalizeAuthor = (
  author: string | SchemaAuthor | Array<string | SchemaAuthor>
): SchemaAuthor | SchemaAuthor[] => {
  const toNode = (a: string | SchemaAuthor): SchemaAuthor =>
    typeof a === 'string' ? { '@type': 'Person', name: a } : a;
  return Array.isArray(author) ? author.map(toNode) : toNode(author);
};

export const buildArticleSchema = (
  headline: string,
  datePublished: string,
  options?: {
    description?: string;
    image?: string | string[];
    author?: string | SchemaAuthor | Array<string | SchemaAuthor>;
    dateModified?: string;
    /** Use `BlogPosting` / `NewsArticle` / `TechArticle` for a closer match. */
    type?: ArticleSchema['@type'];
    publisher?: OrganizationSchema;
    /** Canonical URL of the article; sets `mainEntityOfPage`. */
    url?: string;
    keywords?: string | string[];
    articleSection?: string;
    wordCount?: number;
    inLanguage?: string;
    /** CSS selectors marking the passages best suited to being read aloud. */
    speakableSelectors?: string[];
  }
): ArticleSchema => ({
  '@context': 'https://schema.org',
  '@type': options?.type ?? 'Article',
  headline,
  description: options?.description,
  image: options?.image,
  author: options?.author ? normalizeAuthor(options.author) : undefined,
  publisher: options?.publisher,
  datePublished,
  // Answer engines weight recency heavily; default `dateModified` to the
  // publication date so the field is never silently absent.
  dateModified: options?.dateModified ?? datePublished,
  mainEntityOfPage: options?.url ? { '@type': 'WebPage', '@id': options.url } : undefined,
  keywords: options?.keywords,
  articleSection: options?.articleSection,
  wordCount: options?.wordCount,
  inLanguage: options?.inLanguage,
  speakable: options?.speakableSelectors
    ? buildSpeakableSpecification(options.speakableSelectors)
    : undefined,
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

/* ------------------------------------------------------------------ *
 * Answer-engine oriented schema (AEO)
 * ------------------------------------------------------------------ */

/**
 * Marks the passages of a page most suitable for text-to-speech, which is what
 * voice assistants read back when they select the page as an answer.
 */
export interface SpeakableSpecification {
  '@type': 'SpeakableSpecification';
  cssSelector?: string[];
  xpath?: string[];
}

export const buildSpeakableSpecification = (
  cssSelector: string[],
  xpath?: string[]
): SpeakableSpecification => ({
  '@type': 'SpeakableSpecification',
  cssSelector,
  xpath,
});

export interface FAQPageSchema extends SchemaOrg {
  '@context': 'https://schema.org';
  '@type': 'FAQPage';
  mainEntity: Array<{
    '@type': 'Question';
    name: string;
    acceptedAnswer: { '@type': 'Answer'; text: string };
  }>;
}

/**
 * Builds `FAQPage` schema — the single highest-leverage structured data type
 * for answer engines, because each Q&A pair is already shaped like the
 * question a user asks and the answer an engine wants to quote.
 *
 * The questions and answers must be visible on the page itself; marking up
 * content the user cannot see is a structured-data violation.
 */
export const buildFAQSchema = (
  faqs: Array<{ question: string; answer: string }>
): FAQPageSchema => ({
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: faqs.map((faq) => ({
    '@type': 'Question',
    name: faq.question,
    acceptedAnswer: { '@type': 'Answer', text: faq.answer },
  })),
});

export interface HowToSchema extends SchemaOrg {
  '@context': 'https://schema.org';
  '@type': 'HowTo';
  name: string;
  description?: string;
  image?: string | string[];
  totalTime?: string;
  estimatedCost?: { '@type': 'MonetaryAmount'; currency: string; value: string };
  supply?: Array<{ '@type': 'HowToSupply'; name: string }>;
  tool?: Array<{ '@type': 'HowToTool'; name: string }>;
  step: Array<{
    '@type': 'HowToStep';
    position: number;
    name?: string;
    text: string;
    url?: string;
    image?: string;
  }>;
}

/**
 * Builds `HowTo` schema for procedural content.
 *
 * `totalTime` and step durations use ISO 8601 durations (e.g. `'PT30M'`).
 */
export const buildHowToSchema = (
  name: string,
  steps: Array<{ name?: string; text: string; url?: string; image?: string }>,
  options?: {
    description?: string;
    image?: string | string[];
    totalTime?: string;
    estimatedCost?: { currency: string; value: string };
    supplies?: string[];
    tools?: string[];
  }
): HowToSchema => ({
  '@context': 'https://schema.org',
  '@type': 'HowTo',
  name,
  description: options?.description,
  image: options?.image,
  totalTime: options?.totalTime,
  estimatedCost: options?.estimatedCost
    ? {
        '@type': 'MonetaryAmount',
        currency: options.estimatedCost.currency,
        value: options.estimatedCost.value,
      }
    : undefined,
  supply: options?.supplies?.map((s) => ({ '@type': 'HowToSupply', name: s })),
  tool: options?.tools?.map((t) => ({ '@type': 'HowToTool', name: t })),
  step: steps.map((step, index) => ({
    '@type': 'HowToStep',
    position: index + 1,
    name: step.name,
    text: step.text,
    url: step.url,
    image: step.image,
  })),
});

export interface QAPageSchema extends SchemaOrg {
  '@context': 'https://schema.org';
  '@type': 'QAPage';
  mainEntity: {
    '@type': 'Question';
    name: string;
    text?: string;
    answerCount: number;
    acceptedAnswer?: { '@type': 'Answer'; text: string; upvoteCount?: number; url?: string };
    suggestedAnswer?: Array<{
      '@type': 'Answer';
      text: string;
      upvoteCount?: number;
      url?: string;
    }>;
  };
}

/**
 * Builds `QAPage` schema for a page built around one user-submitted question
 * with community answers. Use `buildFAQSchema` instead when the site itself
 * authored both the questions and the answers.
 */
export const buildQAPageSchema = (
  question: string,
  options?: {
    text?: string;
    acceptedAnswer?: { text: string; upvoteCount?: number; url?: string };
    suggestedAnswers?: Array<{ text: string; upvoteCount?: number; url?: string }>;
  }
): QAPageSchema => {
  const suggested = options?.suggestedAnswers ?? [];
  return {
    '@context': 'https://schema.org',
    '@type': 'QAPage',
    mainEntity: {
      '@type': 'Question',
      name: question,
      text: options?.text,
      answerCount: (options?.acceptedAnswer ? 1 : 0) + suggested.length,
      acceptedAnswer: options?.acceptedAnswer
        ? { '@type': 'Answer', ...options.acceptedAnswer }
        : undefined,
      suggestedAnswer:
        suggested.length > 0
          ? suggested.map((a) => ({ '@type': 'Answer' as const, ...a }))
          : undefined,
    },
  };
};

/* ------------------------------------------------------------------ *
 * Entity / E-E-A-T schema
 * ------------------------------------------------------------------ */

export interface OrganizationSchema extends SchemaOrg {
  '@context'?: 'https://schema.org';
  '@type': 'Organization';
  name: string;
  url?: string;
  logo?: { '@type': 'ImageObject'; url: string; width?: number; height?: number } | string;
  description?: string;
  /** Authoritative profile URLs. The key signal tying a brand to a known entity. */
  sameAs?: string[];
  contactPoint?: Array<{
    '@type': 'ContactPoint';
    telephone?: string;
    contactType: string;
    email?: string;
    areaServed?: string | string[];
    availableLanguage?: string | string[];
  }>;
  address?: {
    '@type': 'PostalAddress';
    streetAddress?: string;
    addressLocality?: string;
    addressRegion?: string;
    postalCode?: string;
    addressCountry?: string;
  };
  foundingDate?: string;
  founder?: { '@type': 'Person'; name: string };
  numberOfEmployees?: number;
  vatID?: string;
  taxID?: string;
}

/**
 * Builds `Organization` schema.
 *
 * Emit this once site-wide (typically on the home page). `sameAs` is the field
 * that matters most: it links the site to profiles an engine already trusts,
 * which is how a brand is resolved to a known entity rather than a bare string.
 */
export const buildOrganizationSchema = (
  name: string,
  options?: {
    url?: string;
    logo?: string | { url: string; width?: number; height?: number };
    description?: string;
    sameAs?: string[];
    contactPoints?: Array<{
      telephone?: string;
      contactType: string;
      email?: string;
      areaServed?: string | string[];
      availableLanguage?: string | string[];
    }>;
    address?: {
      street?: string;
      city?: string;
      region?: string;
      postalCode?: string;
      country?: string;
    };
    foundingDate?: string;
    founder?: string;
    numberOfEmployees?: number;
    vatID?: string;
    taxID?: string;
    /** Emit without `@context`, for nesting inside another schema node. */
    nested?: boolean;
  }
): OrganizationSchema => ({
  ...(options?.nested ? {} : { '@context': 'https://schema.org' as const }),
  '@type': 'Organization',
  name,
  url: options?.url,
  logo:
    typeof options?.logo === 'string'
      ? { '@type': 'ImageObject', url: options.logo }
      : options?.logo
        ? { '@type': 'ImageObject', ...options.logo }
        : undefined,
  description: options?.description,
  sameAs: options?.sameAs,
  contactPoint: options?.contactPoints?.map((cp) => ({
    '@type': 'ContactPoint' as const,
    ...cp,
  })),
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
  foundingDate: options?.foundingDate,
  founder: options?.founder ? { '@type': 'Person', name: options.founder } : undefined,
  numberOfEmployees: options?.numberOfEmployees,
  vatID: options?.vatID,
  taxID: options?.taxID,
});

export interface PersonSchema extends SchemaOrg {
  '@context'?: 'https://schema.org';
  '@type': 'Person';
  name: string;
  url?: string;
  image?: string;
  jobTitle?: string;
  description?: string;
  sameAs?: string[];
  worksFor?: { '@type': 'Organization'; name: string; url?: string };
  alumniOf?: Array<{ '@type': 'EducationalOrganization'; name: string }>;
  knowsAbout?: string | string[];
  award?: string | string[];
  email?: string;
}

/**
 * Builds `Person` schema for author and profile pages.
 *
 * `knowsAbout`, `award`, and `alumniOf` are the fields that carry demonstrable
 * expertise, which is the part of E-E-A-T that a job title alone does not
 * establish.
 */
export const buildPersonSchema = (
  name: string,
  options?: {
    url?: string;
    image?: string;
    jobTitle?: string;
    description?: string;
    sameAs?: string[];
    worksFor?: { name: string; url?: string };
    alumniOf?: string[];
    knowsAbout?: string | string[];
    award?: string | string[];
    email?: string;
    /** Emit without `@context`, for nesting inside another schema node. */
    nested?: boolean;
  }
): PersonSchema => ({
  ...(options?.nested ? {} : { '@context': 'https://schema.org' as const }),
  '@type': 'Person',
  name,
  url: options?.url,
  image: options?.image,
  jobTitle: options?.jobTitle,
  description: options?.description,
  sameAs: options?.sameAs,
  worksFor: options?.worksFor
    ? { '@type': 'Organization', name: options.worksFor.name, url: options.worksFor.url }
    : undefined,
  alumniOf: options?.alumniOf?.map((n) => ({ '@type': 'EducationalOrganization' as const, name: n })),
  knowsAbout: options?.knowsAbout,
  award: options?.award,
  email: options?.email,
});

export interface VideoObjectSchema extends SchemaOrg {
  '@context': 'https://schema.org';
  '@type': 'VideoObject';
  name: string;
  description: string;
  thumbnailUrl: string | string[];
  uploadDate: string;
  duration?: string;
  contentUrl?: string;
  embedUrl?: string;
  transcript?: string;
  interactionStatistic?: {
    '@type': 'InteractionCounter';
    interactionType: { '@type': 'WatchAction' };
    userInteractionCount: number;
  };
}

/**
 * Builds `VideoObject` schema.
 *
 * `duration` uses an ISO 8601 duration (e.g. `'PT5M30S'`). Supplying
 * `transcript` gives answer engines text they can actually quote — without it
 * a video is largely opaque to them.
 */
export const buildVideoSchema = (
  name: string,
  description: string,
  thumbnailUrl: string | string[],
  uploadDate: string,
  options?: {
    duration?: string;
    contentUrl?: string;
    embedUrl?: string;
    transcript?: string;
    watchCount?: number;
  }
): VideoObjectSchema => ({
  '@context': 'https://schema.org',
  '@type': 'VideoObject',
  name,
  description,
  thumbnailUrl,
  uploadDate,
  duration: options?.duration,
  contentUrl: options?.contentUrl,
  embedUrl: options?.embedUrl,
  transcript: options?.transcript,
  interactionStatistic:
    options?.watchCount !== undefined
      ? {
          '@type': 'InteractionCounter',
          interactionType: { '@type': 'WatchAction' },
          userInteractionCount: options.watchCount,
        }
      : undefined,
});

export interface WebPageSchema extends SchemaOrg {
  '@context': 'https://schema.org';
  '@type': 'WebPage' | 'AboutPage' | 'ContactPage' | 'CollectionPage' | 'ProfilePage';
  name: string;
  url?: string;
  description?: string;
  datePublished?: string;
  dateModified?: string;
  inLanguage?: string;
  breadcrumb?: BreadcrumbSchema;
  speakable?: SpeakableSpecification;
  primaryImageOfPage?: { '@type': 'ImageObject'; url: string };
  isPartOf?: { '@type': 'WebSite'; name: string; url: string };
}

/**
 * Builds `WebPage` schema — a useful wrapper when a page has no more specific
 * type, and the natural place to attach `speakable` and `dateModified`.
 */
export const buildWebPageSchema = (
  name: string,
  options?: {
    type?: WebPageSchema['@type'];
    url?: string;
    description?: string;
    datePublished?: string;
    dateModified?: string;
    inLanguage?: string;
    breadcrumb?: BreadcrumbSchema;
    speakableSelectors?: string[];
    primaryImage?: string;
    partOfSite?: { name: string; url: string };
  }
): WebPageSchema => ({
  '@context': 'https://schema.org',
  '@type': options?.type ?? 'WebPage',
  name,
  url: options?.url,
  description: options?.description,
  datePublished: options?.datePublished,
  dateModified: options?.dateModified,
  inLanguage: options?.inLanguage,
  breadcrumb: options?.breadcrumb,
  speakable: options?.speakableSelectors
    ? buildSpeakableSpecification(options.speakableSelectors)
    : undefined,
  primaryImageOfPage: options?.primaryImage
    ? { '@type': 'ImageObject', url: options.primaryImage }
    : undefined,
  isPartOf: options?.partOfSite ? { '@type': 'WebSite', ...options.partOfSite } : undefined,
});

/* ------------------------------------------------------------------ *
 * Graph composition
 * ------------------------------------------------------------------ */

/**
 * Combines several schema nodes into a single `@graph` document.
 *
 * Emitting one `@graph` beats emitting many separate `<script>` blocks: nodes
 * can cross-reference each other by `@id`, so an engine sees one connected
 * description of the page instead of several disconnected assertions.
 * Per-node `@context` keys are stripped, since `@graph` hoists it.
 */
export const buildSchemaGraph = (
  nodes: SchemaOrg[]
): { '@context': 'https://schema.org'; '@graph': SchemaOrg[] } => ({
  '@context': 'https://schema.org',
  '@graph': nodes.map((node) => {
    const { '@context': _context, ...rest } = node as Record<string, unknown>;
    return rest as SchemaOrg;
  }),
});
