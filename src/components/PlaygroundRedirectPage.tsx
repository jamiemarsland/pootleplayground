import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Loader2, AlertTriangle, ExternalLink, ArrowLeft } from 'lucide-react';
import { supabase } from '../lib/supabase';

type RedirectState = 'loading' | 'redirecting' | 'not_found' | 'error';

const wpFont = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen-Sans, Ubuntu, Cantarell, "Helvetica Neue", sans-serif';

export function PlaygroundRedirectPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [state, setState] = useState<RedirectState>('loading');
  const [targetUrl, setTargetUrl] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    if (!slug) { setState('not_found'); return; }

    (async () => {
      try {
        const { data, error } = await supabase
          .from('shared_playgrounds')
          .select('id, slug, title, description, full_url, blueprint_json, view_count')
          .eq('slug', slug)
          .maybeSingle();

        if (error) throw error;
        if (!data) { setState('not_found'); return; }

        setTitle(data.title || 'WordPress Playground');
        setDescription(data.description || '');

        // Increment view count (fire and forget)
        supabase
          .from('shared_playgrounds')
          .update({ view_count: (data.view_count || 0) + 1 })
          .eq('id', data.id)
          .then(() => {});

        let redirectUrl: string;
        if (data.blueprint_json) {
          const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
          const apiUrl = `${supabaseUrl}/functions/v1/blueprint-api/${data.slug}`;
          redirectUrl = `https://playground.wordpress.net/?blueprint-url=${encodeURIComponent(apiUrl)}`;
        } else {
          redirectUrl = data.full_url;
        }

        setTargetUrl(redirectUrl);
        setState('redirecting');
        setTimeout(() => { window.location.href = redirectUrl; }, 1400);
      } catch (err) {
        console.error('Redirect error:', err);
        setState('error');
      }
    })();
  }, [slug]);

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#f0f0f1',
        fontFamily: wpFont,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
      }}
    >
      <div style={{ width: '100%', maxWidth: 460 }}>
        {/* Wordmark */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 48,
              height: 48,
              background: '#2271b1',
              borderRadius: 8,
              marginBottom: 12,
            }}
          >
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
            </svg>
          </div>
          <div style={{ fontWeight: 600, fontSize: 15, color: '#1e1e1e' }}>Pootle Playground</div>
        </div>

        <div
          style={{
            background: '#fff',
            border: '1px solid #c3c4c7',
            borderRadius: 3,
            boxShadow: '0 1px 3px rgba(0,0,0,.08)',
            overflow: 'hidden',
          }}
        >
          {state === 'loading' && (
            <div style={{ padding: '40px 32px', textAlign: 'center' }}>
              <Loader2
                className="animate-spin"
                style={{ width: 36, height: 36, color: '#2271b1', margin: '0 auto 16px' }}
              />
              <p style={{ fontSize: 14, color: '#50575e', margin: 0 }}>Looking up your playground link…</p>
            </div>
          )}

          {state === 'redirecting' && (
            <div style={{ padding: '40px 32px', textAlign: 'center' }}>
              <div
                style={{
                  width: 56,
                  height: 56,
                  background: '#f0f6fc',
                  border: '1px solid #b8d3f4',
                  borderRadius: 8,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 20px',
                }}
              >
                <ExternalLink style={{ width: 24, height: 24, color: '#2271b1' }} />
              </div>
              <h2 style={{ fontSize: 18, fontWeight: 600, color: '#1e1e1e', margin: '0 0 6px' }}>
                {title}
              </h2>
              {description && (
                <p style={{ fontSize: 13, color: '#757575', margin: '0 0 20px', lineHeight: 1.5 }}>
                  {description}
                </p>
              )}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, color: '#50575e', fontSize: 13, marginBottom: 24 }}>
                <Loader2 className="animate-spin" style={{ width: 14, height: 14, color: '#2271b1' }} />
                Launching WordPress Playground…
              </div>
              <a
                href={targetUrl}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '8px 20px',
                  background: '#2271b1',
                  color: '#fff',
                  borderRadius: 999,
                  fontSize: 13,
                  fontWeight: 500,
                  textDecoration: 'none',
                  transition: 'background 0.15s',
                }}
                onMouseOver={e => (e.currentTarget.style.background = '#135e96')}
                onMouseOut={e => (e.currentTarget.style.background = '#2271b1')}
              >
                <ExternalLink style={{ width: 13, height: 13 }} />
                Open now
              </a>
            </div>
          )}

          {state === 'not_found' && (
            <div style={{ padding: '40px 32px', textAlign: 'center' }}>
              <div
                style={{
                  width: 56,
                  height: 56,
                  background: '#fcf0f1',
                  border: '1px solid #f0b8ba',
                  borderRadius: 8,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 20px',
                }}
              >
                <AlertTriangle style={{ width: 24, height: 24, color: '#d63638' }} />
              </div>
              <h2 style={{ fontSize: 18, fontWeight: 600, color: '#1e1e1e', margin: '0 0 8px' }}>
                Link not found
              </h2>
              <p style={{ fontSize: 13, color: '#757575', margin: '0 0 24px', lineHeight: 1.6 }}>
                The short link{' '}
                <code
                  style={{
                    fontFamily: 'monospace',
                    background: '#f6f7f7',
                    border: '1px solid #dcdcde',
                    padding: '1px 5px',
                    borderRadius: 2,
                    color: '#1e1e1e',
                  }}
                >
                  /p/{slug}
                </code>{' '}
                doesn't exist or may have been removed.
              </p>
              <button
                onClick={() => navigate('/')}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '8px 16px',
                  background: '#fff',
                  color: '#2271b1',
                  border: '1px solid #2271b1',
                  borderRadius: 999,
                  fontSize: 13,
                  fontWeight: 500,
                  cursor: 'pointer',
                  transition: 'background 0.15s',
                }}
                onMouseOver={e => (e.currentTarget.style.background = '#f0f6fc')}
                onMouseOut={e => (e.currentTarget.style.background = '#fff')}
              >
                <ArrowLeft style={{ width: 13, height: 13 }} />
                Back to Pootle Playground
              </button>
            </div>
          )}

          {state === 'error' && (
            <div style={{ padding: '40px 32px', textAlign: 'center' }}>
              <div
                style={{
                  width: 56,
                  height: 56,
                  background: '#fef9ec',
                  border: '1px solid #f5d657',
                  borderRadius: 8,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 20px',
                }}
              >
                <AlertTriangle style={{ width: 24, height: 24, color: '#996800' }} />
              </div>
              <h2 style={{ fontSize: 18, fontWeight: 600, color: '#1e1e1e', margin: '0 0 8px' }}>
                Something went wrong
              </h2>
              <p style={{ fontSize: 13, color: '#757575', margin: '0 0 24px', lineHeight: 1.6 }}>
                We couldn't load this Playground link. Please try again.
              </p>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
                <button
                  onClick={() => window.location.reload()}
                  style={{
                    padding: '8px 16px',
                    background: '#2271b1',
                    color: '#fff',
                    border: '1px solid transparent',
                    borderRadius: 999,
                    fontSize: 13,
                    fontWeight: 500,
                    cursor: 'pointer',
                    transition: 'background 0.15s',
                  }}
                  onMouseOver={e => (e.currentTarget.style.background = '#135e96')}
                  onMouseOut={e => (e.currentTarget.style.background = '#2271b1')}
                >
                  Try again
                </button>
                <button
                  onClick={() => navigate('/')}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '8px 16px',
                    background: '#fff',
                    color: '#2271b1',
                    border: '1px solid #2271b1',
                    borderRadius: 999,
                    fontSize: 13,
                    fontWeight: 500,
                    cursor: 'pointer',
                    transition: 'background 0.15s',
                  }}
                  onMouseOver={e => (e.currentTarget.style.background = '#f0f6fc')}
                  onMouseOut={e => (e.currentTarget.style.background = '#fff')}
                >
                  <ArrowLeft style={{ width: 13, height: 13 }} />
                  Home
                </button>
              </div>
            </div>
          )}
        </div>

        <p style={{ textAlign: 'center', fontSize: 11, color: '#a7aaad', marginTop: 20 }}>
          Powered by Pootle Playground &amp; WordPress Playground
        </p>
      </div>
    </div>
  );
}
