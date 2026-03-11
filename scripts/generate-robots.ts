import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Post-build script: Generate robots.txt
 *
 * Usage: npm run postbuild
 */

async function generateRobots() {
  try {
    const distDir = path.resolve(__dirname, '../dist');
    const robotsPath = path.join(distDir, 'robots.txt');

    // Create robots.txt content
    const robotsContent = `# Robots file generated for SEO optimization
User-agent: *
Allow: /

Disallow: /admin/
Disallow: /private/
Disallow: /.env
Disallow: /node_modules/

# Sitemap reference
Sitemap: https://${process.env.VITE_SEO_HOSTNAME || 'localhost'}/sitemap.xml
`;

    // Ensure dist directory exists
    if (!fs.existsSync(distDir)) {
      fs.mkdirSync(distDir, { recursive: true });
    }

    fs.writeFileSync(robotsPath, robotsContent, 'utf-8');
    console.log(`✅ Robots.txt generated successfully!`);
    console.log(`   Location: ${robotsPath}`);
  } catch (error) {
    console.error('❌ Error generating robots.txt:', error);
    process.exit(1);
  }
}

generateRobots();
