# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [Unreleased]

### Planned
- Unit tests for schema builders and validation utils
- AI audit fallback UI when Supabase is not configured
- npm package publication
- CDN distribution for direct browser usage

---

## [2.0.0] - 2026-03-26

### 🎉 Major Release: Production Plugin Integration

This release integrates the battle-tested SEO implementation from [niimo.io](https://niimo.io), providing production-ready server-side rendering and client-side synchronization.

### Added

#### Production Plugin (`src/lib/seo/reactseo-plugin/`)
- **Server-side meta injection** (`seo-inject.ts`) — Crawlers receive fully-populated meta tags before JavaScript executes
- **Vite dev server integration** (`vite.ts`) — Server-side injection during development
- **Production static server** (`static.ts`) — Express middleware for production deployments
- **Client-side live sync** (`client/src/hooks/useSeoMeta.ts`) — Automatic meta updates on route changes using React Query
- **Database seed utilities** (`seed-seo-pages.ts`, `page-seed-data.ts`) — Initial page setup with sensible defaults
- **Complete documentation** (`REACTSEO_PLUGIN.md`) — Implementation guide with all encountered issues and proven solutions

#### Issues Solved by Plugin
- ✅ Crawlers receiving no meta tags (social previews blank)
- ✅ Duplicate `<title>` and meta tags appearing
- ✅ Catch-all routes intercepting API requests
- ✅ Express wildcard pattern incompatibility
- ✅ IndexNow key verification 404s
- ✅ Meta tags not updating on client navigation
- ✅ `useSeoMeta` called outside router context
- ✅ Analytics scripts injected multiple times on HMR

#### Enhanced Features
- **Template engine improvements** — New variables: `%%post_author%%`, `%%post_date%%`, `%%currentdate%%`, `%%currentyear%%`
- **Additional structured data builders** — `buildPersonSchema`, `buildOrganizationSchema`, `buildFAQSchema`, `buildVideoSchema`
- **Enhanced admin dashboard** — Better bulk operations, improved template manager, enhanced settings panel
- **Better error handling** — Graceful fallbacks throughout the system
- **IndexNow integration** — Instant URL submission to Bing and supporting search engines
- **llm.txt generation** — AI crawler description file

#### Documentation
- **INSTALLATION.md** — Comprehensive installation guide with three installation methods
- **MIGRATION_GUIDE.md** — Detailed upgrade paths from 1.x, custom setups, and react-helmet
- **API_REFERENCE.md** — Complete API documentation (pending)
- **Enhanced README.md** — Production-focused with battle-tested emphasis

#### Database
- **Enhanced `seo_pages` table** — Added `seo_score`, `is_custom`, `last_generated_at` columns
- **New `seo_bulk_jobs` table** — Track background processing status
- **Enhanced `seo_global_settings`** — Added `llm_txt`, `index_now_key` fields

### Changed

- **Package version** — Bumped to 2.0.0 (major version)
- **Package description** — Emphasizes production-ready and battle-tested nature
- **Keywords** — Enhanced with SSR, crawler, social-sharing, production, battle-tested tags
- **Exports** — Added `./plugin` export path for production plugin components
- **Files included** — Added INSTALLATION.md, MIGRATION_GUIDE.md to npm package

### Improved

- **TypeScript types** — Better type safety across all components
- **Error handling** — More graceful fallbacks and better error messages
- **Edge Functions** — Enhanced reliability and multi-provider support
- **Template parsing** — More robust variable substitution
- **Admin UI** — Better user experience and clearer workflows

### Performance

- **Client-side caching** — React Query integration for optimized meta fetching
- **Server-side efficiency** — Minimal database queries per request
- **Bundle size** — No additional runtime dependencies

### Developer Experience

- **Complete examples** — Real-world patterns from production deployment
- **Troubleshooting guides** — Common issues and solutions documented
- **Migration paths** — Clear upgrade instructions for all scenarios
- **API reference** — Comprehensive documentation of all exports

### Breaking Changes

See [MIGRATION_GUIDE.md](./MIGRATION_GUIDE.md) for detailed upgrade instructions.

- **Database schema** — New tables and columns require migration
- **Edge Functions** — Need redeployment with updated code
- **Package exports** — New `./plugin` export (backward compatible)

### Compatibility

- **Node.js** — >=16.13.0 (unchanged)
- **React** — >=17.0.0 (unchanged)
- **TypeScript** — >=5.0 (recommended)
- **Supabase** — Latest stable version

### Credits

Special thanks to the [niimo.io](https://niimo.io) team for battle-testing this implementation in production and sharing the proven patterns.

---

## [1.0.2] - 2026-03-12

### Added
- `exports`, `main`, `module`, `types`, and `files` fields in `package.json` — the SEO library (`src/lib/seo/`) can now be consumed directly after running `npm run build:lib`
- `vite.lib.config.ts` — dedicated Vite library build config that compiles `src/lib/seo/index.ts` to `dist/lib/index.js` (ESM) and `dist/lib/index.cjs` (CJS) with source maps; `react`, `react-dom`, and `react-helmet-async` are correctly externalised
- `build:lib` npm script for running the library build separately from the app build
- `react-helmet-async` promoted to `peerDependencies` since it is a required runtime dependency for consumers

### Removed
- `vite-plugin-prerender` removed from `dependencies` — the package was listed but never imported. Consumers who need static pre-rendering can use [`vite-prerender-plugin`](https://www.npmjs.com/package/vite-prerender-plugin) (Preact team, no headless browser required) or any other Vite-compatible SSG tool

---

## [1.0.1] - 2026-03-12

### Fixed
- `useSEO` hook rewrote to return `SEOProps` (spread onto `<SEO>`) instead of incorrectly returning a React element from a hook
- `package.json` name corrected from `vite-react-typescript-starter` to `reacteo`; React moved to `peerDependencies`; version set to `1.0.0`
- `ai-generate` edge function CORS origin locked to `SITE_URL` env var (falls back to `*` for local dev); `Access-Control-Allow-Methods` narrowed to `POST, OPTIONS` since GET is not used

### Removed
- AI scaffolding documentation artifacts (`AI_FEATURES_INDEX.md`, `AI_FILES_MANIFEST.md`, `AI_IMPLEMENTATION_COMPLETE.md`, `AI_INTEGRATION_GUIDE.md`, `AI_QUICK_SETUP.md`, `IMPLEMENTATION_SUMMARY.md`, `QUICK_START_SEO.md`, `SEO_KIT_INDEX.md`, `SEO_KIT_README.md`, `OPEN_SOURCE_SETUP.md`, `REPOSITORY_STRUCTURE.md`, `VERIFICATION_REPORT.txt`)

### Added
- `.env.example` with inline comments explaining which variables go in `.env` vs Supabase Edge Function Secrets
- README rewritten: honest description of what each folder does, explicit Supabase dependency callout, dedicated "Copying just the SEO library" section

---

## [1.0.0] - 2026-03-11

### Added

- Multi-provider AI integration (OpenAI, Gemini, Claude, Perplexity, Deepseek) via Supabase Edge Functions
- SEO audit engine with H1/H2 hierarchy analysis, meta tag scoring, image alt text validation, readability scoring, JSON-LD schema validation
- Blog management: create/edit/delete posts, SEO metadata validation, word count, reading time, tags, categories, draft workflow, search
- Admin dashboard with AI model config, blog editor, and audit report views
- `src/lib/seo/` library: `<SEO>` component, `<Image>` component, `SEOProvider`, `useSEO` hook, JSON-LD schema builders (WebSite, Article, Breadcrumb, Product, LocalBusiness), validation utils
- Post-build sitemap and robots.txt generators (`scripts/`)
- 8 Supabase tables with Row Level Security: `ai_models`, `seo_pages`, `ai_audits`, `seo_content`, `seo_suggestions`, `blog_posts`, `schema_definitions`, `url_configurations`
- Edge Functions: `ai-generate`, `ai-models`, `ai-audit`
- MIT License, CONTRIBUTING.md, CODE_OF_CONDUCT.md, SECURITY.md, GitHub issue/PR templates

---

## Support

- Issues: https://github.com/heaventree-ltd/reacteo/issues
- Security: security@heaventree.co

---

[Unreleased]: https://github.com/heaventree-ltd/reacteo/compare/v2.0.0...main
[2.0.0]: https://github.com/heaventree-ltd/reacteo/compare/v1.0.2...v2.0.0
[1.0.2]: https://github.com/heaventree-ltd/reacteo/compare/v1.0.1...v1.0.2
[1.0.1]: https://github.com/heaventree-ltd/reacteo/compare/v1.0.0...v1.0.1
[1.0.0]: https://github.com/heaventree-ltd/reacteo/releases/tag/v1.0.0
