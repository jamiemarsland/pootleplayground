import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Sparkles, Loader2, ChevronDown, ChevronUp } from 'lucide-react';
import { Footer } from './Footer';
import {
  StarterPreviewPanel,
  EmptyPreview,
  GeneratedSite,
} from './StarterPreviewPanel';

const PAGE_OPTIONS = [
  { id: 'home',         label: 'Home' },
  { id: 'about',        label: 'About' },
  { id: 'services',     label: 'Services' },
  { id: 'blog',         label: 'Blog' },
  { id: 'contact',      label: 'Contact' },
  { id: 'testimonials', label: 'Testimonials' },
  { id: 'pricing',      label: 'Pricing' },
  { id: 'faq',          label: 'FAQ' },
];

const SECTIONS_BY_PAGE: Record<string, string[]> = {
  home:         ['Hero', 'Features', 'Testimonials', 'CTA'],
  about:        ['Story', 'Team', 'Values'],
  services:     ['Services Grid', 'Process', 'Pricing'],
  contact:      ['Contact Form', 'Map', 'Info'],
  blog:         ['Blog Grid', 'Categories'],
  testimonials: ['Testimonials Grid', 'Stats'],
  pricing:      ['Pricing Table', 'FAQ'],
  faq:          ['FAQ List'],
};

const PLUGIN_OPTIONS = [
  'Yoast SEO',
  'WooCommerce',
  'Contact Form 7',
  'Elementor',
  'WPForms Lite',
  'Wordfence Security',
  'Akismet Anti-Spam',
  'Advanced Custom Fields',
  'Smush',
  'UpdraftPlus',
  'WP Rocket',
  'MonsterInsights',
  'WP Super Cache',
  'Gravity Forms',
  'WPML',
];

const PLUGIN_SLUGS: Record<string, string | null> = {
  'Yoast SEO':              'wordpress-seo',
  'WooCommerce':            'woocommerce',
  'Contact Form 7':         'contact-form-7',
  'Elementor':              'elementor',
  'WPForms Lite':           'wpforms-lite',
  'Wordfence Security':     'wordfence',
  'Akismet Anti-Spam':      'akismet',
  'Advanced Custom Fields': 'advanced-custom-fields',
  'Smush':                  'wp-smushit',
  'UpdraftPlus':            'updraftplus',
  'WP Rocket':              null,
  'MonsterInsights':        'google-analytics-for-wordpress',
  'WP Super Cache':         'wp-super-cache',
  'Gravity Forms':          null,
  'WPML':                   null,
};

const THEME_OPTIONS = [
  { id: 'astra',            label: 'Astra',            desc: 'Lightweight & fast' },
  { id: 'generatepress',    label: 'GeneratePress',    desc: 'Performance focused' },
  { id: 'kadence',          label: 'Kadence',          desc: 'Full site editing' },
  { id: 'blocksy',          label: 'Blocksy',          desc: 'Modern & flexible' },
  { id: 'oceanwp',          label: 'OceanWP',          desc: 'Multipurpose' },
  { id: 'hello-elementor',  label: 'Hello Elementor',  desc: 'Minimal base theme' },
  { id: 'divi',             label: 'Divi',             desc: 'Builder included' },
  { id: 'sydney',           label: 'Sydney',           desc: 'Business ready' },
];

function buildMockResponse(
  siteName: string,
  selectedPages: string[],
  selectedPlugins: string[],
  selectedTheme: string,
): GeneratedSite {
  return {
    siteTitle: siteName || 'My Website',
    pages: selectedPages.map((id, pi) => ({
      id: `page-${pi}`,
      title: PAGE_OPTIONS.find(p => p.id === id)?.label ?? id,
      sections: (SECTIONS_BY_PAGE[id] ?? ['Content Section']).map((name, si) => ({
        id: `${id}-sec-${si}`,
        name,
      })),
    })),
    menu: selectedPages.map(id => PAGE_OPTIONS.find(p => p.id === id)?.label ?? id),
    plugins: selectedPlugins,
    theme: selectedTheme,
  };
}

const INPUT_CLS = 'w-full px-4 py-2.5 border border-blueprint-accent/30 rounded-lg bg-blueprint-900/60 text-blueprint-text placeholder:text-blueprint-text/30 focus:outline-none focus:ring-2 focus:ring-blueprint-accent/60 transition';
const LABEL_CLS = 'block text-sm font-medium text-blueprint-text/80 mb-2';

