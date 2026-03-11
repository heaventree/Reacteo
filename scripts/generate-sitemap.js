import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { SitemapStream, streamToPromise } from 'sitemap';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Post-build script: Generate sitemap.xml from routes configuration
 */

async function generateSitemap() {
  try {
    const projectRoot = path.resolve(__dirname, '..');
    const configPath = path.resolve(projectRoot, 'seo-config.ts');

    // Parse seo-config.ts to extract hostname and routes
    let configContent = fs.readFileSync(configPath, 'utf-8');

    // Extract hostname
    const hostnameMatch = configContent.match(/hostname:\s*(?:process\.env\.VITE_SEO_HOSTNAME\s*\|\|\s*)?['"]([^'"]+)['"]/);
    const hostname = hostnameMatch ? hostnameMatch[1] : 'https://localhost:5173';

    // Extract routes from the file
    const routesMatch = configContent.match(/const routes: RouteMetadata\[\]\s*=\s*\[([\s\S]*?)\];/);
    if (!routesMatch) {
      console.warn('⚠️  Could not parse routes from seo-config.ts');
    }

    // Parse routes more simply by looking for path values
    const pathMatches = configContent.matchAll(/path:\s*['"]([^'"]+)['"]/g);
    const paths = Array.from(pathMatches).map(m => m[1]);

    if (!paths || paths.length === 0) {
      console.error('❌ No routes found in seo-config.ts');
      process.exit(1);
    }

    // Create sitemap stream
    const smStream = new SitemapStream({
      hostname,
    });

    // Add routes to sitemap
    paths.forEach((route) => {
      smStream.write({
        url: route,
        changefreq: 'daily',
        priority: route === '/' ? 1.0 : 0.8,
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
    const distDir = path.resolve(projectRoot, 'dist');
    if (!fs.existsSync(distDir)) {
      fs.mkdirSync(distDir, { recursive: true });
    }

    // Write sitemap.xml
    const sitemapPath = path.join(distDir, 'sitemap.xml');
    fs.writeFileSync(sitemapPath, sitemapXml, 'utf-8');

    console.log(`✅ Sitemap generated successfully!`);
    console.log(`   Location: ${sitemapPath}`);
    console.log(`   Routes: ${paths.length}`);
    console.log(`   Hostname: ${hostname}`);
  } catch (error) {
    console.error('❌ Error generating sitemap:', error);
    process.exit(1);
  }
}

generateSitemap();
