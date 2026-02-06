import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Loader2, AlertCircle, ArrowLeft, Zap } from 'lucide-react';

export function AiGeneratorPage() {
  const navigate = useNavigate();
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

      localStorage.setItem('loadBlueprint', JSON.stringify(blueprintData));
      navigate('/');
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

  return (
    <div className="min-h-screen bg-blueprint-paper blueprint-grid">
      <header className="blueprint-paper border-b border-blueprint-accent/30 sticky top-0 z-50 backdrop-blur-lg">
        <div className="px-4 lg:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/')}
                className="flex items-center gap-2 px-4 py-2 blueprint-button rounded-lg transition-colors text-sm hover:bg-blueprint-accent/10"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="font-medium">Back to Builder</span>
              </button>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 blueprint-accent rounded-xl flex items-center justify-center shadow-lg border border-blueprint-accent/50">
                <Zap className="w-5 h-5 text-blueprint-paper" />
              </div>
              <div>
                <h1 className="text-lg lg:text-xl font-bold text-blueprint-text">Pootle Playground</h1>
                <p className="text-xs lg:text-sm text-blueprint-text/70">AI Generator</p>
              </div>
            </div>

            <div className="w-32"></div>
          </div>
        </div>
      </header>

      <div className="flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-3xl space-y-8">
          <div className="text-center space-y-4">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl shadow-2xl">
              <Sparkles className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-4xl lg:text-5xl font-bold text-blueprint-text">
              Create Your WordPress Site
            </h2>
            <p className="text-lg text-blueprint-text/70 max-w-2xl mx-auto">
              Describe what you want to build, and our AI will generate a complete WordPress blueprint for you
            </p>
          </div>

          <div className="blueprint-paper border border-blueprint-accent/30 rounded-2xl shadow-2xl p-8 space-y-6">
            <div>
              <label className="block text-sm font-medium text-blueprint-text mb-3">
                What would you like to create?
              </label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="E.g., Create a photography portfolio with a gallery, about page, and contact form..."
                className="w-full h-48 px-4 py-3 border border-blueprint-accent/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 resize-none text-white bg-slate-600 placeholder:text-slate-300 text-lg"
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

            <div className="pt-4 border-t border-blueprint-accent/20">
              <button
                onClick={handleSubmit}
                disabled={isLoading || !prompt.trim()}
                className="w-full flex items-center justify-center gap-3 px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold text-lg rounded-xl hover:shadow-2xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98]"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-6 h-6 animate-spin" />
                    <span>Generating Your Site...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-6 h-6" />
                    <span>Launch Site</span>
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-medium text-blueprint-text text-center">Try These Examples</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {examplePrompts.map((example, index) => (
                <button
                  key={index}
                  onClick={() => handleExampleClick(example)}
                  disabled={isLoading}
                  className="text-left px-4 py-3 blueprint-paper border border-blueprint-accent/20 rounded-lg hover:bg-blueprint-accent/5 hover:border-blueprint-accent/40 hover:shadow-lg transition-all text-sm text-blueprint-text/80 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {example}
                </button>
              ))}
            </div>
          </div>

          <div className="blueprint-paper border border-blue-200/50 rounded-xl p-6">
            <h4 className="text-sm font-semibold text-blueprint-text mb-3 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-blue-500" />
              Tips for Better Results
            </h4>
            <ul className="text-sm text-blueprint-text/70 space-y-2">
              <li className="flex items-start gap-2">
                <span className="text-blue-500 mt-1">•</span>
                <span>Be specific about pages, posts, and content you want</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-500 mt-1">•</span>
                <span>Mention any plugins or themes you'd like installed</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-500 mt-1">•</span>
                <span>Describe the site's purpose and target audience</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-500 mt-1">•</span>
                <span>Include details about navigation and structure</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
