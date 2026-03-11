import type { SEOConfig, RouteMetadata } from '../types';

/**
 * Validates SEO configuration
 */
export const validateSEOConfig = (config: SEOConfig): string[] => {
  const errors: string[] = [];

  if (!config.hostname) {
    errors.push('SEOConfig: hostname is required');
  } else if (!isValidUrl(config.hostname)) {
    errors.push(`SEOConfig: hostname is not a valid URL: ${config.hostname}`);
  }

  if (!config.appName) {
    errors.push('SEOConfig: appName is required');
  }

  if (!config.routes || !Array.isArray(config.routes)) {
    errors.push('SEOConfig: routes must be an array');
  } else if (config.routes.length === 0) {
    errors.push('SEOConfig: routes array is empty');
  }

  return errors;
};

/**
 * Validates individual route metadata
 */
export const validateRouteMetadata = (route: RouteMetadata): string[] => {
  const errors: string[] = [];

  if (!route.path) {
    errors.push('Route: path is required');
  } else if (!route.path.startsWith('/')) {
    errors.push(`Route: path must start with /: ${route.path}`);
  }

  if (route.priority !== undefined) {
    if (typeof route.priority !== 'number' || route.priority < 0 || route.priority > 1) {
      errors.push(`Route: priority must be between 0 and 1: ${route.path}`);
    }
  }

  if (
    route.changefreq &&
    !['always', 'hourly', 'daily', 'weekly', 'monthly', 'yearly', 'never'].includes(
      route.changefreq
    )
  ) {
    errors.push(`Route: invalid changefreq: ${route.changefreq}`);
  }

  return errors;
};

/**
 * Checks if string is a valid URL
 */
export const isValidUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

/**
 * Pre-deployment validation checklist
 */
export interface DeploymentCheckResult {
  passed: boolean;
  checks: Array<{
    name: string;
    passed: boolean;
    message?: string;
  }>;
}

export const validateForDeployment = (config: SEOConfig): DeploymentCheckResult => {
  const checks: Array<{
    name: string;
    passed: boolean;
    message?: string;
  }> = [];

  // Check 1: Config validation
  const configErrors = validateSEOConfig(config);
  checks.push({
    name: 'SEO Configuration',
    passed: configErrors.length === 0,
    message: configErrors.length > 0 ? configErrors.join('; ') : undefined,
  });

  // Check 2: Route validation
  let routeErrors = 0;
  config.routes.forEach((route) => {
    const errors = validateRouteMetadata(route);
    if (errors.length > 0) {
      routeErrors += errors.length;
    }
  });

  checks.push({
    name: 'Routes Metadata',
    passed: routeErrors === 0,
    message: routeErrors > 0 ? `Found ${routeErrors} route validation error(s)` : undefined,
  });

  // Check 3: Prerender routes
  const prerenderRoutes = config.routes.filter((r) => r.prerender !== false);
  checks.push({
    name: 'Prerender Routes',
    passed: prerenderRoutes.length > 0,
    message:
      prerenderRoutes.length === 0
        ? 'No routes marked for pre-rendering. Add prerender: true to routes.'
        : `${prerenderRoutes.length} routes will be pre-rendered`,
  });

  // Check 4: Default OG Image
  checks.push({
    name: 'Default OG Image',
    passed: !!config.defaultOGImage,
    message: config.defaultOGImage ? `OG Image: ${config.defaultOGImage}` : 'No default OG image set',
  });

  return {
    passed: checks.every((c) => c.passed),
    checks,
  };
};

/**
 * Validate sitemap XML structure
 */
export const validateSitemapXML = (xml: string): string[] => {
  const errors: string[] = [];

  if (!xml) {
    errors.push('Sitemap XML is empty');
    return errors;
  }

  if (!xml.includes('<?xml')) {
    errors.push('Sitemap missing XML declaration');
  }

  if (!xml.includes('<urlset')) {
    errors.push('Sitemap missing urlset element');
  }

  if (!xml.includes('</urlset>')) {
    errors.push('Sitemap missing closing urlset tag');
  }

  // Count URLs
  const urlMatches = xml.match(/<url>/g);
  if (!urlMatches || urlMatches.length === 0) {
    errors.push('Sitemap contains no URL entries');
  }

  return errors;
};
