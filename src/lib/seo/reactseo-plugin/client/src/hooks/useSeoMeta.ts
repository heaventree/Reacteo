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

function removeMeta(name: string, attr: "name" | "property" = "name") {
  const el = document.querySelector(`meta[${attr}="${name}"]`);
  if (el) el.remove();
}

export function useSeoConfig() {
  return useQuery<SeoConfig>({
    queryKey: ["/api/seo/config"],
    staleTime: 1000 * 60 * 10,
  });
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
    const title = meta?.metaTitle;
    const desc = meta?.metaDesc;
    const image = meta?.ogImage ?? config?.defaultOgImage ?? null;
    const pageUrl = config ? `${config.siteUrl}${location}` : null;
    const card = config?.twitterCard ?? "summary_large_image";
    const twitterHandle = config?.twitterHandle ?? null;

    if (title) document.title = title;

    setMeta("description", desc);
    setMeta("robots", meta?.noIndex ? "noindex, nofollow" : "index, follow");

    setMeta("og:title", title, "property");
    setMeta("og:description", desc, "property");
    setMeta("og:image", image, "property");
    setMeta("og:url", pageUrl, "property");
    setMeta("og:type", "website", "property");
    setMeta("og:site_name", "niimo", "property");

    setMeta("twitter:card", card);
    setMeta("twitter:title", title);
    setMeta("twitter:description", desc);
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

    // ── Google Tag Manager ────────────────────────────────────────────────────
    if (config.gtmId && !document.getElementById("gtm-script")) {
      const gtmScript = document.createElement("script");
      gtmScript.id = "gtm-script";
      gtmScript.innerHTML = `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${config.gtmId}');`;
      document.head.appendChild(gtmScript);

      const noscript = document.createElement("noscript");
      noscript.id = "gtm-noscript";
      noscript.innerHTML = `<iframe src="https://www.googletagmanager.com/ns.html?id=${config.gtmId}" height="0" width="0" style="display:none;visibility:hidden"></iframe>`;
      document.body.insertBefore(noscript, document.body.firstChild);
    }

    // ── Google Analytics 4 (standalone, without GTM) ──────────────────────────
    if (config.ga4Id && !config.gtmId && !document.getElementById("ga4-script")) {
      const ga4 = document.createElement("script");
      ga4.id = "ga4-script";
      ga4.async = true;
      ga4.src = `https://www.googletagmanager.com/gtag/js?id=${config.ga4Id}`;
      document.head.appendChild(ga4);

      const ga4Init = document.createElement("script");
      ga4Init.id = "ga4-init";
      ga4Init.innerHTML = `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${config.ga4Id}');`;
      document.head.appendChild(ga4Init);
    }
  }, [config?.ga4Id, config?.gtmId]);
}
