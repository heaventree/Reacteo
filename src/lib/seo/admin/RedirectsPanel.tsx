import React, { useState } from 'react';
import { ArrowRight, Plus, Trash2, Link2 } from 'lucide-react';
import { normalizeRedirectPath, type RedirectRule } from '../utils/redirects';

export interface RedirectRow extends RedirectRule {
  id: string;
  hitCount: number;
}

interface RedirectsPanelProps {
  redirects: RedirectRow[];
  onCreate: (rule: RedirectRule) => Promise<void>;
  onToggle: (id: string, enabled: boolean) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

/**
 * Redirects admin screen — the SEOPress-equivalent "Redirections" tab /
 * LV SEO's redirects CRUD screen. Same path-normalisation rule as both
 * (`normalizeRedirectPath`), so rules carried over from a migration match
 * exactly as they did on the old platform.
 */
export const RedirectsPanel: React.FC<RedirectsPanelProps> = ({
  redirects,
  onCreate,
  onToggle,
  onDelete,
}) => {
  const [sourcePath, setSourcePath] = useState('');
  const [destinationPath, setDestinationPath] = useState('');
  const [statusCode, setStatusCode] = useState<RedirectRule['statusCode']>(301);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sourcePath.trim() || !destinationPath.trim()) return;

    setSaving(true);
    setError(null);
    try {
      await onCreate({
        sourcePath: normalizeRedirectPath(sourcePath),
        destinationPath: destinationPath.trim(),
        statusCode,
        enabled: true,
      });
      setSourcePath('');
      setDestinationPath('');
      setStatusCode(301);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create redirect');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto p-6">
      <section className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
        <div className="p-6 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 flex items-center gap-3">
          <Link2 className="w-5 h-5 text-blue-500" />
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Redirects</h2>
        </div>

        <form onSubmit={handleAdd} className="p-6 space-y-4 border-b border-slate-100 dark:border-slate-800">
          <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr_auto] gap-4 items-end">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">From</label>
              <input
                type="text"
                value={sourcePath}
                onChange={(e) => setSourcePath(e.target.value)}
                placeholder="/old-page"
                className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
              />
            </div>
            <ArrowRight className="w-5 h-5 text-slate-400 mb-2.5 hidden md:block" />
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">To</label>
              <input
                type="text"
                value={destinationPath}
                onChange={(e) => setDestinationPath(e.target.value)}
                placeholder="/new-page"
                className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Type</label>
              <select
                value={statusCode}
                onChange={(e) => setStatusCode(Number(e.target.value) as RedirectRule['statusCode'])}
                className="px-3 py-2 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value={301}>301 (Permanent)</option>
                <option value={302}>302 (Temporary)</option>
                <option value={307}>307 (Temp, method-preserving)</option>
                <option value={308}>308 (Permanent, method-preserving)</option>
              </select>
            </div>
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg flex items-center gap-2 transition-colors disabled:opacity-50"
            >
              <Plus className="w-4 h-4" />
              {saving ? 'Adding...' : 'Add Redirect'}
            </button>
          </div>
        </form>

        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {redirects.length === 0 && (
            <p className="p-6 text-sm text-slate-500 dark:text-slate-400">
              No redirects yet. Years of inbound links and search rankings point at old
              URLs — add a rule here before a page moves or disappears, not after.
            </p>
          )}
          {redirects.map((redirect) => (
            <div
              key={redirect.id}
              className="p-4 flex items-center gap-4 hover:bg-slate-50 dark:hover:bg-slate-800/50"
            >
              <label className="flex items-center gap-2 cursor-pointer flex-shrink-0">
                <input
                  type="checkbox"
                  checked={redirect.enabled ?? true}
                  onChange={(e) => onToggle(redirect.id, e.target.checked)}
                  className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
              </label>
              <span className="font-mono text-sm text-slate-700 dark:text-slate-300 truncate">
                {redirect.sourcePath}
              </span>
              <ArrowRight className="w-4 h-4 text-slate-400 flex-shrink-0" />
              <span className="font-mono text-sm text-slate-900 dark:text-white truncate flex-1">
                {redirect.destinationPath}
              </span>
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 rounded px-2 py-1 flex-shrink-0">
                {redirect.statusCode}
              </span>
              <span className="text-xs text-slate-400 flex-shrink-0">{redirect.hitCount} hits</span>
              <button
                onClick={() => onDelete(redirect.id)}
                className="text-slate-400 hover:text-red-600 flex-shrink-0"
                aria-label="Delete redirect"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
