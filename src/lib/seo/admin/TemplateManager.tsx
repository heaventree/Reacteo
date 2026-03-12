import React, { useState } from 'react';
import { Plus, Trash2, Edit2, PlayCircle, Bot } from 'lucide-react';

export interface SeoTemplate {
  id: string;
  route_pattern: string;
  post_type: string;
  title_template: string;
  description_template: string;
  schema_type: string;
  ai_fallback_enabled: boolean;
  priority: number;
  changefreq: string;
}

interface TemplateManagerProps {
  templates: SeoTemplate[];
  onSaveTemplate: (template: Partial<SeoTemplate>) => Promise<void>;
  onDeleteTemplate: (id: string) => Promise<void>;
  onRunBulkGeneration: (templateId: string) => Promise<void>;
}

export const TemplateManager: React.FC<TemplateManagerProps> = ({
  templates,
  onSaveTemplate,
  onDeleteTemplate,
  onRunBulkGeneration,
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<SeoTemplate>>({});
  const [isSaving, setIsSaving] = useState(false);

  const handleEdit = (template?: SeoTemplate) => {
    if (template) {
      setEditingId(template.id);
      setFormData(template);
    } else {
      setEditingId('new');
      setFormData({
        route_pattern: '/blog/*',
        post_type: 'article',
        title_template: '%%post_title%% %%sep%% %%sitetitle%%',
        description_template: '%%post_excerpt%%',
        schema_type: 'Article',
        ai_fallback_enabled: true,
        priority: 0.8,
        changefreq: 'weekly',
      });
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSaveTemplate(formData);
      setEditingId(null);
    } finally {
      setIsSaving(false);
    }
  };

  const schemaTypes = ['Article', 'Product', 'WebPage', 'LocalBusiness', 'FAQPage', 'Course'];

  return (
    <div className="space-y-6 max-w-6xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">SEO Templates</h2>
          <p className="text-slate-500 dark:text-slate-400">Map URL patterns to SEO metadata rules and AI fallbacks</p>
        </div>
        <button
          onClick={() => handleEdit()}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Template Rule
        </button>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-xl shadow border border-slate-200 dark:border-slate-800 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
              <th className="p-4 font-semibold text-sm text-slate-600 dark:text-slate-400">Route / Post Type</th>
              <th className="p-4 font-semibold text-sm text-slate-600 dark:text-slate-400">Title Template</th>
              <th className="p-4 font-semibold text-sm text-slate-600 dark:text-slate-400">AI Fallback</th>
              <th className="p-4 font-semibold text-sm text-slate-600 dark:text-slate-400 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
            {templates.length === 0 && (
              <tr>
                <td colSpan={4} className="p-8 text-center text-slate-500">
                  No SEO templates defined. Add one to start generating automatic metadata.
                </td>
              </tr>
            )}
            {templates.map((tpl) => (
              <tr key={tpl.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                <td className="p-4">
                  <div className="font-mono text-sm text-indigo-600 dark:text-indigo-400">{tpl.route_pattern}</div>
                  <div className="text-xs text-slate-500 mt-1 uppercase tracking-widest">{tpl.post_type}</div>
                </td>
                <td className="p-4">
                  <div className="text-sm font-medium text-slate-800 dark:text-slate-200">
                    {tpl.title_template}
                  </div>
                  <div className="text-xs text-slate-500 mt-1 truncate max-w-xs">
                    {tpl.description_template}
                  </div>
                </td>
                <td className="p-4">
                  {tpl.ai_fallback_enabled ? (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300">
                      <Bot className="w-3.5 h-3.5" /> Active
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                      Off
                    </span>
                  )}
                </td>
                <td className="p-4 text-right space-x-2">
                  <button
                    onClick={() => onRunBulkGeneration(tpl.id)}
                    className="p-2 text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded inline-block transition-colors"
                    title="Run Bulk Generate"
                  >
                    <PlayCircle className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleEdit(tpl)}
                    className="p-2 text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 rounded inline-block transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onDeleteTemplate(tpl.id)}
                    className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded inline-block transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editingId && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-200 dark:border-slate-800 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-200 dark:border-slate-800">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                {editingId === 'new' ? 'Create Rule' : 'Edit Rule'}
              </h3>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Route Pattern Matcher</label>
                  <input
                    type="text"
                    value={formData.route_pattern || ''}
                    onChange={(e) => setFormData({ ...formData, route_pattern: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg font-mono text-sm"
                    placeholder="/blog/*"
                  />
                  <p className="text-xs text-slate-500">The URL paths this rule applies to.</p>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Internal Post Type</label>
                  <input
                    type="text"
                    value={formData.post_type || ''}
                    onChange={(e) => setFormData({ ...formData, post_type: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-sm"
                    placeholder="article"
                  />
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                <h4 className="font-medium text-slate-900 dark:text-white">Template Engine</h4>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Title Template</label>
                  <input
                    type="text"
                    value={formData.title_template || ''}
                    onChange={(e) => setFormData({ ...formData, title_template: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-sm"
                  />
                  <p className="text-xs text-slate-500">Tags: %%post_title%% %%sep%% %%sitetitle%% %%category%%</p>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Description Template</label>
                  <textarea
                    value={formData.description_template || ''}
                    onChange={(e) => setFormData({ ...formData, description_template: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-sm h-24"
                  />
                   <p className="text-xs text-slate-500">Fallback tag: %%post_excerpt%% or %%post_content%%</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                 <div className="space-y-2">
                  <label className="text-sm font-medium">Schema Type</label>
                  <select
                    value={formData.schema_type || 'Article'}
                    onChange={(e) => setFormData({ ...formData, schema_type: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-sm"
                  >
                    {schemaTypes.map(st => <option key={st} value={st}>{st}</option>)}
                  </select>
                </div>
                <div className="space-y-2 flex items-center justify-between mt-6">
                  <div>
                    <label className="text-sm font-medium block">AI Fallback</label>
                    <span className="text-xs text-slate-500 block">Generate via AI if tags are empty</span>
                  </div>
                  <button 
                    onClick={() => setFormData({ ...formData, ai_fallback_enabled: !formData.ai_fallback_enabled })}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${formData.ai_fallback_enabled ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-700'}`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${formData.ai_fallback_enabled ? 'translate-x-6' : 'translate-x-1'}`} />
                  </button>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-3 bg-slate-50 dark:bg-slate-900/50">
              <button
                onClick={() => setEditingId(null)}
                className="px-4 py-2 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50"
              >
                {isSaving ? 'Saving...' : 'Save Rule'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
