import React, { useState } from 'react';
import { LayoutDashboard, Zap, FileText, Settings } from 'lucide-react';
import { SEO } from '../lib/seo';
import { AIModelsConfig } from '../components/AIModelsConfig';
import { BlogEditor } from '../components/BlogEditor';
import { SEOAuditReport } from '../components/SEOAuditReport';
import { useAIAudit } from '../lib/ai/hooks';
import type { AIModel } from '../lib/ai/types';

type AdminTab = 'overview' | 'models' | 'audit' | 'blog' | 'settings';

export const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const [selectedModel, setSelectedModel] = useState<AIModel | null>(null);
  const [auditPagePath, setAuditPagePath] = useState('');
  const { auditPage, auditResult, auditing } = useAIAudit();

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
        </main>
      </div>
    </>
  );
};
