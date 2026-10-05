import React, { useState, useEffect } from 'react';
import { Save, Key, Globe, EyeOff } from 'lucide-react';

export interface GlobalSettings {
  site_name: string;
  default_separator: string;
  ga4_id: string;
  gtm_id: string;
  gsc_verification: string;
  /** Bing Webmaster Tools site verification meta content. */
  bing_verification: string;
  /** Yandex Webmaster site verification meta content. */
  yandex_verification: string;
  /** Pinterest domain verification meta content. */
  pinterest_verification: string;
  /** Facebook domain verification meta content. */
  facebook_verification: string;
  /**
   * Site-wide "discourage search engines" — forces noindex,nofollow on
   * every page regardless of per-page settings. Bound to the hostname it
   * was enabled for (see settings-service) so a database copied from a
   * staging site can't silently carry this into production.
   */
  discourage_search_engines: boolean;
}

export interface AiKey {
  provider: string; // 'openai', 'gemini', 'claude', etc.
  key: string;
}

interface SettingsPanelProps {
  initialSettings?: GlobalSettings;
  initialKeys?: AiKey[];
  onSaveSettings: (settings: GlobalSettings) => Promise<void>;
  onSaveAiKey: (key: AiKey) => Promise<void>;
}

export const SettingsPanel: React.FC<SettingsPanelProps> = ({
  initialSettings,
  initialKeys = [],
  onSaveSettings,
  onSaveAiKey,
}) => {
  const [settings, setSettings] = useState<GlobalSettings>({
    site_name: 'My React App',
    default_separator: '|',
    ga4_id: '',
    gtm_id: '',
    gsc_verification: '',
    bing_verification: '',
    yandex_verification: '',
    pinterest_verification: '',
    facebook_verification: '',
    discourage_search_engines: false,
    ...initialSettings,
  });

  const [aiKeys, setAiKeys] = useState<{ [provider: string]: string }>({});
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [savingKeyFor, setSavingKeyFor] = useState<string | null>(null);

  useEffect(() => {
    const keyMap: { [key: string]: string } = {};
    initialKeys.forEach((k) => {
      keyMap[k.provider] = k.key;
    });
    setAiKeys(keyMap);
  }, [initialKeys]);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingSettings(true);
    try {
      await onSaveSettings(settings);
    } finally {
      setIsSavingSettings(false);
    }
  };

  const handleSaveKey = async (provider: string) => {
    setSavingKeyFor(provider);
    try {
      await onSaveAiKey({ provider, key: aiKeys[provider] || '' });
    } finally {
      setSavingKeyFor(null);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto p-6">
      {/* Global Metadata Settings */}
      <section className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
        <div className="p-6 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 flex items-center gap-3">
          <Globe className="w-5 h-5 text-blue-500" />
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Global Site Setup</h2>
        </div>
        
        <form onSubmit={handleSaveSettings} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Site Name (%%sitetitle%%)</label>
              <input
                type="text"
                value={settings.site_name}
                onChange={(e) => setSettings({ ...settings, site_name: e.target.value })}
                className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="My Awesome Website"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Default Title Separator (%%sep%%)</label>
              <input
                type="text"
                value={settings.default_separator}
                onChange={(e) => setSettings({ ...settings, default_separator: e.target.value })}
                className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="|"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-100 dark:border-slate-800">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Google Analytics 4 ID</label>
              <input
                type="text"
                value={settings.ga4_id}
                onChange={(e) => setSettings({ ...settings, ga4_id: e.target.value })}
                className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="G-XXXXXXXXXX"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Google Tag Manager ID</label>
              <input
                type="text"
                value={settings.gtm_id}
                onChange={(e) => setSettings({ ...settings, gtm_id: e.target.value })}
                className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="GTM-XXXXXXX"
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Google Search Console Verification Hash</label>
              <input
                type="text"
                value={settings.gsc_verification}
                onChange={(e) => setSettings({ ...settings, gsc_verification: e.target.value })}
                className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g. google1234567890abcdef.html or meta tag content hash"
              />
            </div>
          </div>

          {/* Remaining search-engine verification tags — SEOPress/LV SEO parity:
              Google alone was covered before this. */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-100 dark:border-slate-800">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Bing Webmaster Verification</label>
              <input
                type="text"
                value={settings.bing_verification}
                onChange={(e) => setSettings({ ...settings, bing_verification: e.target.value })}
                className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="meta tag content value"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Yandex Webmaster Verification</label>
              <input
                type="text"
                value={settings.yandex_verification}
                onChange={(e) => setSettings({ ...settings, yandex_verification: e.target.value })}
                className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="meta tag content value"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Pinterest Domain Verification</label>
              <input
                type="text"
                value={settings.pinterest_verification}
                onChange={(e) => setSettings({ ...settings, pinterest_verification: e.target.value })}
                className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="meta tag content value"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Facebook Domain Verification</label>
              <input
                type="text"
                value={settings.facebook_verification}
                onChange={(e) => setSettings({ ...settings, facebook_verification: e.target.value })}
                className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="meta tag content value"
              />
            </div>
          </div>

          {/* Site-wide discourage toggle */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.discourage_search_engines}
                onChange={(e) =>
                  setSettings({ ...settings, discourage_search_engines: e.target.checked })
                }
                className="mt-1 w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="flex items-start gap-2">
                <EyeOff className="w-4 h-4 mt-0.5 text-amber-500 flex-shrink-0" />
                <span className="text-sm text-slate-700 dark:text-slate-300">
                  <span className="font-medium">Discourage search engines from indexing this site</span>
                  <br />
                  Forces <code>noindex, nofollow</code> on every page regardless of per-page
                  settings. Use only on staging — bound to this hostname, so it cannot
                  silently follow a database copy into production.
                </span>
              </span>
            </label>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isSavingSettings}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg flex items-center gap-2 transition-colors disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {isSavingSettings ? 'Saving...' : 'Save Settings'}
            </button>
          </div>
        </form>
      </section>

      {/* AI Provider Keys */}
      <section className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
        <div className="p-6 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 flex items-center gap-3">
          <Key className="w-5 h-5 text-indigo-500" />
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">AI Fallback Integrations</h2>
        </div>
        <div className="p-6 space-y-6">
          <p className="text-sm text-slate-500 dark:text-slate-400 pb-2">
            Securely connect AI providers to enable automated meta-tag generation, Alt-text vision processing, and bulk SEO fixes. Keys are stored encrypted in your database schema.
          </p>
          
          {[
            { id: 'openai', name: 'OpenAI (GPT-4o, Vision)', placeholder: 'sk-proj-...' },
            { id: 'anthropic', name: 'Anthropic (Claude 3.5 Sonnet)', placeholder: 'sk-ant-...' },
            { id: 'google', name: 'Google (Gemini 1.5 Pro)', placeholder: 'AIza...' },
          ].map((provider) => (
            <div key={provider.id} className="flex flex-col md:flex-row gap-4 items-end">
              <div className="space-y-2 flex-grow w-full">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">{provider.name} API Key</label>
                <input
                  type="password"
                  value={aiKeys[provider.id] || ''}
                  onChange={(e) => setAiKeys({ ...aiKeys, [provider.id]: e.target.value })}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono text-sm"
                  placeholder={provider.placeholder}
                />
              </div>
              <button
                onClick={() => handleSaveKey(provider.id)}
                disabled={savingKeyFor === provider.id}
                className="px-4 py-2 min-w-[120px] bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-medium rounded-lg flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
              >
                {savingKeyFor === provider.id ? 'Saving...' : 'Update Key'}
              </button>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
};
