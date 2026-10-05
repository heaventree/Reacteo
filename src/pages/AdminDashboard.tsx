import React, { useState, useEffect, useCallback } from 'react';
import { LayoutDashboard, Zap, FileText, Settings, Link2, LayoutTemplate, ListChecks } from 'lucide-react';
import {
  SEO,
  SettingsPanel,
  RedirectsPanel,
  TemplateManager,
  BulkOperationsView,
  SettingsService,
  RedirectsService,
  TemplatesService,
  PagesService,
  type GlobalSettings,
  type RedirectRow,
  type RedirectRule,
  type SeoTemplate,
  type SeoPageRecord,
} from '../lib/seo';
import { AIModelsConfig } from '../components/AIModelsConfig';
import { BlogEditor } from '../components/BlogEditor';
import { SEOAuditReport } from '../components/SEOAuditReport';
import { useAIAudit } from '../lib/ai/hooks';
import type { AIModel } from '../lib/ai/types';

type AdminTab =
  | 'overview'
  | 'models'
  | 'audit'
  | 'blog'
  | 'settings'
  | 'redirects'
  | 'templates'
  | 'bulk';

const BULK_PAGE_SIZE = 25;

export const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const [selectedModel, setSelectedModel] = useState<AIModel | null>(null);
  const [auditPagePath, setAuditPagePath] = useState('');
  const { auditPage, auditResult, auditing } = useAIAudit();

  const [settings, setSettings] = useState<GlobalSettings | undefined>(undefined);
  const [redirects, setRedirects] = useState<RedirectRow[]>([]);
  const [templates, setTemplates] = useState<SeoTemplate[]>([]);
  const [bulkPages, setBulkPages] = useState<SeoPageRecord[]>([]);
  const [bulkTotalCount, setBulkTotalCount] = useState(0);
  const [bulkPage, setBulkPage] = useState(1);

  const loadBulkPages = useCallback((pageNum: number) => {
    PagesService.list(pageNum, BULK_PAGE_SIZE)
      .then(({ records, totalCount }) => {
        setBulkPages(records);
        setBulkTotalCount(totalCount);
      })
      .catch((err) => console.error('Failed to load SEO pages:', err));
  }, []);

  useEffect(() => {
    SettingsService.get()
      .then((s) => setSettings(s ?? undefined))
      .catch((err) => console.error('Failed to load SEO settings:', err));
    RedirectsService.list()
      .then(setRedirects)
      .catch((err) => console.error('Failed to load redirects:', err));
    TemplatesService.list()
      .then(setTemplates)
      .catch((err) => console.error('Failed to load SEO templates:', err));
    loadBulkPages(1);
  }, [loadBulkPages]);

  const handleSaveTemplate = useCallback(async (template: Partial<SeoTemplate>) => {
    const saved = await TemplatesService.save(template);
    setTemplates((prev) => {
      const exists = prev.some((t) => t.id === saved.id);
      return exists ? prev.map((t) => (t.id === saved.id ? saved : t)) : [saved, ...prev];
    });
  }, []);

  const handleDeleteTemplate = useCallback(async (id: string) => {
    await TemplatesService.remove(id);
    setTemplates((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const handleBulkPageChange = useCallback(
    (nextPage: number) => {
      setBulkPage(nextPage);
      loadBulkPages(nextPage);
    },
    [loadBulkPages]
  );

  const handleSaveSettings = useCallback(async (next: GlobalSettings) => {
    const saved = await SettingsService.save(next);
    setSettings(saved);
  }, []);

  const handleCreateRedirect = useCallback(async (rule: RedirectRule) => {
    const created = await RedirectsService.create(rule);
    setRedirects((prev) => [created, ...prev]);
  }, []);

  const handleToggleRedirect = useCallback(async (id: string, enabled: boolean) => {
    const updated = await RedirectsService.update(id, { enabled });
    setRedirects((prev) => prev.map((r) => (r.id === id ? updated : r)));
  }, []);

  const handleDeleteRedirect = useCallback(async (id: string) => {
    await RedirectsService.remove(id);
    setRedirects((prev) => prev.filter((r) => r.id !== id));
  }, []);

  const handleRunAudit = async () => {
    if (!auditPagePath || !selectedModel) {
      alert('Please select a model and enter a page path');
      return;
    }

    try {
      await auditPage(auditPagePath, selectedModel.id);
    } catch (error) {
      console.error('Audit failed:', error);
    }
  };

  return (
    <>
      <SEO
        title="Admin Dashboard"
        description="Manage your SEO, AI models, and blog content"
        noindex={true}
      />

      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        {/* Header */}
        <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
                <LayoutDashboard className="w-8 h-8 text-blue-600" />
                Admin Dashboard
              </h1>
              <span className="text-sm text-slate-600">
                {selectedModel && `Using: ${selectedModel.name}`}
              </span>
            </div>
          </div>
        </header>

        {/* Navigation */}
        <nav className="bg-white border-b border-slate-200">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex gap-8 overflow-x-auto">
              {(
                [
                  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
                  { id: 'models', label: 'AI Models', icon: Zap },
                  { id: 'audit', label: 'SEO Audit', icon: Settings },
                  { id: 'blog', label: 'Blog', icon: FileText },
                  { id: 'templates', label: 'Templates', icon: LayoutTemplate },
                  { id: 'bulk', label: 'Bulk Operations', icon: ListChecks },
                  { id: 'redirects', label: 'Redirects', icon: Link2 },
                  { id: 'settings', label: 'Settings', icon: Settings },
                ] as const
              ).map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setActiveTab(id)}
                  className={`flex items-center gap-2 px-4 py-4 border-b-2 font-medium transition ${
                    activeTab === id
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {label}
                </button>
              ))}
            </div>
          </div>
        </nav>

        {/* Content */}
        <main className="max-w-7xl mx-auto px-6 py-8">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="grid grid-cols-4 gap-4">
                <div className="p-6 bg-white rounded-lg border border-slate-200 shadow-sm">
                  <p className="text-sm text-slate-600 mb-1">AI Models</p>
                  <p className="text-3xl font-bold text-slate-900">5</p>
                </div>
                <div className="p-6 bg-white rounded-lg border border-slate-200 shadow-sm">
                  <p className="text-sm text-slate-600 mb-1">Blog Posts</p>
                  <p className="text-3xl font-bold text-slate-900">0</p>
                </div>
                <div className="p-6 bg-white rounded-lg border border-slate-200 shadow-sm">
                  <p className="text-sm text-slate-600 mb-1">Pages Audited</p>
                  <p className="text-3xl font-bold text-slate-900">0</p>
                </div>
                <div className="p-6 bg-white rounded-lg border border-slate-200 shadow-sm">
                  <p className="text-sm text-slate-600 mb-1">Avg SEO Score</p>
                  <p className="text-3xl font-bold text-slate-900">—</p>
                </div>
              </div>

              <div className="p-6 bg-blue-50 border border-blue-200 rounded-lg">
                <h3 className="font-semibold text-blue-900 mb-2">Welcome to AI SEO Manager!</h3>
                <p className="text-blue-800 text-sm mb-3">
                  This dashboard provides AI-powered SEO management for your React app. You can:
                </p>
                <ul className="space-y-2 text-sm text-blue-800">
                  <li>✨ Configure multiple AI models (OpenAI, Gemini, Claude, Perplexity, Deepseek)</li>
                  <li>🔍 Run comprehensive SEO audits on your pages</li>
                  <li>📝 Create and manage blog posts with SEO optimization</li>
                  <li>🎯 Get AI-powered suggestions for improvements</li>
                  <li>📊 Track H1/H2 hierarchy, metadata, alt text, and schemas</li>
                </ul>
              </div>
            </div>
          )}

          {/* AI Models Tab */}
          {activeTab === 'models' && (
            <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-6">
              <AIModelsConfig onModelSelected={setSelectedModel} />
            </div>
          )}

          {/* SEO Audit Tab */}
          {activeTab === 'audit' && (
            <div className="space-y-6">
              <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-6">
                <h2 className="text-2xl font-bold text-slate-900 mb-4">Run SEO Audit</h2>

                {!selectedModel && (
                  <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg mb-4">
                    <p className="text-sm text-yellow-800">
                      Please configure and select an AI model first in the "AI Models" section
                    </p>
                  </div>
                )}

                <div className="space-y-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Model: {selectedModel?.name || 'Not selected'}
                    </label>
                    <button
                      onClick={() => setActiveTab('models')}
                      className="text-sm text-blue-600 hover:text-blue-700"
                    >
                      Choose different model →
                    </button>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Page Path
                    </label>
                    <input
                      type="text"
                      value={auditPagePath}
                      onChange={(e) => setAuditPagePath(e.target.value)}
                      placeholder="e.g., /blog/my-post or /about"
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <button
                    onClick={handleRunAudit}
                    disabled={auditing || !selectedModel}
                    className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-400 transition font-medium"
                  >
                    {auditing ? 'Running Audit...' : 'Run Audit'}
                  </button>
                </div>

                {auditResult && (
                  <div className="border-t border-slate-200 pt-6">
                    <h3 className="text-lg font-semibold text-slate-900 mb-4">Audit Results</h3>
                    <SEOAuditReport result={auditResult} />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Blog Tab */}
          {activeTab === 'blog' && (
            <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-6">
              <BlogEditor />
            </div>
          )}

          {/* Templates Tab */}
          {activeTab === 'templates' && (
            <TemplateManager
              templates={templates}
              onSaveTemplate={handleSaveTemplate}
              onDeleteTemplate={handleDeleteTemplate}
              onRunBulkGeneration={(templateId) => TemplatesService.queueBulkGeneration(templateId)}
            />
          )}

          {/* Bulk Operations Tab */}
          {activeTab === 'bulk' && (
            <BulkOperationsView
              pages={bulkPages}
              totalCount={bulkTotalCount}
              currentPage={bulkPage}
              onPageChange={handleBulkPageChange}
              onRunAudit={(pageIds) => PagesService.queueAudit(pageIds).then(() => loadBulkPages(bulkPage))}
              onRunAiGeneration={(pageIds) => PagesService.queueAiGeneration(pageIds)}
            />
          )}

          {/* Redirects Tab */}
          {activeTab === 'redirects' && (
            <RedirectsPanel
              redirects={redirects}
              onCreate={handleCreateRedirect}
              onToggle={handleToggleRedirect}
              onDelete={handleDeleteRedirect}
            />
          )}

          {/* Settings Tab */}
          {activeTab === 'settings' && (
            <SettingsPanel
              initialSettings={settings}
              onSaveSettings={handleSaveSettings}
              onSaveAiKey={async () => {
                // AI provider keys are a separate concern from SEO settings
                // (see `ai_keys` table / AI Models tab) and are not wired
                // through this panel's save path.
              }}
            />
          )}
        </main>
      </div>
    </>
  );
};
