import { createClient } from '@supabase/supabase-js';
import { normalizeRedirectPath, type RedirectRule } from '../utils/redirects';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

export interface StoredRedirect extends RedirectRule {
  id: string;
  hitCount: number;
  lastHitAt: string | null;
}

const fromRow = (row: Record<string, unknown>): StoredRedirect => ({
  id: row.id as string,
  sourcePath: row.source_path as string,
  destinationPath: row.destination_path as string,
  statusCode: row.status_code as RedirectRule['statusCode'],
  enabled: row.enabled as boolean,
  hitCount: (row.hit_count as number) ?? 0,
  lastHitAt: (row.last_hit_at as string) ?? null,
});

export class RedirectsService {
  static async list(): Promise<StoredRedirect[]> {
    const { data, error } = await supabase
      .from('seo_redirects')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data ?? []).map(fromRow);
  }

  static async create(rule: RedirectRule): Promise<StoredRedirect> {
    const { data, error } = await supabase
      .from('seo_redirects')
      .insert([
        {
          source_path: normalizeRedirectPath(rule.sourcePath),
          destination_path: rule.destinationPath,
          status_code: rule.statusCode ?? 301,
          enabled: rule.enabled ?? true,
        },
      ])
      .select()
      .single();

    if (error) throw error;
    return fromRow(data);
  }

  static async update(id: string, rule: Partial<RedirectRule>): Promise<StoredRedirect> {
    const patch: Record<string, unknown> = {};
    if (rule.sourcePath !== undefined) patch.source_path = normalizeRedirectPath(rule.sourcePath);
    if (rule.destinationPath !== undefined) patch.destination_path = rule.destinationPath;
    if (rule.statusCode !== undefined) patch.status_code = rule.statusCode;
    if (rule.enabled !== undefined) patch.enabled = rule.enabled;

    const { data, error } = await supabase
      .from('seo_redirects')
      .update(patch)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return fromRow(data);
  }

  static async remove(id: string): Promise<void> {
    const { error } = await supabase.from('seo_redirects').delete().eq('id', id);
    if (error) throw error;
  }

  /**
   * Looks up a redirect for `path` and, if found, records the hit.
   * Fire-and-forget on the counter write: a dropped hit count must never
   * block or fail the redirect itself.
   */
  static async resolve(path: string): Promise<StoredRedirect | null> {
    const target = normalizeRedirectPath(path);
    const { data, error } = await supabase
      .from('seo_redirects')
      .select('*')
      .eq('source_path', target)
      .eq('enabled', true)
      .maybeSingle();

    if (error) throw error;
    if (!data) return null;

    const match = fromRow(data);
    void supabase
      .from('seo_redirects')
      .update({ hit_count: match.hitCount + 1, last_hit_at: new Date().toISOString() })
      .eq('id', match.id);

    return match;
  }
}
