import { createClient } from '@supabase/supabase-js';
import type { SeoPageRecord } from '../admin/BulkOperationsView';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

export interface PagesPage {
  records: SeoPageRecord[];
  totalCount: number;
}

interface SeoPageRow {
  id: string;
  path: string;
  title: string | null;
  description: string | null;
  needs_audit: boolean;
  is_published: boolean;
  generated_by_ai: boolean | null;
  url_configurations: { images_missing_alt: number } | { images_missing_alt: number }[] | null;
  ai_audits: { seo_score: number | null; timestamp: string }[] | null;
}

export class PagesService {
  /**
   * Lists pages for the Bulk Operations view, with the alt-text coverage
   * and latest audit score each page needs but doesn't carry directly —
   * both live on related tables (`url_configurations`, `ai_audits`), which
   * is exactly why this view had never been wired to real data before:
   * the `SeoPageRecord` shape it was built against doesn't map onto a
   * single table with a plain `select('*')`.
   */
  static async list(page: number, pageSize: number, search?: string): Promise<PagesPage> {
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    let query = supabase
      .from('seo_pages')
      .select(
        'id, path, title, description, needs_audit, is_published, generated_by_ai, url_configurations(images_missing_alt), ai_audits(seo_score, timestamp)',
        { count: 'exact' }
      )
      .order('updated_at', { ascending: false })
      .range(from, to);

    if (search) {
      query = query.ilike('path', `%${search}%`);
    }

    const { data, error, count } = await query;
    if (error) throw error;

    const records: SeoPageRecord[] = ((data ?? []) as unknown as SeoPageRow[]).map((row) => {
      const latestAudit = Array.isArray(row.ai_audits)
        ? [...row.ai_audits].sort(
            (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
          )[0]
        : undefined;

      const altConfig = Array.isArray(row.url_configurations)
        ? row.url_configurations[0]
        : row.url_configurations;

      return {
        id: row.id,
        path: row.path,
        title: row.title,
        description: row.description,
        images_missing_alt: altConfig?.images_missing_alt ?? 0,
        needs_audit: row.needs_audit,
        score: latestAudit?.seo_score ?? null,
        is_published: row.is_published,
        generated_by_ai: row.generated_by_ai ?? false,
      };
    });

    return { records, totalCount: count ?? records.length };
  }

  /**
   * Marks pages for re-audit and registers the run for a worker to pick
   * up. No crawler runs inline here — see `TemplatesService.queueBulkGeneration`
   * for why that boundary is deliberate.
   */
  static async queueAudit(pageIds: string[]): Promise<void> {
    const { error: updateError } = await supabase
      .from('seo_pages')
      .update({ needs_audit: true })
      .in('id', pageIds);
    if (updateError) throw updateError;

    const { error: jobError } = await supabase.from('seo_bulk_jobs').insert([
      {
        job_type: 'crawler',
        status: 'pending',
        total_pages: pageIds.length,
        source_id: pageIds.join(','),
      },
    ]);
    if (jobError) throw jobError;
  }

  static async queueAiGeneration(pageIds: string[]): Promise<void> {
    const { error } = await supabase.from('seo_bulk_jobs').insert([
      {
        job_type: 'ai_generation',
        status: 'pending',
        total_pages: pageIds.length,
        source_id: pageIds.join(','),
      },
    ]);
    if (error) throw error;
  }
}
