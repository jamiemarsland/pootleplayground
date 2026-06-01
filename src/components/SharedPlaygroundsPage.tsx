import React, { useEffect, useState } from 'react';
import { Link2, ExternalLink, Copy, Check, Trash2, ArrowLeft, Loader2, Share2, Calendar, Eye, AlertTriangle, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { getUserId } from '../utils/userManager';

interface SharedPlayground {
  id: string;
  slug: string;
  title: string;
  description: string;
  full_url: string;
  blueprint_json: object | null;
  created_at: string;
  view_count: number;
}

const wpFont = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen-Sans, Ubuntu, Cantarell, "Helvetica Neue", sans-serif';

export function SharedPlaygroundsPage() {
  const navigate = useNavigate();
  const [items, setItems] = useState<SharedPlayground[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copiedSlug, setCopiedSlug] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => { loadItems(); }, []);

  async function loadItems() {
    setLoading(true);
    setError('');
    try {
      const userId = getUserId();
      const { data, error: fetchError } = await supabase
        .from('shared_playgrounds')
        .select('id, slug, title, description, full_url, blueprint_json, created_at, view_count')
        .eq('created_by', userId)
        .order('created_at', { ascending: false });
      if (fetchError) throw fetchError;
      setItems(data || []);
    } catch (err) {
      console.error('Error loading shared playgrounds:', err);
      setError('Failed to load your shared playgrounds.');
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this shared link? It will no longer redirect.')) return;
    setDeletingId(id);
    try {
      const { error: deleteError } = await supabase.from('shared_playgrounds').delete().eq('id', id);
      if (deleteError) throw deleteError;
      setItems(prev => prev.filter(item => item.id !== id));
    } catch (err) {
      console.error('Error deleting:', err);
    } finally {
      setDeletingId(null);
    }
  }

  async function handleCopy(slug: string) {
    const url = `${window.location.origin}/p/${slug}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopiedSlug(slug);
      setTimeout(() => setCopiedSlug(null), 2000);
    } catch { /* ignore */ }
  }

  function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f0f0f1', fontFamily: wpFont }}>
      {/* WP-style top bar */}
      <div
        style={{
          background: '#1d2327',
          height: 32,
          display: 'flex',
          alignItems: 'center',
          paddingLeft: 16,
          paddingRight: 16,
          gap: 16,
          position: 'sticky',
          top: 0,
          zIndex: 100,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div
            style={{
              width: 20,
              height: 20,
              background: '#2271b1',
              borderRadius: 4,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
            </svg>
          </div>
          <span style={{ color: '#a7aaad', fontSize: 13 }}>Pootle Playground</span>
        </div>
      </div>

      {/* Sub-header */}
      <div
        style={{
          background: '#fff',
          borderBottom: '1px solid #dcdcde',
          padding: '0 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          height: 56,
          position: 'sticky',
          top: 32,
          zIndex: 90,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button
            onClick={() => navigate('/')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              padding: '5px 10px',
              background: 'transparent',
              color: '#50575e',
              border: '1px solid #c3c4c7',
              borderRadius: 2,
              fontSize: 13,
              cursor: 'pointer',
              transition: 'all 0.15s',
            }}
            onMouseOver={e => { e.currentTarget.style.background = '#f6f7f7'; }}
            onMouseOut={e => { e.currentTarget.style.background = 'transparent'; }}
          >
            <ArrowLeft style={{ width: 14, height: 14 }} />
            Back to Builder
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Share2 style={{ width: 16, height: 16, color: '#2271b1' }} />
            <h1 style={{ fontSize: 16, fontWeight: 600, color: '#1e1e1e', margin: 0 }}>
              Shared Playgrounds
            </h1>
          </div>
        </div>
        <button
          onClick={() => navigate('/')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: '6px 14px',
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
          <Plus style={{ width: 13, height: 13 }} />
          Create new link
        </button>
      </div>

      <main style={{ maxWidth: 900, margin: '0 auto', padding: '32px 24px' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '64px 0', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, color: '#50575e', fontSize: 14 }}>
            <Loader2 className="animate-spin" style={{ width: 18, height: 18, color: '#2271b1' }} />
            Loading your shared playgrounds…
          </div>
        ) : error ? (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '12px 16px',
              background: '#fcf0f1',
              border: '1px solid #f0b8ba',
              borderRadius: 2,
              color: '#d63638',
              fontSize: 13,
            }}
          >
            <AlertTriangle style={{ width: 16, height: 16, flexShrink: 0 }} />
            {error}
          </div>
        ) : items.length === 0 ? (
          <div
            style={{
              background: '#fff',
              border: '1px solid #c3c4c7',
              borderRadius: 3,
              padding: '64px 32px',
              textAlign: 'center',
            }}
          >
            <div
              style={{
                width: 56,
                height: 56,
                background: '#f6f7f7',
                border: '1px solid #dcdcde',
                borderRadius: 8,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px',
              }}
            >
              <Link2 style={{ width: 24, height: 24, color: '#a7aaad' }} />
            </div>
            <h2 style={{ fontSize: 16, fontWeight: 600, color: '#1e1e1e', margin: '0 0 8px' }}>No shared links yet</h2>
            <p style={{ fontSize: 13, color: '#757575', margin: '0 0 24px' }}>
              Use the "Share Playground" button in the builder to create your first short link.
            </p>
            <button
              onClick={() => navigate('/')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
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
              Go to Builder
            </button>
          </div>
        ) : (
          <div
            style={{
              background: '#fff',
              border: '1px solid #c3c4c7',
              borderRadius: 3,
              overflow: 'hidden',
            }}
          >
            {/* Table header */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 140px 100px 120px',
                padding: '10px 16px',
                background: '#f6f7f7',
                borderBottom: '1px solid #dcdcde',
                fontSize: 11,
                fontWeight: 700,
                color: '#50575e',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}
            >
              <span>Title &amp; Link</span>
              <span>Created</span>
              <span>Views</span>
              <span style={{ textAlign: 'right' }}>Actions</span>
            </div>

            {items.map((item, i) => {
              const shortUrl = `${window.location.origin}/p/${item.slug}`;
              return (
                <div
                  key={item.id}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 140px 100px 120px',
                    padding: '14px 16px',
                    borderBottom: i < items.length - 1 ? '1px solid #f0f0f1' : 'none',
                    alignItems: 'center',
                    transition: 'background 0.1s',
                  }}
                  onMouseOver={e => (e.currentTarget.style.background = '#f9f9f9')}
                  onMouseOut={e => (e.currentTarget.style.background = 'transparent')}
                >
                  {/* Title & link */}
                  <div style={{ minWidth: 0, paddingRight: 16 }}>
                    <div style={{ fontWeight: 600, fontSize: 14, color: '#1e1e1e', marginBottom: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {item.title || <span style={{ color: '#a7aaad', fontWeight: 400, fontStyle: 'italic' }}>Untitled</span>}
                    </div>
                    {item.description && (
                      <div style={{ fontSize: 12, color: '#757575', marginBottom: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {item.description}
                      </div>
                    )}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <a
                        href={shortUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ fontSize: 12, color: '#2271b1', fontFamily: 'monospace', textDecoration: 'none', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 280 }}
                        onMouseOver={e => (e.currentTarget.style.textDecoration = 'underline')}
                        onMouseOut={e => (e.currentTarget.style.textDecoration = 'none')}
                      >
                        {shortUrl}
                      </a>
                      {item.blueprint_json && (
                        <span
                          style={{
                            fontSize: 10,
                            fontWeight: 600,
                            color: '#135e96',
                            background: '#f0f6fc',
                            border: '1px solid #b8d3f4',
                            padding: '1px 6px',
                            borderRadius: 999,
                            flexShrink: 0,
                          }}
                        >
                          blueprint-url
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Date */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 13, color: '#50575e' }}>
                    <Calendar style={{ width: 13, height: 13, color: '#a7aaad' }} />
                    {formatDate(item.created_at)}
                  </div>

                  {/* Views */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 13, color: '#50575e' }}>
                    <Eye style={{ width: 13, height: 13, color: '#a7aaad' }} />
                    {item.view_count.toLocaleString()}
                  </div>

                  {/* Actions */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 6 }}>
                    <button
                      onClick={() => handleCopy(item.slug)}
                      title="Copy short link"
                      style={{
                        padding: '5px 8px',
                        background: '#fff',
                        color: copiedSlug === item.slug ? '#00a32a' : '#2271b1',
                        border: `1px solid ${copiedSlug === item.slug ? '#a3e6ad' : '#c3c4c7'}`,
                        borderRadius: 2,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 4,
                        fontSize: 12,
                        transition: 'all 0.15s',
                      }}
                    >
                      {copiedSlug === item.slug ? <Check style={{ width: 13, height: 13 }} /> : <Copy style={{ width: 13, height: 13 }} />}
                    </button>
                    <a
                      href={shortUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      title="Open playground"
                      style={{
                        padding: '5px 8px',
                        background: '#fff',
                        color: '#2271b1',
                        border: '1px solid #c3c4c7',
                        borderRadius: 2,
                        display: 'flex',
                        alignItems: 'center',
                        fontSize: 12,
                        textDecoration: 'none',
                        transition: 'all 0.15s',
                      }}
                    >
                      <ExternalLink style={{ width: 13, height: 13 }} />
                    </a>
                    <button
                      onClick={() => handleDelete(item.id)}
                      disabled={deletingId === item.id}
                      title="Delete link"
                      style={{
                        padding: '5px 8px',
                        background: '#fff',
                        color: '#d63638',
                        border: '1px solid #c3c4c7',
                        borderRadius: 2,
                        cursor: deletingId === item.id ? 'not-allowed' : 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        fontSize: 12,
                        opacity: deletingId === item.id ? 0.5 : 1,
                        transition: 'all 0.15s',
                      }}
                    >
                      {deletingId === item.id
                        ? <Loader2 className="animate-spin" style={{ width: 13, height: 13 }} />
                        : <Trash2 style={{ width: 13, height: 13 }} />}
                    </button>
                  </div>
                </div>
              );
            })}

            <div
              style={{
                padding: '10px 16px',
                borderTop: '1px solid #dcdcde',
                background: '#f6f7f7',
                fontSize: 12,
                color: '#757575',
              }}
            >
              {items.length} link{items.length !== 1 ? 's' : ''}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
