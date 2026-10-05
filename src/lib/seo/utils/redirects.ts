/**
 * URL Redirects — the one piece of SEOPress/Redirection-plugin-equivalent
 * functionality this kit had none of.
 *
 * Framework-agnostic on purpose, same as the rest of this package: a React
 * Router app calls `resolveRedirect` in a route guard or top-level effect,
 * an Express/Next/Remix server calls it in middleware. Neither path is
 * assumed, so neither is imported here.
 */

export interface RedirectRule {
  sourcePath: string;
  destinationPath: string;
  statusCode?: 301 | 302 | 307 | 308;
  enabled?: boolean;
}

/**
 * Normalises a path the same way WordPress's Redirection plugin does:
 * lowercased, a single leading slash, no trailing slash (except for the
 * root), and the query string stripped. Redirect rules carried over from a
 * WordPress migration therefore match exactly as they did there — a rule
 * written against `/Old-Page/` still matches `/old-page`.
 */
export function normalizeRedirectPath(path: string): string {
  let normalized = path.trim().toLowerCase();

  // Query strings and fragments are not part of the match.
  normalized = normalized.split('?')[0].split('#')[0];

  if (!normalized.startsWith('/')) {
    normalized = `/${normalized}`;
  }

  if (normalized.length > 1 && normalized.endsWith('/')) {
    normalized = normalized.slice(0, -1);
  }

  return normalized;
}

/**
 * Finds the first enabled rule whose source matches `path`, after
 * normalising both sides. Returns `null` when nothing matches, which means
 * "serve the page normally" — this function never decides to 404.
 */
export function resolveRedirect(
  path: string,
  rules: RedirectRule[]
): RedirectRule | null {
  const target = normalizeRedirectPath(path);

  for (const rule of rules) {
    if (rule.enabled === false) continue;
    if (normalizeRedirectPath(rule.sourcePath) === target) {
      return rule;
    }
  }

  return null;
}
