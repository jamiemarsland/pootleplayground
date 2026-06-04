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
    border: '1px solid var(--border-input)', borderRadius: 2,
    color: 'var(--text-primary)', background: 'var(--bg-surface)', outline: 'none', boxSizing: 'border-box',
  };
  const btnPrimary: React.CSSProperties = {
    padding: '7px 18px', fontSize: 13, fontWeight: 500, background: 'var(--accent)',
    color: '#fff', border: '1px solid var(--accent)', borderRadius: 999,
    cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6,
    fontFamily: WP_FONT, transition: 'background 0.15s',
  };
  const btnSecondary: React.CSSProperties = {
    padding: '7px 18px', fontSize: 13, fontWeight: 500, background: 'var(--bg-surface)',
    color: 'var(--accent)', border: '1px solid var(--accent)', borderRadius: 999,
    cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6,
    fontFamily: WP_FONT, transition: 'background 0.15s',
  };

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 16, background: 'rgba(0,0,0,0.6)',
      }}
    >
      <div
        style={{
          width: '100%', maxWidth: 520,
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-muted)',
          borderRadius: 3,
          boxShadow: '0 3px 20px rgba(0,0,0,0.3)',
          fontFamily: WP_FONT,
          overflow: 'hidden',
          color: 'var(--text-primary)',
        }}
      >
        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '14px 20px', borderBottom: '1px solid var(--border)',
          background: 'var(--bg-surface)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Share2 style={{ width: 18, height: 18, color: 'var(--accent)', flexShrink: 0 }} />
            <span style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)', fontFamily: WP_FONT }}>Share Playground</span>
          </div>
          <button
            onClick={onClose} disabled={saving}
            style={{
              width: 28, height: 28, border: 'none', background: 'transparent',
              borderRadius: '50%', cursor: 'pointer', color: 'var(--text-tertiary)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0,
            }}
            onMouseOver={e => (e.currentTarget.style.background = 'var(--bg-hover)')}
            onMouseOut={e => (e.currentTarget.style.background = 'transparent')}
          >
            <X style={{ width: 16, height: 16 }} />
          </button>
        </div>

        {step === 'form' ? (
          <>
            <div style={{ padding: '20px 20px 12px', display: 'flex', flexDirection: 'column', gap: 16, background: 'var(--bg-surface)' }}>
              {/* URL */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                  <label style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)', fontFamily: WP_FONT }}>
                    Playground URL <span style={{ color: 'var(--error)' }}>*</span>
                  </label>
                  {currentPlaygroundUrl && (
                    <button
                      onClick={() => setUrl(currentPlaygroundUrl)}
                      style={{ fontSize: 12, color: 'var(--accent)', background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center', gap: 3, fontFamily: WP_FONT }}
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
                  onFocus={e => (e.target.style.borderColor = 'var(--accent)')}
                  onBlur={e => (e.target.style.borderColor = 'var(--border-input)')}
                />
                {urlWarning && (
                  <p style={{ fontSize: 12, color: 'var(--warning)', margin: '4px 0 0', display: 'flex', alignItems: 'flex-start', gap: 4, fontFamily: WP_FONT }}>
                    <AlertTriangle style={{ width: 13, height: 13, marginTop: 1, flexShrink: 0 }} />
                    {urlWarning}
                  </p>
                )}
                <p style={{ fontSize: 11, color: 'var(--text-muted)', margin: '4px 0 0', fontFamily: WP_FONT }}>
                  Paste the full URL — the #fragment will be preserved exactly.
                </p>
              </div>

              {/* Title */}
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: 'var(--text-primary)', marginBottom: 6, fontFamily: WP_FONT }}>
                  Title <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(optional)</span>
                </label>
                <input
                  type="text" value={title} onChange={e => setTitle(e.target.value)}
                  disabled={saving} placeholder="My WordPress Setup" style={inputStyle}
                  onFocus={e => (e.target.style.borderColor = 'var(--accent)')}
                  onBlur={e => (e.target.style.borderColor = 'var(--border-input)')}
                />
              </div>

              {/* Description */}
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: 'var(--text-primary)', marginBottom: 6, fontFamily: WP_FONT }}>
                  Description <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(optional)</span>
                </label>
                <textarea
                  value={description} onChange={e => setDescription(e.target.value)}
                  disabled={saving} rows={2} placeholder="What does this playground include?"
                  style={{ ...inputStyle, resize: 'vertical' }}
                  onFocus={e => (e.target.style.borderColor = 'var(--accent)')}
                  onBlur={e => (e.target.style.borderColor = 'var(--border-input)')}
                />
              </div>

              {blueprintJson && (
                <div style={{
                  display: 'flex', alignItems: 'flex-start', gap: 8, padding: '10px 12px',
                  background: 'var(--accent-bg)', border: '1px solid var(--accent-border)', borderRadius: 2,
                  fontSize: 12, color: 'var(--accent)', fontFamily: WP_FONT,
                }}>
                  <Check style={{ width: 13, height: 13, marginTop: 1, flexShrink: 0 }} />
                  Blueprint JSON detected — link will use{' '}
                  <code style={{ fontFamily: 'monospace', background: 'var(--bg-hover)', padding: '0 3px', borderRadius: 2 }}>blueprint-url</code>{' '}
                  for best compatibility.
                </div>
              )}

              {error && (
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 8, padding: '10px 12px',
                  background: 'color-mix(in srgb, var(--error) 10%, transparent)',
                  border: '1px solid color-mix(in srgb, var(--error) 40%, transparent)',
                  borderRadius: 2, fontSize: 13, color: 'var(--error)', fontFamily: WP_FONT,
                }}>
                  <AlertTriangle style={{ width: 14, height: 14, flexShrink: 0 }} />
                  {error}
                </div>
              )}
            </div>

            {/* Footer */}
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 10,
              padding: '14px 20px', borderTop: '1px solid var(--border)', background: 'var(--bg-surface)',
            }}>
              <button
                onClick={onClose} disabled={saving} style={btnSecondary}
                onMouseOver={e => (e.currentTarget.style.background = 'var(--accent-bg)')}
                onMouseOut={e => (e.currentTarget.style.background = 'var(--bg-surface)')}
              >
                Cancel
              </button>
              <button
                onClick={handleCreate} disabled={saving || !url.trim()}
                style={{ ...btnPrimary, opacity: saving || !url.trim() ? 0.6 : 1, cursor: saving || !url.trim() ? 'not-allowed' : 'pointer' }}
                onMouseOver={e => { if (!saving && url.trim()) e.currentTarget.style.background = 'var(--accent-hover)'; }}
                onMouseOut={e => { if (!saving && url.trim()) e.currentTarget.style.background = 'var(--accent)'; }}
              >
                {saving
                  ? <><Loader2 style={{ width: 13, height: 13 }} className="animate-spin" /> Creating…</>
                  : <><Link style={{ width: 13, height: 13 }} /> Create short link</>}
              </button>
            </div>
          </>
        ) : (
          <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 16, background: 'var(--bg-surface)' }}>
            {/* Success banner */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px',
              background: 'color-mix(in srgb, var(--success) 12%, transparent)',
              border: '1px solid color-mix(in srgb, var(--success) 40%, transparent)',
              borderRadius: 2,
            }}>
              <div style={{
                width: 32, height: 32, background: 'var(--success)', borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              }}>
                <Check style={{ width: 16, height: 16, color: '#fff' }} />
              </div>
              <div>
                <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', margin: 0, fontFamily: WP_FONT }}>Short link created!</p>
                <p style={{ fontSize: 12, color: 'var(--success)', margin: 0, fontFamily: WP_FONT }}>Your Playground is ready to share.</p>
              </div>
            </div>

            {/* Short URL */}
            <div>
              <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 8px', fontFamily: WP_FONT }}>
                Your short link
              </p>
              <div style={{ display: 'flex', gap: 8 }}>
                <div style={{
                  flex: 1, padding: '9px 12px', background: 'var(--bg-subtle)',
                  border: '1px solid var(--border)', borderRadius: 2,
                  fontSize: 13, fontFamily: 'monospace', color: 'var(--accent)',
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                }}>
                  {shortUrl}
                </div>
                <button
                  onClick={handleCopy}
                  style={{
                    padding: '9px 14px', fontSize: 13, fontWeight: 500, fontFamily: WP_FONT,
                    background: 'var(--bg-surface)',
                    color: copied ? 'var(--success)' : 'var(--accent)',
                    border: `1px solid ${copied ? 'var(--success)' : 'var(--border-muted)'}`,
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
                onMouseOver={e => (e.currentTarget.style.background = 'var(--accent-hover)')}
                onMouseOut={e => (e.currentTarget.style.background = 'var(--accent)')}
              >
                <ExternalLink style={{ width: 13, height: 13 }} /> Open Playground
              </a>
              <button
                onClick={onClose}
                style={{ ...btnSecondary, flex: 1, justifyContent: 'center' }}
                onMouseOver={e => (e.currentTarget.style.background = 'var(--accent-bg)')}
                onMouseOut={e => (e.currentTarget.style.background = 'var(--bg-surface)')}
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
