/**
 * Browser-side counterpart to `injectSeoMeta`.
 *
 * The server writes per-route tags into the served HTML, marked with
 * `data-reacteo`. After a client-side navigation those tags describe the wrong
 * page, so this removes them and writes the new route's tags using the same
 * generator — the head can never drift from what the server would have sent.
 * Tags without the marker (analytics, fonts, the shell's own links) are left
 * alone.
 */

import { buildMetaTags, type InjectableMeta } from '../ssr/inject-meta';

export function syncSeoMeta(meta: InjectableMeta, doc: Document = document): void {
  doc.head.querySelectorAll('[data-reacteo]').forEach((el) => el.remove());

  const template = doc.createElement('template');
  template.innerHTML = buildMetaTags(meta);

  // Scripts created through innerHTML are inert, which is what we want for
  // JSON-LD (it is data, not code), so the fragment can be moved across as-is.
  doc.head.append(template.content);

  if (meta.title) doc.title = meta.title;
}
