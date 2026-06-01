import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Loader2, AlertCircle, ArrowLeft, Zap } from 'lucide-react';
import { Footer } from './Footer';
import { generateBlueprint } from '../utils/blueprintGenerator';

const WP_FONT = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen-Sans, Ubuntu, Cantarell, "Helvetica Neue", sans-serif';

export function AiGeneratorPage() {
  const navigate = useNavigate();
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const examplePrompts = [
    'Create a simple blog with 5 posts about technology',
    'Build a portfolio site with an About page, Projects page, and Contact page',
    'Make a business website with homepage, services, and contact form',
    'Create an online magazine with multiple categories and 10 articles',
    'Build a restaurant website with menu, gallery, and reservation info',
  ];

  const unicodeSafeBase64Encode = (str: string): string => {
    const utf8Bytes = new TextEncoder().encode(str);
    const binaryString = Array.from(utf8Bytes).map(byte => String.fromCharCode(byte)).join('');
    return btoa(binaryString);
  };

  const createPlaygroundUrl = (blueprintData: any) => {
    const nativeBlueprint = generateBlueprint(
      blueprintData.steps,
      blueprintData.blueprintTitle || 'My WordPress Site',
      blueprintData.landingPageType || 'wp-admin',
      blueprintData.customLandingUrl
    );
    return `https://playground.wordpress.net/#${unicodeSafeBase64Encode(JSON.stringify(nativeBlueprint))}`;
  };

  const handleSubmit = async () => {
    if (!prompt.trim()) { setError('Please enter a prompt'); return; }
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-blueprint`, {
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
      if (!blueprintData?.steps || !Array.isArray(blueprintData.steps)) throw new Error('Invalid blueprint data received from AI');
      if (blueprintData.steps.length === 0) throw new Error('AI generated an empty blueprint. Please try a more detailed prompt.');
      window.open(createPlaygroundUrl(blueprintData), '_blank');
      setPrompt('');
    } catch (err: any) {
      setError(err.message || 'Failed to generate blueprint. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleSubmit();
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f0f0f1', fontFamily: WP_FONT }}>

      {/* Header */}
      <header style={{ background: '#fff', borderBottom: '1px solid #dcdcde', position: 'sticky', top: 0, zIndex: 50 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 20px', height: 56 }}>
          <button
            onClick={() => navigate('/')}
            style={{
              display: 'flex', alignItems: 'center', gap: 6, padding: '6px 14px',
              background: '#fff', border: '1px solid #c3c4c7', borderRadius: 999,
              fontSize: 13, fontWeight: 500, color: '#1e1e1e', cursor: 'pointer',
              fontFamily: WP_FONT, transition: 'background 0.12s',
            }}
            onMouseOver={e => (e.currentTarget.style.background = '#f0f0f1')}
            onMouseOut={e => (e.currentTarget.style.background = '#fff')}
          >
            <ArrowLeft style={{ width: 13, height: 13 }} />
            Back to Builder
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 32, height: 32, background: '#2271b1', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Zap style={{ width: 16, height: 16, color: '#fff' }} />
            </div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#1e1e1e', lineHeight: 1.2 }}>Pootle Playground</div>
              <div style={{ fontSize: 11, color: '#787c82', lineHeight: 1.2 }}>AI Generator</div>
            </div>
          </div>

          <div style={{ width: 120 }} />
        </div>
      </header>

      {/* Body */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '48px 24px 32px' }}>
        <div style={{ width: '100%', maxWidth: 700, display: 'flex', flexDirection: 'column', gap: 24 }}>

          {/* Hero */}
          <div style={{ textAlign: 'center', paddingBottom: 8 }}>
            <div style={{
              width: 56, height: 56, background: '#2271b1', borderRadius: 10,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 20px',
            }}>
              <Sparkles style={{ width: 26, height: 26, color: '#fff' }} />
            </div>
            <h2 style={{ fontSize: 28, fontWeight: 700, color: '#1e1e1e', margin: '0 0 10px' }}>
              Create Your WordPress Site
            </h2>
            <p style={{ fontSize: 14, color: '#50575e', margin: 0, lineHeight: 1.6 }}>
              Describe what you want to build, and our AI will generate a complete WordPress blueprint for you.
            </p>
          </div>

          {/* Main card */}
          <div style={{ background: '#fff', border: '1px solid #c3c4c7', borderRadius: 3, padding: '20px 20px 16px' }}>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#1e1e1e', marginBottom: 6 }}>
                What would you like to create?
              </label>
              <textarea
                value={prompt}
                onChange={e => setPrompt(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={isLoading}
                rows={7}
                placeholder="E.g., Create a photography portfolio with a gallery, about page, and contact form..."
                style={{
                  width: '100%', padding: '10px 12px', fontSize: 13,
                  border: '1px solid #8c8f94', borderRadius: 2,
                  color: '#1e1e1e', background: '#fff',
                  resize: 'vertical', outline: 'none',
                  fontFamily: WP_FONT, boxSizing: 'border-box',
                  lineHeight: 1.6,
                }}
                onFocus={e => { e.target.style.borderColor = '#2271b1'; e.target.style.boxShadow = '0 0 0 1px #2271b1'; }}
                onBlur={e => { e.target.style.borderColor = '#8c8f94'; e.target.style.boxShadow = 'none'; }}
              />
              <p style={{ fontSize: 11, color: '#787c82', margin: '5px 0 0' }}>
                Press Cmd/Ctrl + Enter to generate
              </p>
            </div>

            {error && (
              <div style={{
                display: 'flex', alignItems: 'flex-start', gap: 10, padding: '10px 12px',
                background: '#fcf0f1', border: '1px solid #f0b8ba', borderRadius: 2, marginBottom: 14,
              }}>
                <AlertCircle style={{ width: 15, height: 15, color: '#d63638', flexShrink: 0, marginTop: 1 }} />
                <div>
                  <p style={{ fontSize: 13, fontWeight: 600, color: '#d63638', margin: '0 0 2px' }}>Error</p>
                  <p style={{ fontSize: 13, color: '#d63638', margin: 0 }}>{error}</p>
                </div>
              </div>
            )}

            <div style={{ borderTop: '1px solid #dcdcde', paddingTop: 14 }}>
              <button
                onClick={handleSubmit}
                disabled={isLoading || !prompt.trim()}
                style={{
                  width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  padding: '10px 20px', fontSize: 14, fontWeight: 600,
                  background: isLoading || !prompt.trim() ? '#a7aaad' : '#2271b1',
                  color: '#fff', border: 'none', borderRadius: 999,
                  cursor: isLoading || !prompt.trim() ? 'not-allowed' : 'pointer',
                  fontFamily: WP_FONT, transition: 'background 0.12s',
                }}
                onMouseOver={e => { if (!isLoading && prompt.trim()) e.currentTarget.style.background = '#135e96'; }}
                onMouseOut={e => { if (!isLoading && prompt.trim()) e.currentTarget.style.background = '#2271b1'; }}
              >
                {isLoading
                  ? <><Loader2 style={{ width: 16, height: 16 }} className="animate-spin" /> Generating your site…</>
                  : <><Sparkles style={{ width: 16, height: 16 }} /> Generate &amp; Launch Site</>}
              </button>
            </div>
          </div>

          {/* Examples */}
          <div>
            <p style={{ fontSize: 11, fontWeight: 600, color: '#787c82', textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 10px', textAlign: 'center' }}>
              Try an example
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              {examplePrompts.map((example, i) => (
                <button
                  key={i}
                  onClick={() => setPrompt(example)}
                  disabled={isLoading}
                  style={{
                    padding: '9px 12px', fontSize: 12, textAlign: 'left',
                    background: '#fff', border: '1px solid #dcdcde', borderRadius: 2,
                    color: '#1e1e1e', cursor: isLoading ? 'not-allowed' : 'pointer',
                    fontFamily: WP_FONT, lineHeight: 1.5, transition: 'border-color 0.12s, background 0.12s',
                  }}
                  onMouseOver={e => { if (!isLoading) { e.currentTarget.style.borderColor = '#2271b1'; e.currentTarget.style.background = '#f0f6fc'; } }}
                  onMouseOut={e => { e.currentTarget.style.borderColor = '#dcdcde'; e.currentTarget.style.background = '#fff'; }}
                >
                  {example}
                </button>
              ))}
            </div>
          </div>

          {/* Tips */}
          <div style={{ background: '#fff', border: '1px solid #dcdcde', borderRadius: 3, padding: '14px 16px' }}>
            <h4 style={{ fontSize: 12, fontWeight: 600, color: '#1e1e1e', margin: '0 0 10px', display: 'flex', alignItems: 'center', gap: 6 }}>
              <Sparkles style={{ width: 13, height: 13, color: '#2271b1' }} />
              Tips for better results
            </h4>
            <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 6 }}>
              {[
                'Be specific about pages, posts, and content you want',
                'Mention any plugins or themes you\'d like installed',
                'Describe the site\'s purpose and target audience',
                'Include details about navigation and structure',
              ].map((tip, i) => (
                <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: 12, color: '#50575e' }}>
                  <span style={{ color: '#2271b1', fontWeight: 700, flexShrink: 0 }}>·</span>
                  {tip}
                </li>
              ))}
            </ul>
          </div>

        </div>
      </div>

      <Footer />
    </div>
  );
}
