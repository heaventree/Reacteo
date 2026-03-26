import { storage } from "./storage";
import { AGENT_PAGES, INTEGRATION_PAGES } from "./page-seed-data";

export async function seedSeoPages() {
  try {
    const pages = [
      // Static pages
      { path: "/", pageType: "static", title: "niimo — AI Skill Marketplace", description: "15,253+ certified AI skills for any agent platform. Server-side execution, kill-switch protected." },
      { path: "/agents", pageType: "static", title: "AI Agent Platforms | niimo", description: "Run certified niimo skills on 30+ AI agent platforms. MCP, HTTP API, launcher files, native skills." },
      { path: "/marketplace", pageType: "static", title: "Skill Marketplace | niimo", description: "Browse 15,253+ certified AI skills. Search by category, integration, or security score." },
      { path: "/pricing", pageType: "static", title: "Pricing | niimo", description: "Indie $49/mo, Studio $149/mo. 14-day free trial, no credit card required." },
      { path: "/admin", pageType: "static", title: "Admin | niimo", noIndex: true, inSitemap: false },
      { path: "/terms", pageType: "legal", title: "Terms of Service | niimo", description: "Read niimo's terms of service and legal agreement." },
      { path: "/privacy", pageType: "legal", title: "Privacy Policy | niimo", description: "niimo's privacy policy and data protection practices." },

      // Agent platforms
      ...AGENT_PAGES.map(p => ({
        path: `/${p.slug}`,
        pageType: "agent" as const,
        title: `niimo for ${p.name} | Guide & Setup`,
        description: p.desc,
      })),

      // Integration pages
      ...INTEGRATION_PAGES.map(p => ({
        path: `/integration/${p.slug}`,
        pageType: "guide" as const,
        title: `${p.name} Integration | niimo Skills`,
        description: p.desc,
      })),
    ];

    for (const page of pages) {
      await storage.upsertSeoPage(page.path, page);
    }

    console.log(`[seed] Upserted ${pages.length} SEO pages to database`);
  } catch (err: any) {
    console.error("[seed] SEO page seeding failed:", err.message);
  }
}
