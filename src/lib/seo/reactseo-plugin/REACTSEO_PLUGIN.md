# ReactSEO Plugin — Implementation Guide

A full-stack SEO plugin for React + Express + PostgreSQL (Drizzle ORM) applications.
Built and battle-tested inside [niimo.io](https://niimo.io).

---

## What It Does

- **Server-side meta injection** — crawlers and social scrapers (Twitter, Slack, LinkedIn, Google) receive fully-populated `<title>`, `<meta>`, and Open Graph tags even though the app is a React SPA
- **Client-side live sync** — React hook re-applies correct meta on every route change without a page reload
- **Database-driven** — every URL's title, description, OG image, `noindex`, and sitemap status is stored in PostgreSQL and editable from an admin panel
- **Analytics injection** — GA4 and GTM scripts are injected once from the same database config, no hardcoding
- **Sitemaps** — automatically generated XML sitemaps split by page type (core, skills, agents, blog, guides)
- **IndexNow** — single-click submission of all indexed URLs to Bing/IndexNow API
- **llm.txt** — auto-served file that describes your app to AI crawlers
- **Admin panel** — discover URLs, bulk-generate meta descriptions via AI, edit per-page meta, manage global settings

---

## Files Required

Copy all of the following files into your target application, adapting names/imports to your app.

### Shared / Database Schema

| File | Purpose |
|---|---|
| `shared/schema.ts` | Add `seoPages` and `seoSettings` table definitions |

### Backend

| File | Purpose |
|---|---|
| `server/seo-inject.ts` | Server-side HTML `<head>` injection (runs for every page request) |
| `server/vite.ts` | Hook `injectSeoMeta` into the Vite dev-server catch-all handler |
| `server/static.ts` | Hook `injectSeoMeta` into the production static-file catch-all handler |
| `server/storage.ts` | Add `getSeoSettings`, `getSeoPages`, `upsertSeoPage`, `updateSeoPage`, `deleteSeoPage`, `getSeoPageCount`, `updateSeoSettings` to the storage interface + implementation |
| `server/routes.ts` | Add all `/api/seo/*` and `/api/admin/seo/*` routes (see Route Reference below) |
| `server/seed-seo-pages.ts` | Seed initial pages on first run |
| `server/page-seed-data.ts` | Static list of agent/integration pages for seeding |

### Frontend

| File | Purpose |
|---|---|
| `client/src/hooks/useSeoMeta.ts` | React hook — fetches config + per-page meta, writes to `document.head` |
| `client/src/App.tsx` | Mount the `SeoManager` singleton component (see Integration below) |

---

## Database Schema

Add to `shared/schema.ts`:

```typescript
import { pgTable, serial, text, boolean, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// One row per URL — stores per-page SEO metadata
export const seoPages = pgTable("seo_pages", {
  id: serial("id").primaryKey(),
  path: text("path").notNull().unique(),       // e.g. "/pricing"
  pageType: text("page_type").notNull().default("static"),
  label: text("label"),                         // human name for admin UI
  metaTitle: text("meta_title"),
  metaDesc: text("meta_desc"),
  ogImage: text("og_image"),
  noIndex: boolean("no_index").default(false),
  inSitemap: boolean("in_sitemap").default(true),
  seoScore: integer("seo_score"),               // optional AI-generated 0–100 score
  isCustom: boolean("is_custom").default(false),// prevent bulk-generate from overwriting
  lastGeneratedAt: timestamp("last_generated_at"),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertSeoPageSchema = createInsertSchema(seoPages).omit({ id: true, updatedAt: true });
export type InsertSeoPage = z.infer<typeof insertSeoPageSchema>;
export type SeoPage = typeof seoPages.$inferSelect;

// Single global config row (always id = 1)
export const seoSettings = pgTable("seo_settings", {
  id: integer("id").primaryKey(),
  siteUrl: text("site_url").default("https://yourdomain.com"),
  titleFormat: text("title_format").default("{title} | YourApp"),
  descFormat: text("desc_format").default("{title}. {description}"),
  defaultDesc: text("default_desc"),
  twitterHandle: text("twitter_handle"),
  ga4Id: text("ga4_id"),
  gtmId: text("gtm_id"),
  defaultOgImage: text("default_og_image"),
  twitterCard: text("twitter_card").default("summary_large_image"),
  indexNowKey: text("index_now_key"),
  llmTxt: text("llm_txt"),                      // custom llm.txt content
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type SeoSettings = typeof seoSettings.$inferSelect;
```

Run `npm run db:push` after adding these tables.

---

## Server-Side Injection (`server/seo-inject.ts`)

This runs on **every** page request and writes `<title>` + all meta tags into the raw HTML before it is sent to the browser. This is what makes crawlers work — they never execute JavaScript.

```typescript
import { db } from "./db";
import { seoPages, seoSettings } from "@shared/schema";
import { eq } from "drizzle-orm";

const DEFAULT_TITLE = "Your App Name";
const DEFAULT_DESC  = "Your default meta description.";

function esc(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;")
          .replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

export async function injectSeoMeta(html: string, reqPath: string): Promise<string> {
  try {
    const cleanPath = (reqPath.split("?")[0] || "/").replace(/\/$/, "") || "/";

    const [[row], [settings]] = await Promise.all([
      db.select().from(seoPages).where(eq(seoPages.path, cleanPath)).limit(1),
      db.select().from(seoSettings).where(eq(seoSettings.id, 1)).limit(1),
    ]);

    const siteUrl       = (settings?.siteUrl ?? "https://yourdomain.com").replace(/\/$/, "");
    const title         = row?.metaTitle            || DEFAULT_TITLE;
    const desc          = row?.metaDesc             || DEFAULT_DESC;
    const ogImage       = row?.ogImage             ?? settings?.defaultOgImage ?? null;
    const pageUrl       = `${siteUrl}${cleanPath === "/" ? "" : cleanPath}`;
    const card          = settings?.twitterCard    ?? "summary_large_image";
    const twitterHandle = settings?.twitterHandle  ?? null;
    const noIndex       = row?.noIndex             ?? false;

    const tags = [
      `<title>${esc(title)}</title>`,
      `<meta name="description" content="${esc(desc)}">`,
      `<meta name="robots" content="${noIndex ? "noindex, nofollow" : "index, follow"}">`,
      `<meta property="og:title" content="${esc(title)}">`,
      `<meta property="og:description" content="${esc(desc)}">`,
      `<meta property="og:type" content="website">`,
      `<meta property="og:site_name" content="${esc(settings?.siteUrl ? new URL(settings.siteUrl).hostname : "YourApp")}">`,
      `<meta property="og:url" content="${esc(pageUrl)}">`,
      ogImage ? `<meta property="og:image" content="${esc(ogImage)}">` : "",
      `<meta name="twitter:card" content="${esc(card)}">`,
      `<meta name="twitter:title" content="${esc(title)}">`,
      `<meta name="twitter:description" content="${esc(desc)}">`,
      twitterHandle ? `<meta name="twitter:site" content="${esc(twitterHandle)}">` : "",
      ogImage ? `<meta name="twitter:image" content="${esc(ogImage)}">` : "",
    ].filter(Boolean).join("\n    ");

    return html.replace("</head>", `    ${tags}\n  </head>`);
  } catch {
    return html; // never break the page — fail silently
  }
}
```

---

## Hook Into the Server

### Dev (`server/vite.ts`)

```typescript
import { injectSeoMeta } from "./seo-inject";

// Inside your catch-all handler:
app.use("/{*path}", async (req, res, next) => {
  try {
    let template = await fs.promises.readFile(clientTemplate, "utf-8");
    let page = await vite.transformIndexHtml(url, template);
    page = await injectSeoMeta(page, req.originalUrl); // <-- add this line
    res.status(200).set({ "Content-Type": "text/html" }).end(page);
  } catch (e) {
    vite.ssrFixStacktrace(e as Error);
    next(e);
  }
});
```

### Production (`server/static.ts`)

```typescript
import { injectSeoMeta } from "./seo-inject";

app.use("/{*path}", async (req, res) => {
  try {
    let html = await fs.promises.readFile(path.resolve(distPath, "index.html"), "utf-8");
    html = await injectSeoMeta(html, req.originalUrl); // <-- add this line
    res.status(200).set({ "Content-Type": "text/html" }).end(html);
  } catch {
    res.sendFile(path.resolve(distPath, "index.html"));
  }
});
```

---

## Storage Interface (`server/storage.ts`)

Add to your `IStorage` interface:

```typescript
getSeoPages(filter?: { pageType?: string; search?: string; limit?: number; offset?: number }): Promise<{ pages: SeoPage[]; total: number }>;
getSeoPage(id: number): Promise<SeoPage | undefined>;
upsertSeoPage(path: string, data: Partial<SeoPage>): Promise<SeoPage>;
updateSeoPage(id: number, data: Partial<SeoPage>): Promise<SeoPage>;
deleteSeoPage(id: number): Promise<void>;
getSeoPageCount(): Promise<number>;
getSeoSettings(): Promise<SeoSettings | undefined>;
updateSeoSettings(data: Partial<SeoSettings>): Promise<SeoSettings>;
```

And their implementations using Drizzle ORM:

```typescript
async getSeoPages(filter?) {
  const limit = filter?.limit ?? 50;
  const offset = filter?.offset ?? 0;
  const conditions: SQL[] = [];
  let q = db.select().from(seoPages).$dynamic();
  if (filter?.pageType && filter.pageType !== "all") conditions.push(eq(seoPages.pageType, filter.pageType));
  if (filter?.search) conditions.push(ilike(seoPages.path, `%${filter.search}%`));
  if (conditions.length) q = q.where(and(...conditions));
  const pages = await q.orderBy(seoPages.path).limit(limit).offset(offset);
  let cq = db.select({ count: count() }).from(seoPages).$dynamic();
  if (conditions.length) cq = cq.where(and(...conditions));
  const [{ count: total }] = await cq;
  return { pages, total: Number(total) };
},

async upsertSeoPage(path, data) {
  const [row] = await db.insert(seoPages)
    .values({ path, ...data })
    .onConflictDoUpdate({ target: seoPages.path, set: { ...data, updatedAt: new Date() } })
    .returning();
  return row;
},

async updateSeoPage(id, data) {
  const [updated] = await db.update(seoPages).set({ ...data, updatedAt: new Date() }).where(eq(seoPages.id, id)).returning();
  return updated;
},

async deleteSeoPage(id) {
  await db.delete(seoPages).where(eq(seoPages.id, id));
},

async getSeoPageCount() {
  const [{ count: n }] = await db.select({ count: count() }).from(seoPages);
  return Number(n);
},

async getSeoSettings() {
  const [row] = await db.select().from(seoSettings).where(eq(seoSettings.id, 1));
  return row;
},

async updateSeoSettings(data) {
  const [row] = await db.insert(seoSettings)
    .values({ id: 1, ...data })
    .onConflictDoUpdate({ target: seoSettings.id, set: { ...data, updatedAt: new Date() } })
    .returning();
  return row;
},
```

---

## API Routes (`server/routes.ts`)

### Public routes (no auth required)

```typescript
// Returns GA4/GTM IDs, default OG image, site URL — consumed by the React hook
app.get("/api/seo/config", async (req, res) => {
  const s = await storage.getSeoSettings();
  res.json({
    ga4Id: s?.ga4Id ?? null,
    gtmId: s?.gtmId ?? null,
    defaultOgImage: s?.defaultOgImage ?? null,
    twitterCard: s?.twitterCard ?? "summary_large_image",
    siteUrl: s?.siteUrl ?? "https://yourdomain.com",
    twitterHandle: s?.twitterHandle ?? null,
  });
});

// Returns per-page meta — consumed by the React hook on every route change
app.get("/api/seo/meta", async (req, res) => {
  const path = String(req.query.path ?? "/");
  const [row] = await db.select().from(seoPages).where(eq(seoPages.path, path)).limit(1);
  const settings = await storage.getSeoSettings();
  res.json({
    metaTitle: row?.metaTitle ?? null,
    metaDesc: row?.metaDesc ?? null,
    ogImage: row?.ogImage ?? settings?.defaultOgImage ?? null,
    noIndex: row?.noIndex ?? false,
  });
});

// Serves XML sitemaps
app.get("/sitemap-index.xml", async (req, res) => { /* see niimo implementation */ });
app.get("/sitemap-core.xml",  async (req, res) => { /* filter pageType: static, legal, guide */ });
// ... more sitemap routes as needed

// Serves llm.txt for AI crawlers
app.get("/llm.txt", async (req, res) => {
  const settings = await storage.getSeoSettings();
  const content = settings?.llmTxt?.trim() || buildDefaultLlmTxt(settings?.siteUrl ?? "https://yourdomain.com");
  res.set("Content-Type", "text/plain; charset=utf-8").send(content);
});

// IndexNow key ownership verification — Bing requires this file to exist
app.get("/:keyfile.txt", async (req, res, next) => {
  const settings = await storage.getSeoSettings();
  if (settings?.indexNowKey && req.params.keyfile === settings.indexNowKey) {
    return res.set("Content-Type", "text/plain").send(settings.indexNowKey);
  }
  next();
});
```

### Admin routes (require auth middleware)

```typescript
app.post("/api/admin/seo/discover",       adminAuthMiddleware, discoverHandler);
app.get ("/api/admin/seo/pages",          adminAuthMiddleware, listPagesHandler);
app.patch("/api/admin/seo/pages/:id",     adminAuthMiddleware, updatePageHandler);
app.get ("/api/admin/seo/settings",       adminAuthMiddleware, getSettingsHandler);
app.post("/api/admin/seo/settings",       adminAuthMiddleware, saveSettingsHandler);
app.post("/api/admin/seo/bulk-generate",  adminAuthMiddleware, bulkGenerateHandler);
app.post("/api/admin/seo/indexnow",       adminAuthMiddleware, indexNowHandler);
app.get ("/api/admin/seo/llm-default",    adminAuthMiddleware, llmDefaultHandler);
```

---

## Frontend Hook (`client/src/hooks/useSeoMeta.ts`)

```typescript
import { useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";

type SeoConfig = {
  ga4Id: string | null;
  gtmId: string | null;
  defaultOgImage: string | null;
  twitterCard: string;
  siteUrl: string;
  twitterHandle: string;
};

type PageMeta = {
  metaTitle: string | null;
  metaDesc: string | null;
  ogImage: string | null;
  noIndex: boolean;
};

function setMeta(name: string, content: string | null, attr: "name" | "property" = "name") {
  if (!content) return;
  let el = document.querySelector(`meta[${attr}="${name}"]`) as HTMLMetaElement | null;
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, name);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

export function useSeoMeta() {
  const [location] = useLocation();

  const { data: config } = useQuery<SeoConfig>({
    queryKey: ["/api/seo/config"],
    staleTime: 1000 * 60 * 10,
  });

  const { data: meta } = useQuery<PageMeta>({
    queryKey: ["/api/seo/meta", location],
    queryFn: () => fetch(`/api/seo/meta?path=${encodeURIComponent(location)}`).then(r => r.json()),
    staleTime: 1000 * 60 * 5,
  });

  useEffect(() => {
    const title       = meta?.metaTitle;
    const desc        = meta?.metaDesc;
    const image       = meta?.ogImage ?? config?.defaultOgImage ?? null;
    const pageUrl     = config ? `${config.siteUrl}${location}` : null;
    const card        = config?.twitterCard ?? "summary_large_image";
    const twitterHandle = config?.twitterHandle ?? null;

    if (title) document.title = title;

    setMeta("description", desc ?? null);
    setMeta("robots", meta?.noIndex ? "noindex, nofollow" : "index, follow");

    setMeta("og:title", title ?? null, "property");
    setMeta("og:description", desc ?? null, "property");
    setMeta("og:image", image, "property");
    setMeta("og:url", pageUrl, "property");
    setMeta("og:type", "website", "property");

    setMeta("twitter:card", card);
    setMeta("twitter:title", title ?? null);
    setMeta("twitter:description", desc ?? null);
    setMeta("twitter:image", image);
    if (twitterHandle) setMeta("twitter:site", twitterHandle);
  }, [meta, config, location]);
}

export function useAnalyticsInjection() {
  const { data: config } = useQuery<SeoConfig>({
    queryKey: ["/api/seo/config"],
    staleTime: 1000 * 60 * 10,
  });

  useEffect(() => {
    if (!config) return;

    if (config.gtmId && !document.getElementById("gtm-script")) {
      const s = document.createElement("script");
      s.id = "gtm-script";
      s.innerHTML = `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${config.gtmId}');`;
      document.head.appendChild(s);
      const ns = document.createElement("noscript");
      ns.id = "gtm-noscript";
      ns.innerHTML = `<iframe src="https://www.googletagmanager.com/ns.html?id=${config.gtmId}" height="0" width="0" style="display:none;visibility:hidden"></iframe>`;
      document.body.insertBefore(ns, document.body.firstChild);
    }

    if (config.ga4Id && !config.gtmId && !document.getElementById("ga4-script")) {
      const ga4 = document.createElement("script");
      ga4.id = "ga4-script";
      ga4.async = true;
      ga4.src = `https://www.googletagmanager.com/gtag/js?id=${config.ga4Id}`;
      document.head.appendChild(ga4);
      const init = document.createElement("script");
      init.id = "ga4-init";
      init.innerHTML = `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${config.ga4Id}');`;
      document.head.appendChild(init);
    }
  }, [config?.ga4Id, config?.gtmId]);
}
```

---

## App.tsx Integration

```typescript
// Add to your App.tsx
import { useSeoMeta, useAnalyticsInjection } from "@/hooks/useSeoMeta";

