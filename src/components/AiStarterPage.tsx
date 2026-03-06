import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Sparkles, Loader2, Send } from 'lucide-react';
import { Footer } from './Footer';

interface GeneratedSite {
  siteTitle: string;
  pages: {
    title: string;
    sections: string[];
  }[];
  menu: string[];
}

export function AiStarterPage() {
  const navigate = useNavigate();
  const [siteType, setSiteType] = useState('business');
  const [siteName, setSiteName] = useState('');
  const [description, setDescription] = useState('');
  const [contentLevel, setContentLevel] = useState('starter-headings');
  const [selectedPages, setSelectedPages] = useState<string[]>(['home', 'about', 'contact']);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedSite, setGeneratedSite] = useState<GeneratedSite | null>(null);

  const pageOptions = [
    { id: 'home', label: 'Home' },
    { id: 'about', label: 'About' },
    { id: 'services', label: 'Services' },
    { id: 'blog', label: 'Blog' },
    { id: 'contact', label: 'Contact' },
    { id: 'testimonials', label: 'Testimonials' },
    { id: 'pricing', label: 'Pricing' },
    { id: 'faq', label: 'FAQ' }
  ];

  const togglePage = (pageId: string) => {
    setSelectedPages(prev =>
      prev.includes(pageId)
        ? prev.filter(id => id !== pageId)
        : [...prev, pageId]
    );
  };

  const handleGenerate = async () => {
    setIsGenerating(true);

    const payload = {
      siteType,
      siteName,
      description,
      selectedPages,
      contentLevel
    };

    console.log('Sending to API:', payload);

    setTimeout(() => {
      const mockResponse: GeneratedSite = {
        siteTitle: siteName || 'My Website',
        pages: selectedPages.map(pageId => {
          const page = pageOptions.find(p => p.id === pageId);
          const sections = pageId === 'home'
            ? ['Hero', 'Features', 'Testimonials', 'CTA']
            : pageId === 'about'
            ? ['Story', 'Team', 'Values']
            : pageId === 'services'
            ? ['Services Grid', 'Process', 'Pricing']
            : pageId === 'contact'
            ? ['Contact Form', 'Map', 'Info']
            : pageId === 'blog'
            ? ['Blog Grid', 'Categories']
            : pageId === 'testimonials'
            ? ['Testimonials Grid', 'Stats']
            : pageId === 'pricing'
            ? ['Pricing Table', 'FAQ']
            : ['Content Section'];

          return {
            title: page?.label || pageId,
            sections
          };
        }),
        menu: selectedPages.map(pageId => {
          const page = pageOptions.find(p => p.id === pageId);
          return page?.label || pageId;
        })
      };

      setGeneratedSite(mockResponse);
      setIsGenerating(false);
    }, 2000);
  };

  const handleSendToPlayground = () => {
    console.log('Sending to Playground:', generatedSite);
    alert('Check the console for the generated site data!');
  };

  return (
    <div className="min-h-screen bg-blueprint-paper blueprint-grid flex flex-col">
      <header className="bg-blueprint-paper border-b border-blueprint-accent/30 sticky top-0 z-50 backdrop-blur-lg">
        <div className="px-4 lg:px-6 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-2 text-blueprint-text hover:text-blueprint-accent transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="font-medium">Back</span>
            </button>
            <div className="flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-blueprint-accent" />
              <h1 className="text-xl font-bold text-blueprint-text">AI Starter Site Generator</h1>
            </div>
          </div>
        </div>
      </header>

      <div className="flex-1 max-w-5xl mx-auto w-full px-6 py-12">
        <div className="text-center mb-8">
          <p className="text-blueprint-text/70 text-lg">
            Describe the website you want and we'll generate starter pages, navigation, and content structure.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          <div className="bg-blueprint-paper border border-blueprint-accent/30 rounded-xl p-8">
            <h2 className="text-xl font-semibold text-blueprint-text mb-6">Site Details</h2>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-blueprint-text mb-2">
                  Site Type
                </label>
                <select
                  value={siteType}
                  onChange={(e) => setSiteType(e.target.value)}
                  className="w-full px-4 py-2 border border-blueprint-accent/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-blueprint-accent bg-slate-600 text-white"
                >
                  <option value="business">Business</option>
                  <option value="personal-brand">Personal brand</option>
                  <option value="portfolio">Portfolio</option>
                  <option value="blog">Blog</option>
                  <option value="agency">Agency</option>
                  <option value="online-course">Online course</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-blueprint-text mb-2">
                  Site Name
                </label>
                <input
                  type="text"
                  value={siteName}
                  onChange={(e) => setSiteName(e.target.value)}
                  placeholder="e.g., Cheltenham Yoga Studio"
                  className="w-full px-4 py-2 border border-blueprint-accent/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-blueprint-accent bg-slate-600 text-white placeholder:text-slate-300"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-blueprint-text mb-2">
                  What does the site do?
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="A yoga studio in Cheltenham offering beginner friendly classes and workshops."
                  rows={4}
                  className="w-full px-4 py-2 border border-blueprint-accent/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-blueprint-accent resize-none bg-slate-600 text-white placeholder:text-slate-300"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-blueprint-text mb-3">
                  Pages needed
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {pageOptions.map(page => (
                    <label key={page.id} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedPages.includes(page.id)}
                        onChange={() => togglePage(page.id)}
                        className="w-4 h-4 text-blueprint-accent rounded border-blueprint-accent/30 focus:ring-blueprint-accent"
                      />
                      <span className="text-sm text-blueprint-text">{page.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-blueprint-text mb-3">
                  Content level
                </label>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="contentLevel"
                      value="structure-only"
                      checked={contentLevel === 'structure-only'}
                      onChange={(e) => setContentLevel(e.target.value)}
                      className="w-4 h-4 text-blueprint-accent border-blueprint-accent/30 focus:ring-blueprint-accent"
                    />
                    <span className="text-sm text-blueprint-text">Structure only</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="contentLevel"
                      value="starter-headings"
                      checked={contentLevel === 'starter-headings'}
                      onChange={(e) => setContentLevel(e.target.value)}
                      className="w-4 h-4 text-blueprint-accent border-blueprint-accent/30 focus:ring-blueprint-accent"
                    />
                    <span className="text-sm text-blueprint-text">Starter headings</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="contentLevel"
                      value="full-starter-copy"
                      checked={contentLevel === 'full-starter-copy'}
                      onChange={(e) => setContentLevel(e.target.value)}
                      className="w-4 h-4 text-blueprint-accent border-blueprint-accent/30 focus:ring-blueprint-accent"
                    />
                    <span className="text-sm text-blueprint-text">Full starter copy</span>
                  </label>
                </div>
              </div>

              <button
                onClick={handleGenerate}
                disabled={isGenerating || !siteName || !description}
                className="w-full bg-blueprint-accent text-white px-6 py-3 rounded-lg font-medium hover:bg-blueprint-accent/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    Generate Starter Site
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="bg-blueprint-paper border border-blueprint-accent/30 rounded-xl p-8">
            {!generatedSite ? (
              <div className="h-full flex items-center justify-center text-blueprint-text/40">
                <div className="text-center">
                  <Sparkles className="w-16 h-16 mx-auto mb-4 opacity-20" />
                  <p>Your generated site will appear here</p>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-blueprint-text mb-2">
                    {generatedSite.siteTitle}
                  </h2>
                  <p className="text-sm text-blueprint-text/60">Starter Site Preview</p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-blueprint-text mb-3">Pages</h3>
                  <div className="space-y-3">
                    {generatedSite.pages.map((page, idx) => (
                      <div key={idx} className="bg-blueprint-accent/5 rounded-lg p-4">
                        <h4 className="font-medium text-blueprint-text mb-2">{page.title}</h4>
                        <ul className="space-y-1">
                          {page.sections.map((section, sIdx) => (
                            <li key={sIdx} className="text-sm text-blueprint-text/70 pl-4">
                              • {section}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-blueprint-text mb-3">Navigation</h3>
                  <div className="flex flex-wrap gap-2">
                    {generatedSite.menu.map((item, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1 bg-blueprint-accent/10 text-blueprint-text rounded-lg text-sm"
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                </div>

                <button
                  onClick={handleSendToPlayground}
                  className="w-full bg-green-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                >
                  <Send className="w-5 h-5" />
                  Send to Playground
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
