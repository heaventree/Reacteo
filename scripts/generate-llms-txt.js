import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Post-build script: Generate llms.txt
 *
 * `llms.txt` is a Markdown map of the site placed at the root, giving language
 * models a curated, token-efficient view that neither sitemap.xml (no context)
 * nor rendered HTML (buried in markup) provides.
 *
 * Routes come from seo-config.ts. Descriptions are what make the file useful,
 * so add a `description` to each route rather than relying on the label alone.
 */

const PROJECT_ROOT = path.resolve(__dirname, '..');

async function loadRoutes() {
  // seo-config.ts is TypeScript; read it only if the host project has already
  // compiled it, otherwise fall back to a minimal document.
  const candidates = [
    path.join(PROJECT_ROOT, 'dist', 'seo-config.js'),
    path.join(PROJECT_ROOT, 'seo-config.js'),
  ];

  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) {
      const mod = await import(`file://${candidate}`);
      const config = mod.seoConfig ?? mod.default;
      if (config?.routes) return config;
    }
  }

  return null;
}

function escapeLinkText(text) {
  return String(text).replace(/([[\]])/g, '\\$1');
}

function renderLink({ title, url, description }) {
  const base = `- [${escapeLinkText(title)}](${url})`;
  return description ? `${base}: ${description}` : base;
}

async function generateLlmsTxt() {
  try {
    const distDir = path.resolve(PROJECT_ROOT, 'dist');
    const outPath = path.join(distDir, 'llms.txt');

    const config = await loadRoutes();

    const hostname = (
      config?.hostname ||
      process.env.VITE_SEO_HOSTNAME ||
      'https://localhost:5173'
    ).replace(/\/$/, '');
    const name = config?.appName || process.env.VITE_SEO_APP_NAME || 'Site';
    const summary = config?.defaultDescription;

    const routes = config?.routes ?? [];
    const toLink = (route) => ({
      title: route.label || route.path,
      url: `${hostname}${route.path}`,
      description: route.description,
    });

    // Low-priority routes go under `## Optional`, which models drop first when
    // they are short on context.
    const primary = routes.filter((r) => (r.priority ?? 1) > 0.5).map(toLink);
    const optional = routes.filter((r) => (r.priority ?? 1) <= 0.5).map(toLink);

    const blocks = [`# ${name}`];
    if (summary) blocks.push(`> ${summary}`);
    if (primary.length > 0) blocks.push(['## Pages', ...primary.map(renderLink)].join('\n'));
    if (optional.length > 0) blocks.push(['## Optional', ...optional.map(renderLink)].join('\n'));

    if (!fs.existsSync(distDir)) {
      fs.mkdirSync(distDir, { recursive: true });
    }

    fs.writeFileSync(outPath, `${blocks.join('\n\n')}\n`, 'utf-8');
    console.log(`✅ llms.txt generated successfully!`);
    console.log(`   Location: ${outPath}`);
    console.log(`   Routes: ${primary.length} primary, ${optional.length} optional`);

    if (routes.length === 0) {
      console.warn(
        '   ⚠  No routes found — add routes to seo-config.ts, or author llms.txt by hand.'
      );
    }
  } catch (error) {
    console.error('❌ Error generating llms.txt:', error);
    process.exit(1);
  }
}

generateLlmsTxt();