function SeoManager() {
  useSeoMeta();
  useAnalyticsInjection();
  return null; // renders nothing — side effects only
}

function Router() {
  return (
    <Layout>
      <SeoManager /> {/* mount once inside the router so it has access to useLocation() */}
      <Switch>
        {/* your routes */}
      </Switch>
    </Layout>
  );
}
```

> **Important:** `SeoManager` must be rendered **inside** the Router/Switch so `useLocation()` from `wouter` works correctly. If mounted outside, it won't detect route changes and meta tags won't update.

---

## Issues We Hit — and How We Fixed Them

### 1. Crawlers received no meta tags at all

**What happened:** Social link previews (Twitter, Slack, LinkedIn) and Google snippets were blank. OG tags, description, and title were all missing.

**Why it happens:** The app is a React SPA. All meta tags were being set by JavaScript after the page loaded. Crawlers either don't execute JS at all, or they snapshot the HTML before JS runs — so they only ever saw the empty `index.html` shell.

**Fix:** Add `server/seo-inject.ts` and call it in both `server/vite.ts` (dev) and `server/static.ts` (prod) **before** sending the HTML to the browser. The server reads the correct meta from the database and writes it directly into the raw HTML string before it's sent. Crawlers get fully populated tags immediately.

---

### 2. Duplicate `<title>` and meta tags appearing

**What happened:** The page had two `<title>` tags — one injected server-side and one set by `document.title` in the React hook. Some meta tags appeared twice.

**Why it happens:** The server-side injection writes tags into the HTML. Then the React hook runs after hydration and creates new tags, not knowing ones already exist.

**Fix:** The `setMeta()` helper function in `useSeoMeta.ts` always checks for an existing tag with `document.querySelector` before creating a new one. If a tag already exists, it **updates** its `content` attribute rather than appending a duplicate. Server-injected tags are reused; missing tags are created.

---

### 3. The catch-all route was intercepting API requests

**What happened:** Routes like `/api/seo/config` were returning the HTML `index.html` instead of JSON. Express was hitting the catch-all `/{*path}` handler before it reached the API routes.

**Why it happens:** Express matches routes in registration order. If the catch-all was registered before the API routes, it swallowed every request.

**Fix:** Always register all API routes (`app.get("/api/...")`) **before** registering the catch-all page handler. In Express, order matters — the catch-all must be last.

---

### 4. The `/{*path}` wildcard pattern didn't work in older Express

**What happened:** Using `app.use("*", ...)` caused warnings or incorrect matching in Express 5 / newer versions. Some requests that should have matched the catch-all didn't.

**Why it happens:** Express 5 changed wildcard route syntax. `"*"` is no longer valid — it must be `"/{*path}"` (named capture group).

**Fix:** Use `app.use("/{*path}", ...)` in both `vite.ts` and `static.ts`. This is the correct Express 5 syntax for a catch-all that serves `index.html` for all unmatched routes.

---

### 5. IndexNow key verification file returned 404

**What happened:** After setting an IndexNow key in the admin panel, Bing's verification check kept failing with 404.

**Why it happens:** IndexNow requires you to serve a plain text file at `/{your-key}.txt` containing only the key. This file doesn't exist on disk — it needs to be dynamically served from the database value.

**Fix:** Add a dynamic route `app.get("/:keyfile.txt", ...)` that checks if `req.params.keyfile` matches the stored IndexNow key and returns the key as plain text. Register this route **before** the catch-all. See the route code in the API Routes section above.

---

### 6. Meta tags weren't updating on client-side navigation

**What happened:** Navigating from `/` to `/pricing` in the SPA left the homepage's meta tags in place. The title and description were stale.

**Why it happens:** In a SPA, the server only renders once. All subsequent navigation is handled client-side by the router. The server-side injection doesn't re-run — that's why the client hook exists.

**Fix:** `useSeoMeta()` includes `location` (from `wouter`'s `useLocation()`) in the TanStack Query `queryKey` array: `queryKey: ["/api/seo/meta", location]`. Every route change causes a new query to fire, fetching the correct meta for the new path and updating `document.head` via `setMeta()`.

---

### 7. `useSeoMeta` called outside router context

**What happened:** `useLocation()` threw an error: "useLocation() is not inside a Router".

**Why it happens:** We initially placed `<SeoManager />` outside the `<Router>` in `App.tsx`. `wouter`'s `useLocation()` hook requires the component tree to be wrapped by a Router.

**Fix:** Move `<SeoManager />` to be a child of the component that contains `<Switch>`, not a sibling of it. See the App.tsx Integration section above.

---

### 8. Analytics scripts injected on every hot reload in dev

**What happened:** During development, GTM/GA4 scripts were being appended to `<head>` multiple times on every HMR reload, causing duplicate analytics events.

**Why it happens:** React strict mode re-runs effects, and Vite HMR re-mounts components. The `useEffect` ran on each mount, appending a new `<script>` tag each time.

**Fix:** Guard the injection with an `id` check: `if (!document.getElementById("gtm-script"))`. If the script was already injected in a previous mount, the effect skips it. The `id` attribute persists across HMR reloads because the scripts are in `document.head`, not React's virtual DOM.

---

## Initial Seeding

On first run, call `seedSeoPages()` from your server startup:

```typescript
// server/index.ts
import { seedSeoPages } from "./seed-seo-pages";

