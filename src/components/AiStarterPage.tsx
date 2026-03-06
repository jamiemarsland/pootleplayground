import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Sparkles, Loader2, Send, LayoutTemplate } from 'lucide-react';
import { Footer } from './Footer';

interface GeneratedSite {
  siteTitle: string;
  pages: {
    title: string;
    sections: string[];
  }[];
  menu: string[];
}

const PAGE_OPTIONS = [
  { id: 'home', label: 'Home' },
  { id: 'about', label: 'About' },
  { id: 'services', label: 'Services' },
  { id: 'blog', label: 'Blog' },
  { id: 'contact', label: 'Contact' },
  { id: 'testimonials', label: 'Testimonials' },
  { id: 'pricing', label: 'Pricing' },
  { id: 'faq', label: 'FAQ' },
];

const SECTIONS_BY_PAGE: Record<string, string[]> = {
  home: ['Hero', 'Features', 'Testimonials', 'CTA'],
  about: ['Story', 'Team', 'Values'],
  services: ['Services Grid', 'Process', 'Pricing'],
  contact: ['Contact Form', 'Map', 'Info'],
  blog: ['Blog Grid', 'Categories'],
  testimonials: ['Testimonials Grid', 'Stats'],
  pricing: ['Pricing Table', 'FAQ'],
  faq: ['FAQ List'],
};

function buildMockResponse(
  siteName: string,
  selectedPages: string[]
): GeneratedSite {
  return {
    siteTitle: siteName || 'My Website',
    pages: selectedPages.map(id => ({
      title: PAGE_OPTIONS.find(p => p.id === id)?.label ?? id,
      sections: SECTIONS_BY_PAGE[id] ?? ['Content Section'],
    })),
    menu: selectedPages.map(id => PAGE_OPTIONS.find(p => p.id === id)?.label ?? id),
  };
}

const INPUT_CLS = 'w-full px-4 py-2.5 border border-blueprint-accent/30 rounded-lg bg-blueprint-900/60 text-blueprint-text placeholder:text-blueprint-text/30 focus:outline-none focus:ring-2 focus:ring-blueprint-accent/60 transition';
const LABEL_CLS = 'block text-sm font-medium text-blueprint-text/80 mb-2';

