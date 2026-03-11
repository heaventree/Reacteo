import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { SitemapStream, streamToPromise } from 'sitemap';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Post-build script: Generate sitemap.xml from routes configuration
 *
 * Usage: npm run postbuild
 */

async function generateSitemap() {
  try {
    // Import the SEO config
    const configPath = path.resolve(__dirname, '../seo-config.ts');

    // For TypeScript, we'll read and parse the config manually
    // In production, you'd use tsx or ts-node to execute TS files
    const configContent = fs.readFileSync(configPath, 'utf-8');

    // Parse the routes from seo-config.ts using regex
    const routesMatch = configContent.match(/const routes: RouteMetadata\[\]\s*=\s*\[([\s\S]*?)\]/);
    if (!routesMatch) {
      console.warn('⚠️  Could not parse routes from seo-config.ts, using defaults');
    }

    // For now, we'll import using a simpler approach - reading the compiled JS
    const distConfigPath = path.resolve(__dirname, '../dist/seo-config.js');

    let seoConfig;
    if (fs.existsSync(distConfigPath)) {
      // Dynamic import of built config
      const configModule = await import(`file://${distConfigPath}`);
      seoConfig = configModule.seoConfig || configModule.default;
    } else {
      console.warn(
        '⚠️  Compiled seo-config.js not found. Make sure to build first with: npm run build'
      );
      process.exit(1);
    }

    if (!seoConfig) {
      console.error('❌ Failed to load SEO configuration');
      process.exit(1);
    }

    const { hostname, routes } = seoConfig;

    if (!hostname) {
      console.error('❌ SEO configuration missing hostname');
      process.exit(1);
    }

    if (!routes || routes.length === 0) {
      console.error('❌ SEO configuration has no routes');
      process.exit(1);
    }

    // Create sitemap stream
    const smStream = new SitemapStream({
      hostname,
      xmlns: {
        news: false,
        xhtml: false,
        image: false,
        video: false,
        mobile: false,
        pagemap: false,
        video: false,
        xhtml: false,
      },
    });

    // Add routes to sitemap
    routes.forEach((route) => {
      smStream.write({
        url: route.path,
        changefreq: route.changefreq || 'daily',
        priority: route.priority !== undefined ? route.priority : 0.8,
        lastmod: new Date().toISOString(),
      });
    });

    smStream.end();

    // Get the sitemap XML
    const sitemap = await streamToPromise(smStream);
    const sitemapXml = sitemap.toString();

    // Validate sitemap
    if (!sitemapXml.includes('<?xml') || !sitemapXml.includes('</urlset>')) {
      console.error('❌ Generated sitemap XML is invalid');
      process.exit(1);
    }

    // Create dist directory if it doesn't exist
    const distDir = path.resolve(__dirname, '../dist');
    if (!fs.existsSync(distDir)) {
      fs.mkdirSync(distDir, { recursive: true });
    }

    // Write sitemap.xml
    const sitemapPath = path.join(distDir, 'sitemap.xml');
    fs.writeFileSync(sitemapPath, sitemapXml, 'utf-8');

    console.log(`✅ Sitemap generated successfully!`);
    console.log(`   Location: ${sitemapPath}`);
    console.log(`   Routes: ${routes.length}`);
    console.log(`   Hostname: ${hostname}`);
  } catch (error) {
    console.error('❌ Error generating sitemap:', error);
    process.exit(1);
  }
}

generateSitemap();
