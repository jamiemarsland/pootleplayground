import React, { useState } from 'react';
import { X, Sparkles, Loader2, AlertCircle } from 'lucide-react';

interface AiPromptSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onGenerateBlueprint: (blueprintData: any) => void;
}

export function AiPromptSidebar({ isOpen, onClose, onGenerateBlueprint }: AiPromptSidebarProps) {
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const examplePrompts = [
    "Create a simple blog with 5 posts about technology",
    "Build a portfolio site with an About page, Projects page, and Contact page",
    "Make a business website with homepage, services, and contact form",
    "Create an online magazine with multiple categories and 10 articles",
    "Build a restaurant website with menu, gallery, and reservation info"
  ];

  const handleSubmit = async () => {
    if (!prompt.trim()) {
      setError('Please enter a prompt');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-blueprint`;

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt: prompt.trim() }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate blueprint');
      }

      const blueprintData = await response.json();

      if (!blueprintData || !blueprintData.steps || !Array.isArray(blueprintData.steps)) {
        throw new Error('Invalid blueprint data received from AI');
      }

      if (blueprintData.steps.length === 0) {
        throw new Error('AI generated an empty blueprint. Please try a more detailed prompt.');
      }

      console.log('AI generated blueprint:', blueprintData);

      onGenerateBlueprint(blueprintData);
      setPrompt('');
      onClose();
    } catch (err: any) {
      console.error('Error generating blueprint:', err);
      setError(err.message || 'Failed to generate blueprint. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleExampleClick = (example: string) => {
    setPrompt(example);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      handleSubmit();
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 transition-opacity"
        onClick={onClose}
      />

      <div className="fixed right-0 top-0 h-full w-full sm:w-[500px] blueprint-paper border-l border-blueprint-accent/30 z-50 shadow-2xl transform transition-transform duration-300 ease-out overflow-y-auto">
        <div className="sticky top-0 blueprint-paper border-b border-blueprint-accent/30 px-6 py-4 z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-blueprint-text">AI Blueprint Generator</h2>
                <p className="text-xs text-blueprint-text/60">Describe your site, we'll build it</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-blueprint-accent/10 rounded-lg transition-colors"
              disabled={isLoading}
            >
              <X className="w-5 h-5 text-blueprint-text/70" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-blueprint-text mb-2">
              Describe your WordPress site
            </label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="E.g., Create a photography portfolio with a gallery, about page, and contact form..."
              className="w-full h-40 px-4 py-3 border border-blueprint-accent/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 resize-none text-white bg-slate-600 placeholder:text-slate-300"
              disabled={isLoading}
            />
            <p className="text-xs text-blueprint-text/60 mt-2">
              Press Cmd/Ctrl + Enter to generate
            </p>
          </div>

          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-red-800">Error</p>
                <p className="text-sm text-red-600">{error}</p>
              </div>
            </div>
          )}

          <div>
            <h3 className="text-sm font-medium text-blueprint-text mb-3">Example Prompts</h3>
            <div className="space-y-2">
              {examplePrompts.map((example, index) => (
                <button
                  key={index}
                  onClick={() => handleExampleClick(example)}
                  disabled={isLoading}
                  className="w-full text-left px-4 py-3 border border-blueprint-accent/20 rounded-lg hover:bg-blueprint-accent/5 hover:border-blueprint-accent/40 transition-all text-sm text-blueprint-text/80 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {example}
                </button>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-blueprint-accent/20">
            <button
              onClick={handleSubmit}
              disabled={isLoading || !prompt.trim()}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-medium rounded-lg hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Generating Blueprint...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  <span>Generate Blueprint</span>
                </>
              )}
            </button>
          </div>

          <div className="p-4 bg-blue-50/50 border border-blue-200/50 rounded-lg">
            <h4 className="text-sm font-medium text-blue-900 mb-2">Tips for better results:</h4>
            <ul className="text-xs text-blue-800 space-y-1 list-disc list-inside">
              <li>Be specific about pages, posts, and content you want</li>
              <li>Mention any plugins or themes you'd like installed</li>
              <li>Describe the site's purpose and target audience</li>
              <li>Include details about navigation and structure</li>
            </ul>
          </div>
        </div>
      </div>
    </>
  );
}
