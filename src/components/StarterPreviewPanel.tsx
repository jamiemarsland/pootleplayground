import React, { useState } from 'react';
import { ChevronUp, ChevronDown, Send, LayoutTemplate } from 'lucide-react';

export interface Section {
  id: string;
  name: string;
  h2?: string;
  h3?: string;
  body?: string;
}

export interface Page {
  id: string;
  title: string;
  sections: Section[];
}

export interface GeneratedSite {
  siteTitle: string;
  pages: Page[];
  menu: string[];
  plugins: string[];
  theme: string;
}

interface SectionContentData {
  h2: string;
  h3?: string;
  body?: string;
}

const SECTION_CONTENT: Record<string, SectionContentData> = {
  'Hero':             { h2: 'Welcome to [SITE]',            h3: 'Your one-line tagline here.',                  body: '[SITE] is here to help. Whether you\'re just starting out or looking to grow, we\'re with you every step of the way.' },
  'Features':         { h2: 'Why Choose Us',                 h3: '3–4 key benefits or features',                 body: 'We combine expertise, passion, and a genuine commitment to results. Here are a few reasons our clients love working with us.' },
  'Testimonials':     { h2: 'What Our Clients Say',          h3: 'Real words from real people',                  body: 'Don\'t just take our word for it. Here\'s what some of our happy clients have to say.' },
  'CTA':              { h2: 'Ready to Get Started?',         h3: 'Take the first step today.',                   body: 'Book a free consultation or drop us a message — we\'ll respond within one business day.' },
  'Story':            { h2: 'Our Story',                     h3: 'How it all began',                             body: '[SITE] was founded with a simple idea: to make things better for the people we serve. Since day one, that mission has guided everything we do.' },
  'Team':             { h2: 'Meet the Team',                 h3: 'The people behind the work',                   body: 'Our team brings together years of experience and a shared passion for what we do. Friendly, approachable, and always happy to chat.' },
  'Values':           { h2: 'What We Stand For',             h3: 'Our core principles',                          body: 'We believe in honesty, quality, and putting our clients first. These aren\'t just words on a wall — they shape every decision we make.' },
  'Services Grid':    { h2: 'What We Offer',                 h3: 'Our services at a glance',                     body: 'From initial consultation to final delivery, our services are designed to meet your needs and exceed your expectations.' },
  'Process':          { h2: 'How It Works',                  h3: 'Simple steps to get started',                  body: 'We\'ve made it easy to get started. Here\'s what you can expect when you work with us.' },
  'Pricing':          { h2: 'Simple, Transparent Pricing',   h3: 'No hidden fees, ever',                         body: 'We believe great work should be accessible. Our pricing is clear, fair, and designed to give you the best return on your investment.' },
  'Contact Form':     { h2: 'Get in Touch',                  h3: 'We\'d love to hear from you',                  body: 'Fill in the form and we\'ll get back to you shortly. Or drop us a line directly — we\'re always happy to talk.' },
  'Map':              { h2: 'Find Us',                       h3: 'Visit us in person'                                                                                                                                                             },
  'Info':             { h2: 'Contact Information',           h3: 'Email · Phone · Address'                                                                                                                                                       },
  'Blog Grid':        { h2: 'Latest Posts',                  h3: 'News, tips, and updates from the team',        body: 'We write about what we know so you can learn from our experience. New posts every week.' },
  'Categories':       { h2: 'Browse by Category',            h3: 'Find exactly what you\'re looking for'                                                                                                                                         },
  'Testimonials Grid':{ h2: 'Client Success Stories',        h3: 'See what people are saying',                   body: 'Real results. Real clients. Browse our collection of reviews and case studies below.' },
  'Stats':            { h2: 'By the Numbers',                h3: 'Our results speak for themselves'                                                                                                                                              },
  'Pricing Table':    { h2: 'Choose Your Plan',              h3: 'Flexible options for every need',               body: 'All plans include our core features. Upgrade or downgrade at any time — no contracts, no fuss.' },
  'FAQ':              { h2: 'Frequently Asked Questions',    h3: 'Everything you need to know',                   body: 'Still have a question? Browse below or get in touch and we\'ll be happy to help.' },
  'FAQ List':         { h2: 'Got Questions?',                h3: 'We have answers'                                                                                                                                                               },
  'Content Section':  { h2: 'Section Heading',               h3: 'Subheading goes here',                          body: 'Add your content here. Describe what this section covers and how it helps your visitors.' },
};

