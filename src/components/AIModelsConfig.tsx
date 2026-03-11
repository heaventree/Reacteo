import React, { useState, useEffect } from 'react';
import { Settings, Plus, Trash2, Save } from 'lucide-react';
import { useAIModels } from '../lib/ai/hooks';
import type { AIModel } from '../lib/ai/types';

interface AIModelsConfigProps {
  onModelSelected?: (model: AIModel) => void;
}

export const AIModelsConfig: React.FC<AIModelsConfigProps> = ({ onModelSelected }) => {
  const { models, loading, fetchModels } = useAIModels();
  const [newModel, setNewModel] = useState({
    name: '',
    provider: 'openai' as const,
    modelId: '',
    maxTokens: 4096,
    temperature: 0.7,
  });
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    fetchModels();
  }, [fetchModels]);

  const providers = ['openai', 'gemini', 'claude', 'perplexity', 'deepseek'];

  const getProviderInfo = (provider: string) => {
    const info: Record<string, { color: string; icon: string; defaultModel: string }> = {
      openai: {
        color: 'bg-green-100 text-green-700',
        icon: '🤖',
        defaultModel: 'gpt-4-turbo-preview',
      },
      gemini: {
        color: 'bg-blue-100 text-blue-700',
        icon: '✨',
        defaultModel: 'gemini-pro',
      },
      claude: {
        color: 'bg-purple-100 text-purple-700',
        icon: '🧠',
        defaultModel: 'claude-3-opus-20240229',
      },
      perplexity: {
        color: 'bg-orange-100 text-orange-700',
        icon: '🔍',
        defaultModel: 'pplx-70b-online',
      },
      deepseek: {
        color: 'bg-red-100 text-red-700',
        icon: '🔴',
        defaultModel: 'deepseek-chat',
      },
    };
    return info[provider] || info.openai;
  };

  const handleAddModel = async () => {
    if (!newModel.name || !newModel.modelId) {
      alert('Please fill in all fields');
      return;
    }

    // In a real app, this would call an API
    // For now, just close the form
    setShowForm(false);
    setNewModel({
      name: '',
      provider: 'openai',
      modelId: '',
      maxTokens: 4096,
      temperature: 0.7,
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <Settings className="w-6 h-6" />
          AI Model Configuration
        </h2>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            <Plus className="w-4 h-4" />
            Add Model
          </button>
        )}
      </div>

      {/* Add Model Form */}
      {showForm && (
        <div className="p-6 bg-slate-50 border border-slate-200 rounded-lg space-y-4">
          <h3 className="font-semibold text-slate-900">Add New AI Model</h3>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Model Name
              </label>
              <input
                type="text"
                value={newModel.name}
                onChange={(e) => setNewModel({ ...newModel, name: e.target.value })}
                placeholder="e.g., GPT-4 Turbo"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Provider
              </label>
              <select
                value={newModel.provider}
                onChange={(e) => {
                  const provider = e.target.value as typeof newModel.provider;
                  const info = getProviderInfo(provider);
                  setNewModel({
                    ...newModel,
                    provider,
                    modelId: info.defaultModel,
                  });
                }}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {providers.map((p) => (
                  <option key={p} value={p}>
                    {p.charAt(0).toUpperCase() + p.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Model ID
              </label>
              <input
                type="text"
                value={newModel.modelId}
                onChange={(e) => setNewModel({ ...newModel, modelId: e.target.value })}
                placeholder={getProviderInfo(newModel.provider).defaultModel}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Max Tokens
              </label>
              <input
                type="number"
                value={newModel.maxTokens}
                onChange={(e) =>
                  setNewModel({ ...newModel, maxTokens: parseInt(e.target.value) })
                }
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Temperature (0-1)
              </label>
              <input
                type="number"
                step="0.1"
                min="0"
                max="1"
                value={newModel.temperature}
                onChange={(e) =>
                  setNewModel({ ...newModel, temperature: parseFloat(e.target.value) })
                }
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            <button
              onClick={handleAddModel}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              <Save className="w-4 h-4" />
              Save Model
            </button>
            <button
              onClick={() => setShowForm(false)}
              className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Models List */}
      <div className="space-y-3">
        {loading ? (
          <div className="text-center py-8 text-slate-500">Loading models...</div>
        ) : models.length === 0 ? (
          <div className="text-center py-8 text-slate-500">
            No AI models configured. Add one to get started.
          </div>
        ) : (
          models.map((model) => {
            const info = getProviderInfo(model.provider);
            return (
              <div
                key={model.id}
                onClick={() => onModelSelected?.(model)}
                className="p-4 bg-white border border-slate-200 rounded-lg hover:shadow-md transition cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{info.icon}</span>
                    <div>
                      <p className="font-semibold text-slate-900">{model.name}</p>
                      <p className="text-sm text-slate-600">
                        {model.provider} • {model.modelId}
                      </p>
                      <p className="text-xs text-slate-500 mt-1">
                        Max tokens: {model.maxTokens} • Temp: {model.temperature}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {model.isActive && (
                      <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                        Active
                      </span>
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        // Handle delete
                      }}
                      className="p-2 hover:bg-red-50 text-red-600 rounded-lg transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Setup Instructions */}
      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h4 className="font-semibold text-blue-900 mb-2">API Key Setup</h4>
        <p className="text-sm text-blue-800 mb-3">
          To use AI models, configure their API keys as Supabase Edge Function secrets:
        </p>
        <ul className="space-y-1 text-sm text-blue-800">
          <li>• OpenAI: Set secret <code className="bg-white px-2 py-1 rounded">OPENAI_API_KEY</code></li>
          <li>• Gemini: Set secret <code className="bg-white px-2 py-1 rounded">GEMINI_API_KEY</code></li>
          <li>• Claude: Set secret <code className="bg-white px-2 py-1 rounded">CLAUDE_API_KEY</code></li>
          <li>• Perplexity: Set secret <code className="bg-white px-2 py-1 rounded">PERPLEXITY_API_KEY</code></li>
          <li>• Deepseek: Set secret <code className="bg-white px-2 py-1 rounded">DEEPSEEK_API_KEY</code></li>
        </ul>
      </div>
    </div>
  );
};
