# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [Unreleased]

### Planned
- npm package with proper `exports` and `main` fields so `src/lib/seo/` can be installed directly
- Replace `vite-plugin-prerender` with a maintained alternative
- Unit tests for schema builders and validation utils
- AI audit fallback UI when Supabase is not configured

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

[Unreleased]: https://github.com/heaventree-ltd/reacteo/compare/v1.0.1...main
[1.0.1]: https://github.com/heaventree-ltd/reacteo/compare/v1.0.0...v1.0.1
[1.0.0]: https://github.com/heaventree-ltd/reacteo/releases/tag/v1.0.0
