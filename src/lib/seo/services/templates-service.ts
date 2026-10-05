import { createClient } from '@supabase/supabase-js';
import type { SeoTemplate } from '../admin/TemplateManager';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

export class TemplatesService {
  static async list(): Promise<SeoTemplate[]> {
    const { data, error } = await supabase
      .from('seo_templates')
      .select('*')
      .order('priority', { ascending: false });

    if (error) throw error;
    return (data ?? []) as SeoTemplate[];
  }

  static async save(template: Partial<SeoTemplate>): Promise<SeoTemplate> {
    const { id, ...patch } = template;

    const { data, error } = id
      ? await supabase.from('seo_templates').update(patch).eq('id', id).select().single()
      : await supabase.from('seo_templates').insert([patch]).select().single();

    if (error) throw error;
    return data as SeoTemplate;
  }

  static async remove(id: string): Promise<void> {
    const { error } = await supabase.from('seo_templates').delete().eq('id', id);
    if (error) throw error;
  }

  /**
   * Registers a bulk-generation run against this template for a worker to
   * pick up. This does not itself call an AI provider or crawl any pages —
   * no such worker exists in this repo yet, and building one is a
   * materially different (and larger) feature than wiring this already-
   * built UI to real data. The job row is the real, durable hand-off point
   * for that worker once it exists.
   */
  static async queueBulkGeneration(templateId: string): Promise<void> {
    const { error } = await supabase.from('seo_bulk_jobs').insert([
      {
        job_type: 'ai_generation',
        status: 'pending',
        source_id: templateId,
      },
    ]);
    if (error) throw error;
  }
}