function CollapsibleSection({ title, children }: { title: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <div className='border border-blueprint-accent/15 rounded-xl overflow-hidden'>
      <button
        type='button'
        onClick={() => setOpen(v => !v)}
        className='w-full flex items-center justify-between px-4 py-3 text-sm font-medium text-blueprint-text/80 hover:text-blueprint-text hover:bg-blueprint-accent/5 transition-colors'
      >
        {title}
        {open ? <ChevronUp className='w-4 h-4 text-blueprint-accent/50' /> : <ChevronDown className='w-4 h-4 text-blueprint-accent/50' />}
      </button>
      {open && <div className='px-4 pb-4 pt-1'>{children}</div>}
    </div>
  );
}

export function AiStarterPage() {
  const navigate = useNavigate();
  const [siteType, setSiteType]           = useState('business');
  const [siteName, setSiteName]           = useState('');
  const [description, setDescription]     = useState('');
  const [contentLevel, setContentLevel]   = useState('starter-headings');
  const [selectedPages, setSelectedPages] = useState<string[]>(['home', 'about', 'contact']);
  const [selectedPlugins, setSelectedPlugins] = useState<string[]>([]);
  const [selectedTheme, setSelectedTheme] = useState('');
  const [isGenerating, setIsGenerating]   = useState(false);
  const [generatedSite, setGeneratedSite] = useState<GeneratedSite | null>(null);
  const [error, setError]                 = useState<string | null>(null);

  const togglePage   = (id: string) => setSelectedPages(prev => prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]);
  const togglePlugin = (p: string)  => setSelectedPlugins(prev => prev.includes(p) ? prev.filter(x => x !== p) : [...prev, p]);

  const canGenerate = !isGenerating && siteName.trim().length > 0 && description.trim().length > 0 && selectedPages.length > 0;

  const handleGenerate = async () => {
    setIsGenerating(true);
    setGeneratedSite(null);
    setError(null);
    try {
      const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-starter-site`;
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ siteType, siteName, description, selectedPages, contentLevel, selectedPlugins, selectedTheme }),
      });
      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Failed to generate site');
      }
      const data: GeneratedSite = await response.json();
      setGeneratedSite(data);
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again.');
      setGeneratedSite(buildMockResponse(siteName, selectedPages, selectedPlugins, selectedTheme));
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSendToPlayground = () => {
    if (!generatedSite) return;

    const steps: any[] = [];

    steps.push({ step: 'setSiteOption', name: 'blogname', value: generatedSite.siteTitle });
    steps.push({ step: 'setSiteOption', name: 'permalink_structure', value: '/%postname%/' });

    if (selectedTheme) {
      steps.push({
        step: 'installTheme',
        themeZipFile: { resource: 'wordpress.org/themes', slug: selectedTheme },
      });
    }

    generatedSite.plugins.forEach((name) => {
      const slug = PLUGIN_SLUGS[name];
      if (!slug) return;
      steps.push({
        step: 'installPlugin',
        pluginZipFile: { resource: 'wordpress.org/plugins', slug },
      });
    });

    const menuItems: any[] = [];

    generatedSite.pages.forEach((page, pi) => {
      const slug = page.title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
      const content = page.sections.map(s => `<!-- wp:heading --><h2>${s.h2 ?? s.name}</h2><!-- /wp:heading -->${s.h3 ? `<!-- wp:paragraph --><p>${s.h3}</p><!-- /wp:paragraph -->` : ''}${s.body ? `<!-- wp:paragraph --><p>${s.body}</p><!-- /wp:paragraph -->` : ''}`).join('\n');

      if (pi === 0) {
        steps.push({
          step: 'runPHP',
          code: `<?php require '/wordpress/wp-load.php'; $id = wp_insert_post(['post_title'=>${JSON.stringify(page.title)},'post_name'=>${JSON.stringify(slug)},'post_content'=>${JSON.stringify(content)},'post_status'=>'publish','post_type'=>'page']); update_option('page_on_front',$id); update_option('show_on_front','page'); ?>`,
        });
      } else {
        steps.push({
          step: 'runPHP',
          code: `<?php require '/wordpress/wp-load.php'; wp_insert_post(['post_title'=>${JSON.stringify(page.title)},'post_name'=>${JSON.stringify(slug)},'post_content'=>${JSON.stringify(content)},'post_status'=>'publish','post_type'=>'page']); ?>`,
        });
      }

      menuItems.push({ type: 'custom', title: page.title, url: `/${slug}/` });
    });

    steps.push({
      step: 'runPHP',
      code: `<?php require '/wordpress/wp-load.php'; $menu_id = wp_create_nav_menu('Main Menu'); ${menuItems.map((item) => `wp_update_nav_menu_item($menu_id, 0, ['menu-item-title'=>${JSON.stringify(item.title)},'menu-item-url'=>${JSON.stringify(item.url)},'menu-item-status'=>'publish']);`).join(' ')} $locations = get_theme_mod('nav_menu_locations'); $locations['primary'] = $menu_id; set_theme_mod('nav_menu_locations', $locations); ?>`,
    });

    const blueprint = {
      landingPage: '/',
      preferredVersions: { php: '8.2', wp: 'latest' },
      phpExtensionBundles: ['kitchen-sink'],
      steps,
    };

    const json = JSON.stringify(blueprint);
    const b64 = btoa(Array.from(new TextEncoder().encode(json)).map(b => String.fromCharCode(b)).join(''));
    window.open(`https://playground.wordpress.net/#${b64}`, '_blank');
  };

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
          <p className='text-blueprint-text/55 text-base max-w-lg mx-auto'>
            Describe the website you want and we'll generate starter pages, navigation, and content structure.
          </p>
        </div>

        <div className='grid lg:grid-cols-2 gap-8 items-start'>
          <div className='bg-blueprint-800/40 border border-blueprint-accent/20 rounded-2xl p-8 space-y-6'>
            <h2 className='text-lg font-semibold text-blueprint-text'>Site Details</h2>

            <div>
              <label className={LABEL_CLS}>Site Type</label>
              <select value={siteType} onChange={e => setSiteType(e.target.value)} className={INPUT_CLS}>
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
                    <span className='text-sm text-blueprint-text/75 group-hover:text-blueprint-text transition-colors'>
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
                  { value: 'structure-only',   label: 'Structure only' },
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
                    <span className='text-sm text-blueprint-text/75 group-hover:text-blueprint-text transition-colors'>
                      {opt.label}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <CollapsibleSection title='Theme'>
              <div className='grid grid-cols-2 gap-2 pt-1'>
                {THEME_OPTIONS.map(t => (
                  <button
                    key={t.id}
                    type='button'
                    onClick={() => setSelectedTheme(prev => prev === t.label ? '' : t.label)}
                    className={`text-left px-3 py-2.5 rounded-lg border transition-all ${
                      selectedTheme === t.label
                        ? 'border-blueprint-accent bg-blueprint-accent/10 text-blueprint-text'
                        : 'border-blueprint-accent/15 hover:border-blueprint-accent/35 text-blueprint-text/60 hover:text-blueprint-text/90'
                    }`}
                  >
                    <p className='text-xs font-semibold'>{t.label}</p>
                    <p className='text-xs opacity-60 mt-0.5'>{t.desc}</p>
                  </button>
                ))}
              </div>
            </CollapsibleSection>

            <CollapsibleSection title={`Plugins${selectedPlugins.length > 0 ? ` (${selectedPlugins.length})` : ''}`}>
              <div className='space-y-2 pt-1'>
                {PLUGIN_OPTIONS.map(p => (
                  <label key={p} className='flex items-center gap-2 cursor-pointer group'>
                    <input
                      type='checkbox'
                      checked={selectedPlugins.includes(p)}
                      onChange={() => togglePlugin(p)}
                      className='w-4 h-4 rounded border-blueprint-accent/40 text-blueprint-accent focus:ring-blueprint-accent/50 bg-blueprint-900/60'
                    />
                    <span className='text-sm text-blueprint-text/70 group-hover:text-blueprint-text transition-colors'>{p}</span>
                  </label>
                ))}
              </div>
            </CollapsibleSection>

            {error && (
              <div className='rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400'>
                {error} A fallback structure has been used.
              </div>
            )}

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

          {isGenerating ? (
            <div className='bg-blueprint-800/40 border border-blueprint-accent/20 rounded-2xl p-8 flex items-center justify-center min-h-96'>
              <div className='text-center space-y-4'>
                <Loader2 className='w-10 h-10 text-blueprint-accent animate-spin mx-auto' />
                <p className='text-blueprint-text/45 text-sm'>Building your site structure...</p>
              </div>
            </div>
          ) : generatedSite ? (
            <StarterPreviewPanel
              site={generatedSite}
              contentLevel={contentLevel}
              onChange={setGeneratedSite}
              onSendToPlayground={handleSendToPlayground}
            />
          ) : (
            <EmptyPreview />
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}
