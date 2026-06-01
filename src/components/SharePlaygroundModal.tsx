import React, { useState, useEffect } from 'react';
import { X, Share2, Link, Copy, Check, ExternalLink, AlertTriangle, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { getUserId } from '../utils/userManager';

interface SharePlaygroundModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentPlaygroundUrl?: string;
  blueprintJson?: object | null;
}

const WP_FONT = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen-Sans, Ubuntu, Cantarell, "Helvetica Neue", sans-serif';
const WP_BLUE = '#2271b1';
const WP_BLUE_HOVER = '#135e96';
const WP_BORDER = '#c3c4c7';
const WP_BORDER_SUBTLE = '#dcdcde';
const WP_TEXT = '#1e1e1e';
const WP_TEXT_MUTED = '#50575e';
const WP_INPUT_BORDER = '#8c8f94';
const WP_BG = '#f6f7f7';

function generateSlug(length = 6): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  return Array.from({ length }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}

function isValidPlaygroundUrl(url: string): boolean {
  try {
    return new URL(url).hostname === 'playground.wordpress.net';
  } catch {
    return false;
  }
}

export function SharePlaygroundModal({
  isOpen,
  onClose,
  currentPlaygroundUrl,
  blueprintJson,
}: SharePlaygroundModalProps) {
  const [step, setStep] = useState<'form' | 'success'>('form');
  const [url, setUrl] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [shortUrl, setShortUrl] = useState('');
  const [copied, setCopied] = useState(false);
  const [urlWarning, setUrlWarning] = useState('');

  useEffect(() => {
    if (isOpen) {
      setStep('form');
      setUrl(currentPlaygroundUrl || '');
      setTitle('');
      setDescription('');
      setError('');
      setShortUrl('');
      setCopied(false);
      setUrlWarning('');
    }
  }, [isOpen, currentPlaygroundUrl]);

  useEffect(() => {
    if (url && !isValidPlaygroundUrl(url)) {
      setUrlWarning("This doesn't look like a playground.wordpress.net URL. You can still save it.");
    } else {
      setUrlWarning('');
    }
  }, [url]);

  if (!isOpen) return null;

  const handleCreate = async () => {
    if (!url.trim()) { setError('Please enter a Playground URL.'); return; }
    setSaving(true);
    setError('');
    try {
      const userId = getUserId();
      let slug = generateSlug();
      const { data: existing } = await supabase
        .from('shared_playgrounds').select('slug').eq('slug', slug).maybeSingle();
      if (existing) slug = generateSlug(8);

      const record: Record<string, unknown> = {
        slug, title: title.trim(), description: description.trim(),
        full_url: url.trim(), created_by: userId,
      };
      if (blueprintJson) record.blueprint_json = blueprintJson;

      const { error: insertError } = await supabase.from('shared_playgrounds').insert(record);
      if (insertError) throw insertError;

      setShortUrl(`${window.location.origin}/p/${slug}`);
      setStep('success');
    } catch (err) {
      console.error(err);
      setError('Failed to create short link. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleCopy = async () => {
    try { await navigator.clipboard.writeText(shortUrl); setCopied(true); setTimeout(() => setCopied(false), 2000); }
    catch { /* ignore */ }
  };

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '8px 12px', fontSize: 13, fontFamily: WP_FONT,
    border: `1px solid ${WP_INPUT_BORDER}`, borderRadius: 2,
    color: WP_TEXT, background: '#fff', outline: 'none', boxSizing: 'border-box',
  };
  const btnPrimary: React.CSSProperties = {
    padding: '7px 18px', fontSize: 13, fontWeight: 500, background: WP_BLUE,
    color: '#fff', border: `1px solid ${WP_BLUE}`, borderRadius: 999,
    cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6,
    fontFamily: WP_FONT, transition: 'background 0.15s',
  };
  const btnSecondary: React.CSSProperties = {
    padding: '7px 18px', fontSize: 13, fontWeight: 500, background: '#fff',
    color: WP_BLUE, border: `1px solid ${WP_BLUE}`, borderRadius: 999,
    cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6,
    fontFamily: WP_FONT, transition: 'background 0.15s',
  };

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 16, background: 'rgba(0,0,0,0.55)',
      }}
    >
      <div
        style={{
          width: '100%', maxWidth: 520,
          background: '#ffffff',
          border: `1px solid ${WP_BORDER}`,
          borderRadius: 3,
          boxShadow: '0 3px 20px rgba(0,0,0,0.25)',
          fontFamily: WP_FONT,
          overflow: 'hidden',
          color: WP_TEXT,
        }}
      >
        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '14px 20px', borderBottom: `1px solid ${WP_BORDER_SUBTLE}`,
          background: '#ffffff',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Share2 style={{ width: 18, height: 18, color: WP_BLUE, flexShrink: 0 }} />
            <span style={{ fontSize: 15, fontWeight: 600, color: WP_TEXT, fontFamily: WP_FONT }}>Share Playground</span>
          </div>
          <button
            onClick={onClose} disabled={saving}
            style={{
              width: 28, height: 28, border: 'none', background: 'transparent',
              borderRadius: '50%', cursor: 'pointer', color: WP_TEXT_MUTED,
              display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0,
            }}
            onMouseOver={e => (e.currentTarget.style.background = WP_BG)}
            onMouseOut={e => (e.currentTarget.style.background = 'transparent')}
          >
            <X style={{ width: 16, height: 16 }} />
          </button>
        </div>

        {step === 'form' ? (
          <>
            <div style={{ padding: '20px 20px 12px', display: 'flex', flexDirection: 'column', gap: 16, background: '#ffffff' }}>
              {/* URL */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                  <label style={{ fontSize: 13, fontWeight: 500, color: WP_TEXT, fontFamily: WP_FONT }}>
                    Playground URL <span style={{ color: '#d63638' }}>*</span>
                  </label>
                  {currentPlaygroundUrl && (
                    <button
                      onClick={() => setUrl(currentPlaygroundUrl)}
                      style={{ fontSize: 12, color: WP_BLUE, background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center', gap: 3, fontFamily: WP_FONT }}
                    >
                      <Link style={{ width: 11, height: 11 }} />
                      Use current blueprint URL
                    </button>
                  )}
                </div>
                <textarea
                  value={url} onChange={e => setUrl(e.target.value)} disabled={saving} rows={3}
                  placeholder="https://playground.wordpress.net/#..."
                  style={{ ...inputStyle, fontFamily: 'monospace', resize: 'vertical' }}
                  onFocus={e => (e.target.style.borderColor = WP_BLUE)}
                  onBlur={e => (e.target.style.borderColor = WP_INPUT_BORDER)}
                />
                {urlWarning && (
                  <p style={{ fontSize: 12, color: '#996800', margin: '4px 0 0', display: 'flex', alignItems: 'flex-start', gap: 4, fontFamily: WP_FONT }}>
                    <AlertTriangle style={{ width: 13, height: 13, marginTop: 1, flexShrink: 0 }} />
                    {urlWarning}
                  </p>
                )}
                <p style={{ fontSize: 11, color: '#757575', margin: '4px 0 0', fontFamily: WP_FONT }}>
                  Paste the full URL — the #fragment will be preserved exactly.
                </p>
              </div>

              {/* Title */}
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: WP_TEXT, marginBottom: 6, fontFamily: WP_FONT }}>
                  Title <span style={{ color: WP_TEXT_MUTED, fontWeight: 400 }}>(optional)</span>
                </label>
                <input
                  type="text" value={title} onChange={e => setTitle(e.target.value)}
                  disabled={saving} placeholder="My WordPress Setup" style={inputStyle}
                  onFocus={e => (e.target.style.borderColor = WP_BLUE)}
                  onBlur={e => (e.target.style.borderColor = WP_INPUT_BORDER)}
                />
              </div>

              {/* Description */}
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: WP_TEXT, marginBottom: 6, fontFamily: WP_FONT }}>
                  Description <span style={{ color: WP_TEXT_MUTED, fontWeight: 400 }}>(optional)</span>
                </label>
                <textarea
                  value={description} onChange={e => setDescription(e.target.value)}
                  disabled={saving} rows={2} placeholder="What does this playground include?"
                  style={{ ...inputStyle, resize: 'vertical' }}
                  onFocus={e => (e.target.style.borderColor = WP_BLUE)}
                  onBlur={e => (e.target.style.borderColor = WP_INPUT_BORDER)}
                />
              </div>

              {blueprintJson && (
                <div style={{
                  display: 'flex', alignItems: 'flex-start', gap: 8, padding: '10px 12px',
                  background: '#f0f6fc', border: '1px solid #b8d3f4', borderRadius: 2,
                  fontSize: 12, color: '#135e96', fontFamily: WP_FONT,
                }}>
                  <Check style={{ width: 13, height: 13, marginTop: 1, flexShrink: 0 }} />
                  Blueprint JSON detected — link will use{' '}
                  <code style={{ fontFamily: 'monospace', background: '#dce8f5', padding: '0 3px', borderRadius: 2 }}>blueprint-url</code>{' '}
                  for best compatibility.
                </div>
              )}

              {error && (
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 8, padding: '10px 12px',
                  background: '#fcf0f1', border: '1px solid #f0b8ba', borderRadius: 2,
                  fontSize: 13, color: '#d63638', fontFamily: WP_FONT,
                }}>
                  <AlertTriangle style={{ width: 14, height: 14, flexShrink: 0 }} />
                  {error}
                </div>
              )}
            </div>

            {/* Footer */}
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 10,
              padding: '14px 20px', borderTop: `1px solid ${WP_BORDER_SUBTLE}`, background: '#ffffff',
            }}>
              <button
                onClick={onClose} disabled={saving} style={btnSecondary}
                onMouseOver={e => (e.currentTarget.style.background = '#f0f6fc')}
                onMouseOut={e => (e.currentTarget.style.background = '#fff')}
              >
                Cancel
              </button>
              <button
                onClick={handleCreate} disabled={saving || !url.trim()}
                style={{ ...btnPrimary, opacity: saving || !url.trim() ? 0.6 : 1, cursor: saving || !url.trim() ? 'not-allowed' : 'pointer' }}
                onMouseOver={e => { if (!saving && url.trim()) e.currentTarget.style.background = WP_BLUE_HOVER; }}
                onMouseOut={e => { if (!saving && url.trim()) e.currentTarget.style.background = WP_BLUE; }}
              >
                {saving
                  ? <><Loader2 style={{ width: 13, height: 13 }} className="animate-spin" /> Creating…</>
                  : <><Link style={{ width: 13, height: 13 }} /> Create short link</>}
              </button>
            </div>
          </>
        ) : (
          <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 16, background: '#ffffff' }}>
            {/* Success banner */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px',
              background: '#edfaef', border: '1px solid #a3e6ad', borderRadius: 2,
            }}>
              <div style={{
                width: 32, height: 32, background: '#00a32a', borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              }}>
                <Check style={{ width: 16, height: 16, color: '#fff' }} />
              </div>
              <div>
                <p style={{ fontSize: 14, fontWeight: 600, color: WP_TEXT, margin: 0, fontFamily: WP_FONT }}>Short link created!</p>
                <p style={{ fontSize: 12, color: '#2a6430', margin: 0, fontFamily: WP_FONT }}>Your Playground is ready to share.</p>
              </div>
            </div>

            {/* Short URL */}
            <div>
              <p style={{ fontSize: 11, fontWeight: 600, color: WP_TEXT_MUTED, textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 8px', fontFamily: WP_FONT }}>
                Your short link
              </p>
              <div style={{ display: 'flex', gap: 8 }}>
                <div style={{
                  flex: 1, padding: '9px 12px', background: WP_BG,
                  border: `1px solid ${WP_BORDER_SUBTLE}`, borderRadius: 2,
                  fontSize: 13, fontFamily: 'monospace', color: WP_BLUE,
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                }}>
                  {shortUrl}
                </div>
                <button
                  onClick={handleCopy}
                  style={{
                    padding: '9px 14px', fontSize: 13, fontWeight: 500, fontFamily: WP_FONT,
                    background: '#fff', color: copied ? '#00a32a' : WP_BLUE,
                    border: `1px solid ${copied ? '#a3e6ad' : WP_BORDER}`,
                    borderRadius: 2, cursor: 'pointer', flexShrink: 0,
                    display: 'flex', alignItems: 'center', gap: 6, transition: 'all 0.15s',
                  }}
                >
                  {copied
                    ? <><Check style={{ width: 13, height: 13 }} /> Copied!</>
                    : <><Copy style={{ width: 13, height: 13 }} /> Copy</>}
                </button>
              </div>
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: 10 }}>
              <a
                href={shortUrl} target="_blank" rel="noopener noreferrer"
                style={{ ...btnPrimary, flex: 1, justifyContent: 'center', textDecoration: 'none' }}
                onMouseOver={e => (e.currentTarget.style.background = WP_BLUE_HOVER)}
                onMouseOut={e => (e.currentTarget.style.background = WP_BLUE)}
              >
                <ExternalLink style={{ width: 13, height: 13 }} /> Open Playground
              </a>
              <button
                onClick={onClose}
                style={{ ...btnSecondary, flex: 1, justifyContent: 'center' }}
                onMouseOver={e => (e.currentTarget.style.background = '#f0f6fc')}
                onMouseOut={e => (e.currentTarget.style.background = '#fff')}
              >
                Done
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
