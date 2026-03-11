import type { SEOConfig, RouteMetadata } from './src/lib/seo/types';

/**
 * SEO Configuration for the application
 *
 * This configuration is used by:
 * - SEOProvider (context defaults)
 * - Post-build sitemap generation
 * - Pre-deployment validation
 * - Pre-render route whitelist
 */

const routes: RouteMetadata[] = [
  {
    path: '/',
    priority: 1.0,
    changefreq: 'daily',
    label: 'Home',
    prerender: true,
  },
  {
    path: '/about',
    priority: 0.8,
    changefreq: 'monthly',
    label: 'About',
    prerender: true,
  },
  {
    path: '/contact',
    priority: 0.7,
    changefreq: 'monthly',
    label: 'Contact',
    prerender: true,
  },
];

export const seoConfig: SEOConfig = {
  hostname: process.env.VITE_SEO_HOSTNAME || 'https://localhost:5173',
  appName: 'My Awesome App',
  lang: 'en',
  defaultDescription: 'A modern, SEO-optimized React application',
  defaultOGImage: process.env.VITE_SEO_OG_IMAGE || 'https://via.placeholder.com/1200x630?text=My+Awesome+App',
  environment: (process.env.NODE_ENV as 'development' | 'staging' | 'production') || 'development',
  routes,
};

export default seoConfig;
