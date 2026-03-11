import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Post-build script: Generate robots.txt
 */

async function generateRobots() {
  try {
    const projectRoot = path.resolve(__dirname, '..');
    const distDir = path.resolve(projectRoot, 'dist');
    const robotsPath = path.join(distDir, 'robots.txt');

    // Get hostname from environment or config
    const hostname = process.env.VITE_SEO_HOSTNAME || 'https://localhost:5173';

    // Create robots.txt content
    const robotsContent = `# Robots file generated for SEO optimization
User-agent: *
Allow: /

Disallow: /admin/
Disallow: /private/
Disallow: /.env
Disallow: /node_modules/

# Sitemap reference
Sitemap: ${hostname}/sitemap.xml
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
