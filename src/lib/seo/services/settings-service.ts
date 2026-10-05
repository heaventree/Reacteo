import { createClient } from '@supabase/supabase-js';
import type { GlobalSettings } from '../admin/SettingsPanel';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

const fromRow = (row: Record<string, unknown>): GlobalSettings => ({
  site_name: (row.site_name as string) ?? 'My React App',
  default_separator: (row.default_separator as string) ?? '|',
  ga4_id: (row.ga4_id as string) ?? '',
  gtm_id: (row.gtm_id as string) ?? '',
  gsc_verification: (row.gsc_verification as string) ?? '',
  bing_verification: (row.bing_verification as string) ?? '',
  yandex_verification: (row.yandex_verification as string) ?? '',
  pinterest_verification: (row.pinterest_verification as string) ?? '',
  facebook_verification: (row.facebook_verification as string) ?? '',
  discourage_search_engines: (row.discourage_search_engines as boolean) ?? false,
});

/**
 * `seo_global_settings` is a singleton table: one row, created on first
 * save. There is deliberately no "settings id" the caller has to track.
 */
export class SettingsService {
  static async get(): Promise<GlobalSettings | null> {
    const { data, error } = await supabase
      .from('seo_global_settings')
      .select('*')
      .limit(1)
      .maybeSingle();

    if (error) throw error;
    return data ? fromRow(data) : null;
  }

  static async save(settings: GlobalSettings): Promise<GlobalSettings> {
    const { data: existing } = await supabase
      .from('seo_global_settings')
      .select('id')
      .limit(1)
      .maybeSingle();

    const row = {
      site_name: settings.site_name,
      default_separator: settings.default_separator,
      ga4_id: settings.ga4_id,
      gtm_id: settings.gtm_id,
      gsc_verification: settings.gsc_verification,
      bing_verification: settings.bing_verification,
      yandex_verification: settings.yandex_verification,
      pinterest_verification: settings.pinterest_verification,
      facebook_verification: settings.facebook_verification,
      discourage_search_engines: settings.discourage_search_engines,
      // Bound to the hostname it was set on so a copied database can't
      // silently carry a "discourage search engines" flag into production.
      discourage_hostname: settings.discourage_search_engines
        ? (typeof window !== 'undefined' ? window.location.hostname : null)
        : null,
    };

    const { data, error } = existing
      ? await supabase.from('seo_global_settings').update(row).eq('id', existing.id).select().single()
      : await supabase.from('seo_global_settings').insert([row]).select().single();

    if (error) throw error;
    return fromRow(data);
  }
}
