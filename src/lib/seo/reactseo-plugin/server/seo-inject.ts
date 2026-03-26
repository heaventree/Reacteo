import { db } from "./db";
import { seoPages, seoSettings } from "@shared/schema";
import { eq } from "drizzle-orm";

const DEFAULT_TITLE = "niimo — Secure AI Skills via API";
const DEFAULT_DESC  = "15,253+ certified AI skills that execute on hardened servers. Integrate with 30+ AI agent platforms.";

function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export async function injectSeoMeta(html: string, reqPath: string): Promise<string> {
  try {
    const cleanPath = (reqPath.split("?")[0] || "/").replace(/\/$/, "") || "/";

    const [[row], [settings]] = await Promise.all([
      db.select().from(seoPages).where(eq(seoPages.path, cleanPath)).limit(1),
      db.select().from(seoSettings).where(eq(seoSettings.id, 1)).limit(1),
    ]);

    const siteUrl       = (settings?.siteUrl ?? "https://niimo.io").replace(/\/$/, "");
    const title         = row?.metaTitle            || DEFAULT_TITLE;
    const desc          = row?.metaDesc             || DEFAULT_DESC;
    const ogImage       = row?.ogImage             ?? settings?.defaultOgImage ?? null;
    const pageUrl       = `${siteUrl}${cleanPath === "/" ? "" : cleanPath}`;
    const card          = settings?.twitterCard    ?? "summary_large_image";
    const twitterHandle = settings?.twitterHandle  ?? "@niimo_io";
    const noIndex       = row?.noIndex             ?? false;

    const tags = [
      `<title>${esc(title)}</title>`,
      `<meta name="description" content="${esc(desc)}">`,
      `<meta name="robots" content="${noIndex ? "noindex, nofollow" : "index, follow"}">`,
      `<meta property="og:title" content="${esc(title)}">`,
      `<meta property="og:description" content="${esc(desc)}">`,
      `<meta property="og:type" content="website">`,
      `<meta property="og:site_name" content="niimo">`,
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
    return html;
  }
}