function SectionContent({ section, siteName, contentLevel }: { section: Section; siteName: string; contentLevel: string }) {
  if (contentLevel === 'structure-only') return null;

  const fallback = SECTION_CONTENT[section.name] ?? { h2: section.name, h3: 'Add content here' };
  const h2 = (section.h2 ?? fallback.h2).replace('[SITE]', siteName || 'Your Site');
  const h3 = section.h3 ?? fallback.h3;
  const body = section.body ?? fallback.body;

  return (
    <div className='mt-1.5 space-y-0.5'>
      <p className='text-sm font-semibold text-blueprint-text/90'>{h2}</p>
      {h3 && <p className='text-xs text-blueprint-text/50'>{h3}</p>}
      {contentLevel === 'full-starter-copy' && body && (
        <p className='text-xs text-blueprint-text/40 leading-relaxed pt-0.5'>
          {body.replace('[SITE]', siteName || 'Your Site')}
        </p>
      )}
    </div>
  );
}

interface Props {
  site: GeneratedSite;
  contentLevel: string;
  onChange: (site: GeneratedSite) => void;
  onSendToPlayground: () => void;
}

export function StarterPreviewPanel({ site, contentLevel, onChange, onSendToPlayground }: Props) {
  const [activeTab, setActiveTab] = useState<'pages' | 'extras'>('pages');

  const moveSection = (pageId: string, sectionId: string, dir: -1 | 1) => {
    onChange({
      ...site,
      pages: site.pages.map(page => {
        if (page.id !== pageId) return page;
        const idx = page.sections.findIndex(s => s.id === sectionId);
        if (idx === -1) return page;
        const next = idx + dir;
        if (next < 0 || next >= page.sections.length) return page;
        const updated = [...page.sections];
        [updated[idx], updated[next]] = [updated[next], updated[idx]];
        return { ...page, sections: updated };
      }),
    });
  };

  return (
    <div className='bg-blueprint-800/40 border border-blueprint-accent/20 rounded-2xl overflow-hidden flex flex-col'>
      <div className='flex border-b border-blueprint-accent/15'>
        {(['pages', 'extras'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-3 text-sm font-medium transition-colors ${
              activeTab === tab
                ? 'text-blueprint-accent border-b-2 border-blueprint-accent bg-blueprint-accent/5'
                : 'text-blueprint-text/40 hover:text-blueprint-text/70'
            }`}
          >
            {tab === 'pages' ? 'Pages & Sections' : 'Plugins & Theme'}
          </button>
        ))}
      </div>

      <div className='flex-1 overflow-y-auto' style={{ maxHeight: '620px' }}>
        {activeTab === 'pages' && (
          <div className='p-6 space-y-4'>
            <div>
              <p className='text-xs font-semibold text-blueprint-accent/50 uppercase tracking-widest mb-1'>
                Starter Site Preview
              </p>
              <h2 className='text-xl font-bold text-blueprint-text'>{site.siteTitle}</h2>
            </div>

            <div className='flex flex-wrap gap-x-2 gap-y-1 pb-3 border-b border-blueprint-accent/10'>
              {site.menu.map((item, i) => (
                <React.Fragment key={i}>
                  <span className='text-sm text-blueprint-text/60'>{item}</span>
                  {i < site.menu.length - 1 && (
                    <span className='text-blueprint-accent/25 text-sm select-none'>|</span>
                  )}
                </React.Fragment>
              ))}
            </div>

            {site.pages.map(page => (
              <div
                key={page.id}
                className='bg-blueprint-900/40 border border-blueprint-accent/10 rounded-xl overflow-hidden'
              >
                <div className='px-4 py-2.5 bg-blueprint-accent/5 border-b border-blueprint-accent/10'>
                  <p className='font-semibold text-blueprint-text text-sm'>{page.title}</p>
                </div>
                <div className='divide-y divide-blueprint-accent/5'>
                  {page.sections.map((sec, idx) => (
                    <div key={sec.id} className='flex gap-3 px-4 py-3'>
                      <div className='flex flex-col gap-0.5 pt-1 shrink-0'>
                        <button
                          onClick={() => moveSection(page.id, sec.id, -1)}
                          disabled={idx === 0}
                          className='p-0.5 text-blueprint-accent/35 hover:text-blueprint-accent disabled:opacity-20 disabled:cursor-not-allowed rounded transition-colors'
                          title='Move up'
                        >
                          <ChevronUp className='w-3.5 h-3.5' />
                        </button>
                        <button
                          onClick={() => moveSection(page.id, sec.id, 1)}
                          disabled={idx === page.sections.length - 1}
                          className='p-0.5 text-blueprint-accent/35 hover:text-blueprint-accent disabled:opacity-20 disabled:cursor-not-allowed rounded transition-colors'
                          title='Move down'
                        >
                          <ChevronDown className='w-3.5 h-3.5' />
                        </button>
                      </div>
                      <div className='flex-1 min-w-0'>
                        <span className='inline-flex text-xs font-semibold px-2 py-0.5 rounded-full bg-blueprint-accent/10 text-blueprint-accent/80'>
                          {sec.name}
                        </span>
                        <SectionContent
                          section={sec}
                          siteName={site.siteTitle}
                          contentLevel={contentLevel}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'extras' && (
          <div className='p-6 space-y-6'>
            <div>
              <h3 className='text-sm font-semibold text-blueprint-text/60 uppercase tracking-wide mb-3'>Theme</h3>
              {site.theme ? (
                <div className='bg-blueprint-900/40 border border-blueprint-accent/15 rounded-xl px-4 py-3 flex items-center gap-3'>
                  <div className='w-2 h-2 rounded-full bg-blueprint-accent shrink-0' />
                  <p className='font-medium text-blueprint-text'>{site.theme}</p>
                </div>
              ) : (
                <p className='text-sm text-blueprint-text/25 italic'>No theme selected yet</p>
              )}
            </div>

            <div>
              <h3 className='text-sm font-semibold text-blueprint-text/60 uppercase tracking-wide mb-3'>
                Plugins
                {site.plugins.length > 0 && (
                  <span className='ml-2 text-xs font-normal text-blueprint-accent/60'>
                    ({site.plugins.length} selected)
                  </span>
                )}
              </h3>
              {site.plugins.length > 0 ? (
                <div className='flex flex-wrap gap-2'>
                  {site.plugins.map(p => (
                    <span
                      key={p}
                      className='text-xs px-3 py-1.5 rounded-lg bg-blueprint-900/50 border border-blueprint-accent/10 text-blueprint-text/70'
                    >
                      {p}
                    </span>
                  ))}
                </div>
              ) : (
                <p className='text-sm text-blueprint-text/25 italic'>No plugins selected yet</p>
              )}
            </div>
          </div>
        )}
      </div>

      <div className='p-4 border-t border-blueprint-accent/10'>
        <button
          onClick={onSendToPlayground}
          className='w-full bg-green-600/90 hover:bg-green-600 text-white font-semibold px-6 py-3 rounded-xl transition-all flex items-center justify-center gap-2'
        >
          <Send className='w-4 h-4' />
          Send to Playground
        </button>
      </div>
    </div>
  );
}

export function EmptyPreview() {
  return (
    <div className='bg-blueprint-800/40 border border-blueprint-accent/20 rounded-2xl p-8 flex items-center justify-center min-h-96'>
      <div className='text-center space-y-3 text-blueprint-text/20'>
        <LayoutTemplate className='w-14 h-14 mx-auto' />
        <p className='text-sm'>Your site preview will appear here</p>
      </div>
    </div>
  );
}