// After DB connection is established:
await seedSeoPages();
```

This upserts all your known static routes into `seo_pages` with sensible default titles and descriptions. Use the admin panel's "Discover" button at any time to re-scan and add any new routes you've created.

---

## Customisation Checklist

- [ ] Replace `"niimo"` in `seo-inject.ts` with your app name
- [ ] Set `siteUrl`, `twitterHandle`, `defaultDesc`, `defaultOgImage` in the `seo_settings` table (via admin panel or seed)
- [ ] Update `titleFormat` to `"{title} | YourApp"`
- [ ] Replace `"@niimo_io"` defaults with your Twitter handle
- [ ] Seed your static routes in `server/seed-seo-pages.ts`
- [ ] Add your GA4 or GTM ID via the admin panel (not hardcoded)
- [ ] Set an IndexNow key in the admin panel and verify ownership with Bing Webmaster Tools

---

## Route Reference

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/seo/config` | None | GA4/GTM IDs, OG defaults |
| GET | `/api/seo/meta?path=/pricing` | None | Per-page title, desc, OG image |
| GET | `/sitemap-index.xml` | None | Master sitemap index |
| GET | `/sitemap-core.xml` | None | Core pages sitemap |
| GET | `/sitemap-skills.xml` | None | Skills sitemap |
| GET | `/sitemap-agents.xml` | None | Agent pages sitemap |
| GET | `/sitemap-blog.xml` | None | Blog posts sitemap |
| GET | `/llm.txt` | None | AI crawler description |
| GET | `/{indexnow-key}.txt` | None | IndexNow ownership verification |
| POST | `/api/admin/seo/discover` | Admin | Scan all routes into `seo_pages` |
| GET | `/api/admin/seo/pages` | Admin | List pages with filter/pagination |
| PATCH | `/api/admin/seo/pages/:id` | Admin | Update a single page's meta |
| GET | `/api/admin/seo/settings` | Admin | Get global SEO config |
| POST | `/api/admin/seo/settings` | Admin | Save global SEO config |
| POST | `/api/admin/seo/bulk-generate` | Admin | AI-generate meta descriptions |
| POST | `/api/admin/seo/indexnow` | Admin | Submit all URLs to IndexNow |