export function AiStarterPage() {
  const navigate = useNavigate();
  const [siteType, setSiteType] = useState('business');
  const [siteName, setSiteName] = useState('');
  const [description, setDescription] = useState('');
  const [contentLevel, setContentLevel] = useState('starter-headings');
  const [selectedPages, setSelectedPages] = useState<string[]>(['home', 'about', 'contact']);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedSite, setGeneratedSite] = useState<GeneratedSite | null>(null);

  const togglePage = (id: string) => {
    setSelectedPages(prev =>
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    );
  };

  const handleGenerate = () => {
    setIsGenerating(true);
    setGeneratedSite(null);

    const payload = { siteType, siteName, description, selectedPages, contentLevel };
    console.log('POST /api/generate-site', payload);

    setTimeout(() => {
      setGeneratedSite(buildMockResponse(siteName, selectedPages));
      setIsGenerating(false);
    }, 1800);
  };

  const handleSendToPlayground = () => {
    console.log('Send to Playground:', JSON.stringify(generatedSite, null, 2));
  };

  const canGenerate = !isGenerating && siteName.trim().length > 0 && description.trim().length > 0 && selectedPages.length > 0;

  return (
    <div className='min-h-screen bg-blueprint-paper blueprint-grid flex flex-col'>
      <header className='bg-blueprint-paper border-b border-blueprint-accent/30 sticky top-0 z-50 backdrop-blur-lg'>
        <div className='px-4 lg:px-6 py-4'>
          <div className='flex items-center gap-4'>
            <button
              onClick={() => navigate('/')}
              className='flex items-center gap-2 text-blueprint-text/70 hover:text-blueprint-accent transition-colors'
            >
              <ArrowLeft className='w-5 h-5' />
              <span className='font-medium'>Back</span>
            </button>
            <div className='flex items-center gap-2'>
              <Sparkles className='w-5 h-5 text-blueprint-accent' />
              <h1 className='text-xl font-bold text-blueprint-text'>AI Starter Site Generator</h1>
            </div>
            <span className='ml-auto text-xs font-semibold px-2.5 py-1 rounded-full bg-blueprint-accent/15 text-blueprint-accent tracking-wide'>
              EXPERIMENTAL
            </span>
          </div>
        </div>
      </header>

      <div className='flex-1 max-w-5xl mx-auto w-full px-6 py-10'>
        <div className='text-center mb-10'>
          <p className='text-blueprint-text/60 text-base max-w-lg mx-auto'>
            Describe the website you want and we'll generate starter pages, navigation, and content structure.
          </p>
        </div>

        <div className='grid lg:grid-cols-2 gap-8 items-start'>
          <div className='bg-blueprint-800/40 border border-blueprint-accent/20 rounded-2xl p-8 space-y-6'>
            <h2 className='text-lg font-semibold text-blueprint-text'>Site Details</h2>

            <div>
              <label className={LABEL_CLS}>Site Type</label>
              <select
                value={siteType}
                onChange={e => setSiteType(e.target.value)}
                className={INPUT_CLS}
              >
                <option value='business'>Business</option>
                <option value='personal-brand'>Personal brand</option>
                <option value='portfolio'>Portfolio</option>
                <option value='blog'>Blog</option>
                <option value='agency'>Agency</option>
                <option value='online-course'>Online course</option>
                <option value='other'>Other</option>
              </select>
            </div>

            <div>
              <label className={LABEL_CLS}>Site Name</label>
              <input
                type='text'
                value={siteName}
                onChange={e => setSiteName(e.target.value)}
                placeholder='e.g., Cheltenham Yoga Studio'
                className={INPUT_CLS}
              />
            </div>

            <div>
              <label className={LABEL_CLS}>What does the site do?</label>
              <textarea
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder='A yoga studio in Cheltenham offering beginner friendly classes and workshops.'
                rows={4}
                className={INPUT_CLS + ' resize-none'}
              />
            </div>

            <div>
              <label className={LABEL_CLS}>Pages needed</label>
              <div className='grid grid-cols-2 gap-2'>
                {PAGE_OPTIONS.map(page => (
                  <label key={page.id} className='flex items-center gap-2 cursor-pointer group'>
                    <input
                      type='checkbox'
                      checked={selectedPages.includes(page.id)}
                      onChange={() => togglePage(page.id)}
                      className='w-4 h-4 rounded border-blueprint-accent/40 text-blueprint-accent focus:ring-blueprint-accent/50 bg-blueprint-900/60'
                    />
                    <span className='text-sm text-blueprint-text/80 group-hover:text-blueprint-text transition-colors'>
                      {page.label}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className={LABEL_CLS}>Content level</label>
              <div className='space-y-2'>
                {[
                  { value: 'structure-only', label: 'Structure only' },
                  { value: 'starter-headings', label: 'Starter headings' },
                  { value: 'full-starter-copy', label: 'Full starter copy' },
                ].map(opt => (
                  <label key={opt.value} className='flex items-center gap-2 cursor-pointer group'>
                    <input
                      type='radio'
                      name='contentLevel'
                      value={opt.value}
                      checked={contentLevel === opt.value}
                      onChange={e => setContentLevel(e.target.value)}
                      className='w-4 h-4 text-blueprint-accent border-blueprint-accent/40 focus:ring-blueprint-accent/50'
                    />
                    <span className='text-sm text-blueprint-text/80 group-hover:text-blueprint-text transition-colors'>
                      {opt.label}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <button
              onClick={handleGenerate}
              disabled={!canGenerate}
              className='w-full bg-blueprint-accent text-blueprint-950 font-semibold px-6 py-3 rounded-xl hover:bg-blueprint-accent/90 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-blueprint-accent/20'
            >
              {isGenerating ? (
                <>
                  <Loader2 className='w-5 h-5 animate-spin' />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className='w-5 h-5' />
                  Generate Starter Site
                </>
              )}
            </button>
          </div>

          <div className='bg-blueprint-800/40 border border-blueprint-accent/20 rounded-2xl p-8 min-h-96'>
            {isGenerating && (
              <div className='h-full flex items-center justify-center'>
                <div className='text-center space-y-4'>
                  <Loader2 className='w-10 h-10 text-blueprint-accent animate-spin mx-auto' />
                  <p className='text-blueprint-text/50 text-sm'>Building your site structure...</p>
                </div>
              </div>
            )}

            {!isGenerating && !generatedSite && (
              <div className='h-full flex items-center justify-center text-blueprint-text/25'>
                <div className='text-center space-y-3'>
                  <LayoutTemplate className='w-14 h-14 mx-auto' />
                  <p className='text-sm'>Your site preview will appear here</p>
                </div>
              </div>
            )}

            {!isGenerating && generatedSite && (
              <div className='space-y-6'>
                <div>
                  <p className='text-xs font-semibold text-blueprint-accent/60 uppercase tracking-widest mb-1'>
                    Starter Site Preview
                  </p>
                  <h2 className='text-2xl font-bold text-blueprint-text'>
                    {generatedSite.siteTitle}
                  </h2>
                </div>

                <div>
                  <h3 className='text-sm font-semibold text-blueprint-text/70 uppercase tracking-wide mb-3'>Pages</h3>
                  <div className='space-y-2'>
                    {generatedSite.pages.map((page, i) => (
                      <div key={i} className='bg-blueprint-900/40 border border-blueprint-accent/10 rounded-xl px-4 py-3'>
                        <p className='font-medium text-blueprint-text text-sm mb-1.5'>{page.title}</p>
                        <div className='flex flex-wrap gap-1.5'>
                          {page.sections.map((sec, j) => (
                            <span key={j} className='text-xs px-2 py-0.5 rounded-full bg-blueprint-accent/10 text-blueprint-accent/80'>
                              {sec}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className='text-sm font-semibold text-blueprint-text/70 uppercase tracking-wide mb-3'>Navigation</h3>
                  <div className='flex flex-wrap gap-2'>
                    {generatedSite.menu.map((item, i) => (
                      <React.Fragment key={i}>
                        <span className='text-sm text-blueprint-text/80'>{item}</span>
                        {i < generatedSite.menu.length - 1 && (
                          <span className='text-blueprint-accent/30 text-sm'>|</span>
                        )}
                      </React.Fragment>
                    ))}
                  </div>
                </div>

                <button
                  onClick={handleSendToPlayground}
                  className='w-full bg-green-600/90 hover:bg-green-600 text-white font-semibold px-6 py-3 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-green-900/20'
                >
                  <Send className='w-4 h-4' />
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
